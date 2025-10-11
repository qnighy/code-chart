import { publicFetch } from "@qnighy/internal-public-fetch";

import { chunkNameOf, type ChunkData } from "./chunk.ts";
import { decodeChunkData } from "./chunk-protobuf.ts";

/**
 * In the code chart, the Unicode Character Database (UCD) is reorganized and
 * split into smaller chunks for locality.
 *
 * This class manages a read-only set of chunks.
 */
export class Chunks {
  cacheSize = 3;

  chunks: Map<number, Promise<ChunkData>> = new Map();

  async getChunk(chunkIndex: number): Promise<ChunkData> {
    const existing = this.chunks.get(chunkIndex);
    if (existing != null) {
      // LRU
      this.chunks.delete(chunkIndex);
      this.chunks.set(chunkIndex, existing);
      return await existing;
    }
    const promise = this._getChunk(chunkIndex);
    this.chunks.set(chunkIndex, promise);
    this.#evictChunks();
    return await promise;
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
    return decodeChunkData(await resp.bytes());
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
