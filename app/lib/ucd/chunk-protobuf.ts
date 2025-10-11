import {
  fieldAsSubmessage,
  fieldAsUint32,
  ProtoReader,
} from "../protobuf/reader";
import { ProtoWriter } from "../protobuf/writer";
import {
  decodeCharacterData,
  encodeCharacterData,
} from "./character-data-protobuf";
import type { ChunkData } from "./chunk";

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
