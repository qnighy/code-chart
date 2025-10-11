/**
 * The number of code points, including those unassigned, in each chunk.
 */
export const CHUNK_SIZE = 256;

export function chunkIndexOf(codePoint: number): number {
  return Math.floor(codePoint / CHUNK_SIZE);
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
