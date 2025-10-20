import {
  decodeCharacterData,
  type CharacterData,
} from "./proto/character_data_pb";
import type { ChunkData } from "./proto/chunk_pb";

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

export function getCharacterInChunk(
  chunk: ChunkData,
  codePoint: number,
): CharacterData | undefined {
  const chunkIndex = chunkIndexOf(codePoint);
  const [chunkStart, chunkEnd] = chunkRangeOf(chunkIndex);
  if (codePoint < chunkStart || codePoint >= chunkEnd) {
    throw new RangeError("Code point out of chunk range");
  }

  return chunk.characters.find((charData) => charData.codePoint === codePoint);
}

export function getCharacterInChunkOrCreate(
  chunk: ChunkData,
  codePoint: number,
): CharacterData {
  const chunkIndex = chunkIndexOf(codePoint);
  const [chunkStart, chunkEnd] = chunkRangeOf(chunkIndex);
  if (codePoint < chunkStart || codePoint >= chunkEnd) {
    throw new RangeError("Code point out of chunk range");
  }

  let pos = chunk.characters.findIndex(
    (charData) => charData.codePoint >= codePoint,
  );
  if (pos === -1) {
    pos = chunk.characters.length;
  }
  if (chunk.characters[pos]?.codePoint === codePoint) {
    return chunk.characters[pos];
  }

  const newCharData: CharacterData = decodeCharacterData(new Uint8Array());
  newCharData.codePoint = codePoint;
  chunk.characters.splice(pos, 0, newCharData);
  return newCharData;
}
