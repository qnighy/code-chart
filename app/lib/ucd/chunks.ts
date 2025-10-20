import { publicFetch } from "@qnighy/internal-public-fetch";

import { chunkNameOf } from "./chunk.ts";
import { decodeChunkData, type ChunkData } from "./proto/chunk_pb.ts";

/**
 * In the code chart, the Unicode Character Database (UCD) is reorganized and
 * split into smaller chunks for locality.
 *
 * This class manages a read-only set of chunks.
 */
export class Chunks {
  cacheSize = 3;

  chunks: Map<number, Promise<ChunkData>> = new Map();

  // Not using `async` here so that the same Promise instance can be reused.
  getChunk(chunkIndex: number): Promise<ChunkData> {
    const existing = this.chunks.get(chunkIndex);
    if (existing != null) {
      // LRU
      this.chunks.delete(chunkIndex);
      this.chunks.set(chunkIndex, existing);
      return existing;
    }
    const promise = this._getChunk(chunkIndex);
    this.chunks.set(chunkIndex, promise);
    this.#evictChunks();
    return promise;
  }

  private async _getChunk(chunkIndex: number): Promise<ChunkData> {
    const resp = await publicFetch(
      `/data/ucd/chunks/${chunkNameOf(chunkIndex)}`,
    );
    if (!resp.ok) {
      throw new Error(
        `Failed to fetch chunk ${chunkIndex}: ${resp.status} ${resp.statusText}`,
      );
    }
    const decoded = decodeChunkData(await resp.bytes());
    // console.log("chunk data =", decoded);
    return decoded;
  }

  #evictChunks() {
    if (this.chunks.size <= this.cacheSize) {
      return;
    }

    for (const chunkIndex of this.chunks.keys()) {
      this.chunks.delete(chunkIndex);
      if (this.chunks.size <= this.cacheSize) {
        break;
      }
    }
  }
}
