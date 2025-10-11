import fs from "fs/promises";

import type { ChunkData } from "./chunk.ts";

/**
 * In the code chart, the Unicode Character Database (UCD) is reorganized and
 * split into smaller chunks for locality.
 *
 * This class manages a writable set of chunks with write-back caching.
 */
export class WritableChunks {
  #path: string;

  #cacheSize = 3;
  #chunks: Map<number, ChunkState> = new Map();

  constructor(path: string) {
    this.#path = path;
  }

  get path(): string {
    return this.#path;
  }

  get cacheSize(): number {
    return this.#cacheSize;
  }

  set cacheSize(value: number) {
    this.#cacheSize = value;
  }

  async openChunk(chunkIndex: number): Promise<ChunkHandle> {
    let state = this.#chunks.get(chunkIndex);
    if (state == null) {
      state = {
        rc: 0,
        io: null,
        data: null,
        dirty: false,
      };
      this.#chunks.set(chunkIndex, state);
    } else {
      // LRU
      this.#chunks.delete(chunkIndex);
      this.#chunks.set(chunkIndex, state);
    }
    state.rc++;
    try {
      while (state.data == null && state.io != null) {
        await state.io;
      }
      // Here we have state.data != null || state.io == null
      if (state.data == null) {
        // We have state.io == null. Do the I/O to read the chunk.
        await locked(state, async () => {
          this.#evictChunks();
          state.data = await this.#readChunk(chunkIndex);
        });
      }
      // At this point, state.data != null
      //
      // Increment it again because the initial rc++ will be cancelled by
      // the finally block below.
      state.rc++;
      return new ChunkHandle(this, chunkIndex, state);
    } finally {
      state.rc--;
    }
  }

  #chunkPath(chunkIndex: number): string {
    return `${this.#path}/chunk-${chunkIndex.toString().padStart(4, "0")}.json`;
  }

  async #readChunk(chunkIndex: number): Promise<ChunkData> {
    const filePath = this.#chunkPath(chunkIndex);
    try {
      const text = await fs.readFile(filePath, "utf-8");
      return JSON.parse(text) as ChunkData;
    } catch (error) {
      // Handle NOENT
      if (
        error instanceof Error &&
        (error as NodeJS.ErrnoException).code === "ENOENT"
      ) {
        return {} as ChunkData;
      }
      throw error;
    }
  }

  async #writeChunk(chunkIndex: number, chunk: ChunkData): Promise<void> {
    const filePath = this.#chunkPath(chunkIndex);
    const text = JSON.stringify(chunk);
    await fs.mkdir(this.#path, { recursive: true });
    await fs.writeFile(filePath, text, "utf-8");
  }

  _releaseChunk(chunkIndex: number): void {
    const state = this.#chunks.get(chunkIndex);
    if (state == null || state.rc <= 0) {
      throw new ReferenceError("Chunk is not opened");
    }
    state.rc--;

    // Even if rc reaches 0, we don't immediately write back the chunk.
    // However, if the cache size is exceeded, we want to try evicting
    // the chunk.
    if (state.rc <= 0) {
      this.#evictChunks();
    }
  }

  #evictChunks(): void {
    let numNonEvictingChunks = 0;
    for (const state of this.#chunks.values()) {
      if (state.rc > 0 || !state.io) {
        numNonEvictingChunks++;
      }
    }
    let excess = numNonEvictingChunks - this.#cacheSize;
    if (excess <= 0) {
      return;
    }

    for (const chunkIndex of this.#chunks.keys()) {
      const state = this.#chunks.get(chunkIndex);
      if (state == null || state.rc > 0 || state.io != null) {
        continue;
      }
      this.#evictChunk(chunkIndex, state);
      excess--;
      if (excess <= 0) {
        break;
      }
    }
  }

  #evictChunk(chunkIndex: number, state: ChunkState): void {
    // We have state.rc == 0; it can safely be evicted.
    if (!state.dirty || state.data == null) {
      // We don't need to write back the chunk. Just delete it immediately.
      this.#chunks.delete(chunkIndex);
      return;
    }
    // Write back the chunk if it's dirty.
    // We don't await here; the write-back is done in the background.
    locked(state, async () => {
      // Unflag dirty first in case someone acquires the chunk while we're
      // writing it back.
      state.dirty = false;
      await this.#writeChunk(chunkIndex, state.data!);
      // Delete the chunk from memory only if it hasn't been acquired again.
      if (state.rc <= 0) {
        state.data = null;
        this.#chunks.delete(chunkIndex);
      }
    }).catch(() => {
      // The error should have been handled in the lock's awaiter.
    });
  }

  async disposeAsync(): Promise<void> {
    let cont = true;
    while (cont) {
      cont = false;
      let awaited = false;
      for (const [chunkIndex, state] of this.#chunks) {
        if (state.io != null) {
          awaited = true;
          cont = true;
          await state.io;
        } else if (state.rc > 0) {
          cont = true;
        } else if (state.dirty) {
          this.#evictChunk(chunkIndex, state);
          awaited = true;
          cont = true;
        }
      }
      if (cont && !awaited) {
        throw new ReferenceError("stuck in disposeAsync");
      }
    }
  }
}

type ChunkState = {
  rc: number;
  io: Promise<void> | null;
  data: ChunkData | null;
  dirty: boolean;
};

async function locked<T>(state: ChunkState, fn: () => Promise<T>): Promise<T> {
  if (state.io != null) {
    throw new ReferenceError("Chunk is already locked");
  }
  // Equivalent to Promise.withResolvers
  let resolve!: (value: void | PromiseLike<void>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<void>(async (resolve2, reject2) => {
    resolve = resolve2;
    reject = reject2;
  });
  state.io = promise as Promise<void>;
  try {
    const result = await fn();
    resolve();
    state.io = null;
    return result;
  } catch (error) {
    state.io = null;
    reject(error);
    throw error;
  }
}

export class ChunkHandle {
  #parent: WritableChunks;
  #chunkIndex: number;
  #state: ChunkState;

  constructor(parent: WritableChunks, chunkIndex: number, state: ChunkState) {
    this.#parent = parent;
    this.#chunkIndex = chunkIndex;
    this.#state = state;
  }

  dispose(): void {
    this.#parent._releaseChunk(this.#chunkIndex);
  }

  get data(): ChunkData {
    if (this.#state.data == null) {
      throw new ReferenceError("Chunk data is not loaded");
    }
    return this.#state.data;
  }

  get dirty(): boolean {
    return this.#state.dirty;
  }

  set dirty(value: boolean) {
    this.#state.dirty ||= value;
  }
}
