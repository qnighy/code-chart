import {
  fieldAsString,
  fieldAsSubmessage,
  fieldAsUint32,
  ProtoReader,
} from "../protobuf/reader";
import { ProtoWriter } from "../protobuf/writer";
import type { CharacterData, ChunkData } from "./chunk";

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

export function decodeCharacterData(buf: Uint8Array): CharacterData {
  const data: CharacterData = {
    codePoint: 0,
    name: "",
  };
  for (const field of new ProtoReader(buf)) {
    switch (field.number) {
      case 1:
        data.codePoint = fieldAsUint32(field);
        break;
      case 2:
        data.name = fieldAsString(field);
        break;
    }
  }
  return data;
}

export function encodeCharacterData(data: CharacterData): Uint8Array {
  const writer = new ProtoWriter();
  writer.writeUint32Field(1, data.codePoint);
  writer.writeStringField(2, data.name);
  return writer.toUint8Array();
}
