// This file is manually transcribed from the protobuf definition.
// When updating this file, please also update the corresponding
// .proto file to reflect any changes to the protocol.

import {
  fieldAsSubmessage,
  fieldAsUint32,
  ProtoReader,
} from "../../protobuf/reader";
import { ProtoWriter } from "../../protobuf/writer";
import {
  decodeCharacterData,
  encodeCharacterData,
  type CharacterData,
} from "./character_data_pb";

/**
 * A chunk is a set of 256 consecutive Unicode code points.
 */
export type ChunkData = {
  /**
   * Index of the chunk (0-based)
   */
  chunkIndex: number;
  /**
   * The character data entries in this chunk,
   * not necessarily containing all the 256 code points,
   * in ascending order of code points.
   */
  characters: CharacterData[];
};

export function decodeChunkData(buf: Uint8Array): ChunkData {
  const data: ChunkData = {
    chunkIndex: 0,
    characters: [],
  };
  for (const field of new ProtoReader(buf)) {
    switch (field.number) {
      case 1:
        data.chunkIndex = fieldAsUint32(field);
        break;
      case 2:
        data.characters.push(fieldAsSubmessage(field, decodeCharacterData));
        break;
    }
  }
  return data;
}

export function encodeChunkData(data: ChunkData): Uint8Array {
  const writer = new ProtoWriter();
  writer.writeUint32Field(1, data.chunkIndex);
  for (const charData of data.characters) {
    writer.writeSubmessageField(2, charData, encodeCharacterData);
  }
  return writer.toUint8Array();
}
