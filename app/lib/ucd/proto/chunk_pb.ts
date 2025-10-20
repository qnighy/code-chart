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
  /**
   * Describes absense of characters of certain property values
   * in a contiguous range of code points before this chunk.
   */
  backwardSkips: SkipInfo | null;
  /**
   * Describes absense of characters of certain property values
   * in a contiguous range of code points after this chunk.
   */
  forwardSkips: SkipInfo | null;
};

export function decodeChunkData(buf: Uint8Array): ChunkData {
  const data: ChunkData = {
    chunkIndex: 0,
    characters: [],
    backwardSkips: null,
    forwardSkips: null,
  };
  for (const field of new ProtoReader(buf)) {
    switch (field.number) {
      case 1:
        data.chunkIndex = fieldAsUint32(field);
        break;
      case 2:
        data.characters.push(fieldAsSubmessage(field, decodeCharacterData));
        break;
      case 3:
        data.backwardSkips = fieldAsSubmessage(field, decodeSkipInfo);
        break;
      case 4:
        data.forwardSkips = fieldAsSubmessage(field, decodeSkipInfo);
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
  if (data.backwardSkips != null) {
    writer.writeSubmessageField(3, data.backwardSkips, encodeSkipInfo);
  }
  if (data.forwardSkips != null) {
    writer.writeSubmessageField(4, data.forwardSkips, encodeSkipInfo);
  }
  return writer.toUint8Array();
}

/**
 * Describes absense of characters of certain property values
 * in a contiguous range of code points before or after a chunk.
 *
 * The number represents the number of consecutive chunks (256 code points each)
 * that can be safely skipped when searching.
 */
export type SkipInfo = {
  generalCategoryUppercaseLetter: number;
  generalCategoryLowercaseLetter: number;
  generalCategoryTitlecaseLetter: number;
  generalCategoryModifierLetter: number;
  generalCategoryOtherLetter: number;
  generalCategoryNonspacingMark: number;
  generalCategorySpacingMark: number;
  generalCategoryEnclosingMark: number;
  generalCategoryDecimalNumber: number;
  generalCategoryLetterNumber: number;
  generalCategoryOtherNumber: number;
  generalCategoryConnectorPunctuation: number;
  generalCategoryDashPunctuation: number;
  generalCategoryOpenPunctuation: number;
  generalCategoryClosePunctuation: number;
  generalCategoryInitialPunctuation: number;
  generalCategoryFinalPunctuation: number;
  generalCategoryOtherPunctuation: number;
  generalCategoryMathSymbol: number;
  generalCategoryCurrencySymbol: number;
  generalCategoryModifierSymbol: number;
  generalCategoryOtherSymbol: number;
  generalCategorySpaceSeparator: number;
  generalCategoryLineSeparator: number;
  generalCategoryParagraphSeparator: number;
  generalCategoryControl: number;
  generalCategoryFormat: number;
  generalCategoryPrivateUse: number;
  generalCategorySurrogate: number;
  generalCategoryUnassigned: number;
};

export function decodeSkipInfo(buf: Uint8Array): SkipInfo {
  const data: SkipInfo = {
    generalCategoryUppercaseLetter: 0,
    generalCategoryLowercaseLetter: 0,
    generalCategoryTitlecaseLetter: 0,
    generalCategoryModifierLetter: 0,
    generalCategoryOtherLetter: 0,
    generalCategoryNonspacingMark: 0,
    generalCategorySpacingMark: 0,
    generalCategoryEnclosingMark: 0,
    generalCategoryDecimalNumber: 0,
    generalCategoryLetterNumber: 0,
    generalCategoryOtherNumber: 0,
    generalCategoryConnectorPunctuation: 0,
    generalCategoryDashPunctuation: 0,
    generalCategoryOpenPunctuation: 0,
    generalCategoryClosePunctuation: 0,
    generalCategoryInitialPunctuation: 0,
    generalCategoryFinalPunctuation: 0,
    generalCategoryOtherPunctuation: 0,
    generalCategoryMathSymbol: 0,
    generalCategoryCurrencySymbol: 0,
    generalCategoryModifierSymbol: 0,
    generalCategoryOtherSymbol: 0,
    generalCategorySpaceSeparator: 0,
    generalCategoryLineSeparator: 0,
    generalCategoryParagraphSeparator: 0,
    generalCategoryControl: 0,
    generalCategoryFormat: 0,
    generalCategoryPrivateUse: 0,
    generalCategorySurrogate: 0,
    generalCategoryUnassigned: 0,
  };
  for (const field of new ProtoReader(buf)) {
    switch (field.number) {
      case 1:
        data.generalCategoryUppercaseLetter = fieldAsUint32(field);
        break;
      case 2:
        data.generalCategoryLowercaseLetter = fieldAsUint32(field);
        break;
      case 3:
        data.generalCategoryTitlecaseLetter = fieldAsUint32(field);
        break;
      case 4:
        data.generalCategoryModifierLetter = fieldAsUint32(field);
        break;
      case 5:
        data.generalCategoryOtherLetter = fieldAsUint32(field);
        break;
      case 6:
        data.generalCategoryNonspacingMark = fieldAsUint32(field);
        break;
      case 7:
        data.generalCategorySpacingMark = fieldAsUint32(field);
        break;
      case 8:
        data.generalCategoryEnclosingMark = fieldAsUint32(field);
        break;
      case 9:
        data.generalCategoryDecimalNumber = fieldAsUint32(field);
        break;
      case 10:
        data.generalCategoryLetterNumber = fieldAsUint32(field);
        break;
      case 11:
        data.generalCategoryOtherNumber = fieldAsUint32(field);
        break;
      case 12:
        data.generalCategoryConnectorPunctuation = fieldAsUint32(field);
        break;
      case 13:
        data.generalCategoryDashPunctuation = fieldAsUint32(field);
        break;
      case 14:
        data.generalCategoryOpenPunctuation = fieldAsUint32(field);
        break;
      case 15:
        data.generalCategoryClosePunctuation = fieldAsUint32(field);
        break;
      case 16:
        data.generalCategoryInitialPunctuation = fieldAsUint32(field);
        break;
      case 17:
        data.generalCategoryFinalPunctuation = fieldAsUint32(field);
        break;
      case 18:
        data.generalCategoryOtherPunctuation = fieldAsUint32(field);
        break;
      case 19:
        data.generalCategoryMathSymbol = fieldAsUint32(field);
        break;
      case 20:
        data.generalCategoryCurrencySymbol = fieldAsUint32(field);
        break;
      case 21:
        data.generalCategoryModifierSymbol = fieldAsUint32(field);
        break;
      case 22:
        data.generalCategoryOtherSymbol = fieldAsUint32(field);
        break;
      case 23:
        data.generalCategorySpaceSeparator = fieldAsUint32(field);
        break;
      case 24:
        data.generalCategoryLineSeparator = fieldAsUint32(field);
        break;
      case 25:
        data.generalCategoryParagraphSeparator = fieldAsUint32(field);
        break;
      case 26:
        data.generalCategoryControl = fieldAsUint32(field);
        break;
      case 27:
        data.generalCategoryFormat = fieldAsUint32(field);
        break;
      case 28:
        data.generalCategoryPrivateUse = fieldAsUint32(field);
        break;
      case 29:
        data.generalCategorySurrogate = fieldAsUint32(field);
        break;
      case 30:
        data.generalCategoryUnassigned = fieldAsUint32(field);
        break;
    }
  }
  return data;
}

export function encodeSkipInfo(data: SkipInfo): Uint8Array {
  const writer = new ProtoWriter();
  if (data.generalCategoryUppercaseLetter !== 0) {
    writer.writeUint32Field(1, data.generalCategoryUppercaseLetter);
  }
  if (data.generalCategoryLowercaseLetter !== 0) {
    writer.writeUint32Field(2, data.generalCategoryLowercaseLetter);
  }
  if (data.generalCategoryTitlecaseLetter !== 0) {
    writer.writeUint32Field(3, data.generalCategoryTitlecaseLetter);
  }
  if (data.generalCategoryModifierLetter !== 0) {
    writer.writeUint32Field(4, data.generalCategoryModifierLetter);
  }
  if (data.generalCategoryOtherLetter !== 0) {
    writer.writeUint32Field(5, data.generalCategoryOtherLetter);
  }
  if (data.generalCategoryNonspacingMark !== 0) {
    writer.writeUint32Field(6, data.generalCategoryNonspacingMark);
  }
  if (data.generalCategorySpacingMark !== 0) {
    writer.writeUint32Field(7, data.generalCategorySpacingMark);
  }
  if (data.generalCategoryEnclosingMark !== 0) {
    writer.writeUint32Field(8, data.generalCategoryEnclosingMark);
  }
  if (data.generalCategoryDecimalNumber !== 0) {
    writer.writeUint32Field(9, data.generalCategoryDecimalNumber);
  }
  if (data.generalCategoryLetterNumber !== 0) {
    writer.writeUint32Field(10, data.generalCategoryLetterNumber);
  }
  if (data.generalCategoryOtherNumber !== 0) {
    writer.writeUint32Field(11, data.generalCategoryOtherNumber);
  }
  if (data.generalCategoryConnectorPunctuation !== 0) {
    writer.writeUint32Field(12, data.generalCategoryConnectorPunctuation);
  }
  if (data.generalCategoryDashPunctuation !== 0) {
    writer.writeUint32Field(13, data.generalCategoryDashPunctuation);
  }
  if (data.generalCategoryOpenPunctuation !== 0) {
    writer.writeUint32Field(14, data.generalCategoryOpenPunctuation);
  }
  if (data.generalCategoryClosePunctuation !== 0) {
    writer.writeUint32Field(15, data.generalCategoryClosePunctuation);
  }
  if (data.generalCategoryInitialPunctuation !== 0) {
    writer.writeUint32Field(16, data.generalCategoryInitialPunctuation);
  }
  if (data.generalCategoryFinalPunctuation !== 0) {
    writer.writeUint32Field(17, data.generalCategoryFinalPunctuation);
  }
  if (data.generalCategoryOtherPunctuation !== 0) {
    writer.writeUint32Field(18, data.generalCategoryOtherPunctuation);
  }
  if (data.generalCategoryMathSymbol !== 0) {
    writer.writeUint32Field(19, data.generalCategoryMathSymbol);
  }
  if (data.generalCategoryCurrencySymbol !== 0) {
    writer.writeUint32Field(20, data.generalCategoryCurrencySymbol);
  }
  if (data.generalCategoryModifierSymbol !== 0) {
    writer.writeUint32Field(21, data.generalCategoryModifierSymbol);
  }
  if (data.generalCategoryOtherSymbol !== 0) {
    writer.writeUint32Field(22, data.generalCategoryOtherSymbol);
  }
  if (data.generalCategorySpaceSeparator !== 0) {
    writer.writeUint32Field(23, data.generalCategorySpaceSeparator);
  }
  if (data.generalCategoryLineSeparator !== 0) {
    writer.writeUint32Field(24, data.generalCategoryLineSeparator);
  }
  if (data.generalCategoryParagraphSeparator !== 0) {
    writer.writeUint32Field(25, data.generalCategoryParagraphSeparator);
  }
  if (data.generalCategoryControl !== 0) {
    writer.writeUint32Field(26, data.generalCategoryControl);
  }
  if (data.generalCategoryFormat !== 0) {
    writer.writeUint32Field(27, data.generalCategoryFormat);
  }
  if (data.generalCategoryPrivateUse !== 0) {
    writer.writeUint32Field(28, data.generalCategoryPrivateUse);
  }
  if (data.generalCategorySurrogate !== 0) {
    writer.writeUint32Field(29, data.generalCategorySurrogate);
  }
  if (data.generalCategoryUnassigned !== 0) {
    writer.writeUint32Field(30, data.generalCategoryUnassigned);
  }
  return writer.toUint8Array();
}
