import {
  fieldAsEnum,
  fieldAsString,
  fieldAsUint32,
  ProtoReader,
  type EnumValueMap,
} from "../protobuf/reader";
import { ProtoWriter, type EnumNameMap } from "../protobuf/writer";
import type { CharacterData, GeneralCategory } from "./character-data";

export function decodeCharacterData(buf: Uint8Array): CharacterData {
  const data: CharacterData = {
    codePoint: 0,
    name: "",
    generalCategory: "GENERAL_CATEGORY_UNSPECIFIED",
  };
  for (const field of new ProtoReader(buf)) {
    switch (field.number) {
      case 1:
        data.codePoint = fieldAsUint32(field);
        break;
      case 2:
        data.name = fieldAsString(field);
        break;
      case 3:
        data.generalCategory = fieldAsEnum(field, GeneralCategoryValueMap);
        break;
    }
  }
  return data;
}

export function encodeCharacterData(data: CharacterData): Uint8Array {
  const writer = new ProtoWriter();
  writer.writeUint32Field(1, data.codePoint);
  writer.writeStringField(2, data.name);
  writer.writeEnumField(3, data.generalCategory, GeneralCategoryNameMap);
  return writer.toUint8Array();
}

export const GeneralCategoryValueMap: EnumValueMap<GeneralCategory> = {
  0: "GENERAL_CATEGORY_UNSPECIFIED",
  1: "UPPERCASE_LETTER",
  2: "LOWERCASE_LETTER",
  3: "TITLECASE_LETTER",
  4: "MODIFIER_LETTER",
  5: "OTHER_LETTER",
  6: "NONSPACING_MARK",
  7: "SPACING_MARK",
  8: "ENCLOSING_MARK",
  9: "DECIMAL_NUMBER",
  10: "LETTER_NUMBER",
  11: "OTHER_NUMBER",
  12: "CONNECTOR_PUNCTUATION",
  13: "DASH_PUNCTUATION",
  14: "OPEN_PUNCTUATION",
  15: "CLOSE_PUNCTUATION",
  16: "INITIAL_PUNCTUATION",
  17: "FINAL_PUNCTUATION",
  18: "OTHER_PUNCTUATION",
  19: "MATH_SYMBOL",
  20: "CURRENCY_SYMBOL",
  21: "MODIFIER_SYMBOL",
  22: "OTHER_SYMBOL",
  23: "SPACE_SEPARATOR",
  24: "LINE_SEPARATOR",
  25: "PARAGRAPH_SEPARATOR",
  26: "CONTROL",
  27: "FORMAT",
  28: "SURROGATE",
  29: "PRIVATE_USE",
  30: "UNASSIGNED",
};

export const GeneralCategoryNameMap: EnumNameMap<GeneralCategory> = {
  GENERAL_CATEGORY_UNSPECIFIED: 0,
  UPPERCASE_LETTER: 1,
  LOWERCASE_LETTER: 2,
  TITLECASE_LETTER: 3,
  MODIFIER_LETTER: 4,
  OTHER_LETTER: 5,
  NONSPACING_MARK: 6,
  SPACING_MARK: 7,
  ENCLOSING_MARK: 8,
  DECIMAL_NUMBER: 9,
  LETTER_NUMBER: 10,
  OTHER_NUMBER: 11,
  CONNECTOR_PUNCTUATION: 12,
  DASH_PUNCTUATION: 13,
  OPEN_PUNCTUATION: 14,
  CLOSE_PUNCTUATION: 15,
  INITIAL_PUNCTUATION: 16,
  FINAL_PUNCTUATION: 17,
  OTHER_PUNCTUATION: 18,
  MATH_SYMBOL: 19,
  CURRENCY_SYMBOL: 20,
  MODIFIER_SYMBOL: 21,
  OTHER_SYMBOL: 22,
  SPACE_SEPARATOR: 23,
  LINE_SEPARATOR: 24,
  PARAGRAPH_SEPARATOR: 25,
  CONTROL: 26,
  FORMAT: 27,
  SURROGATE: 28,
  PRIVATE_USE: 29,
  UNASSIGNED: 30,
};
