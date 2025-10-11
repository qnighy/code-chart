/**
 * The number of code points, including those unassigned, in each chunk.
 */
export const CHUNK_SIZE = 256;

export function chunkIndexOf(codePoint: number): number {
  return Math.floor(codePoint / CHUNK_SIZE);
}

export function chunkNameOf(chunkIndex: number): string {
  return `chunk${CHUNK_SIZE}-${chunkIndex.toString().padStart(4, "0")}.json`;
}

export type ChunkData = {
  /**
   * Index of the chunk (0-based)
   */
  chunkIndex: number;
  characters: CharacterData[];
};

export type CharacterData = {
  codePoint: number;
  name: string;
};
