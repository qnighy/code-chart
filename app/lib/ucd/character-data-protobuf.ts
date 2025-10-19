import { fieldAsString, fieldAsUint32, ProtoReader } from "../protobuf/reader";
import { ProtoWriter } from "../protobuf/writer";
import {
  GENERAL_CATEGORY_UNSPECIFIED,
  NAME_DERIVATION_UNSPECIFIED,
  type CharacterData,
} from "./character-data";

export function decodeCharacterData(buf: Uint8Array): CharacterData {
  const data: CharacterData = {
    codePoint: 0,
    name: "",
    nameDerivation: NAME_DERIVATION_UNSPECIFIED,
    generalCategory: GENERAL_CATEGORY_UNSPECIFIED,
  };
  for (const field of new ProtoReader(buf)) {
    switch (field.number) {
      case 1:
        data.codePoint = fieldAsUint32(field);
        break;
      case 2:
        data.name = fieldAsString(field);
        break;
      case 4:
        data.nameDerivation = fieldAsUint32(field);
        break;
      case 3:
        data.generalCategory = fieldAsUint32(field);
        break;
    }
  }
  return data;
}

export function encodeCharacterData(data: CharacterData): Uint8Array {
  const writer = new ProtoWriter();
  writer.writeUint32Field(1, data.codePoint);
  writer.writeStringField(2, data.name);
  writer.writeUint32Field(4, data.nameDerivation);
  writer.writeUint32Field(3, data.generalCategory);
  return writer.toUint8Array();
}
