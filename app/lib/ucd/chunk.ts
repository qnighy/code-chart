/**
 * The number of code points, including those unassigned, in each chunk.
 */
export const CHUNK_SIZE = 256;

export function chunkIndexOf(codePoint: number): number {
  return Math.floor(codePoint / CHUNK_SIZE);
}

export function chunkRangeOf(chunkIndex: number): readonly [number, number] {
  const start = chunkIndex * CHUNK_SIZE;
  const end = start + CHUNK_SIZE;
  return [start, end];
}

export function chunkNameOf(chunkIndex: number): string {
  return `chunk${CHUNK_SIZE}-${chunkIndex.toString().padStart(4, "0")}.binpb`;
}
