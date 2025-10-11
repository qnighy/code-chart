/**
 * The number of code points, including those unassigned, in each chunk.
 */
export const CHUNK_SIZE = 256;

export function chunkIndexOf(codePoint: number): number {
  return Math.floor(codePoint / CHUNK_SIZE);
}

export function chunkNameOf(chunkIndex: number): string {
  return `chunk${CHUNK_SIZE}-${chunkIndex.toString().padStart(4, "0")}.binpb`;
}

export type ChunkData = {
  /**
   * Index of the chunk (0-based)
   *
   * ```protobuf
   * uint32 chunk_index = 1;
   * ```
   */
  chunkIndex: number;
  /**
   * ```protobuf
   * repeated CharacterData characters = 2;
   * ```
   */
  characters: CharacterData[];
};

export type CharacterData = {
  /**
   * ```protobuf
   * uint32 code_point = 1;
   * ```
   */
  codePoint: number;
  /**
   * ```protobuf
   * string name = 2;
   * ```
   */
  name: string;
};
