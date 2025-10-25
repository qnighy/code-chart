// This file is manually transcribed from the protobuf definition.
// When updating this file, please also update the corresponding
// .proto file to reflect any changes to the protocol.

import {
  fieldAsString,
  fieldAsUint32,
  ProtoReader,
} from "../../protobuf/reader";
import { ProtoWriter } from "../../protobuf/writer";

/**
 * An entry representing a Unicode character and its properties.
 */
export type CharacterData = {
  /** The Unicode code point. */
  codePoint: number;

  /**
   * The declared name of the character, or an empty string
   * if the character's name or label is derived by rule.
   */
  name: string;
  /**
   * How the name of the character is derived from its code point.
   */
  nameDerivation: NameDerivation;

  /**
   * The General_Category (Gc) property value.
   */
  generalCategory: GeneralCategory;
};

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
        data.nameDerivation = NameDerivation(fieldAsUint32(field));
        break;
      case 3:
        data.generalCategory = GeneralCategory(fieldAsUint32(field));
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

/**
 * A value representing how the name of a character is derived
 * from its code point, according to the rules in §4.8 Name.
 */
export type NameDerivation<T extends number = number> = T & {
  __brand: "NameDerivation";
};
export function NameDerivation<const T extends number>(
  value: T,
): NameDerivation<T> {
  return value as NameDerivation & T;
}

/** No name derivation. */
export const NAME_DERIVATION_UNSPECIFIED = NameDerivation(0);
/** <control-NNNN> (label, not a name) */
export const NAME_DERIVATION_CONTROL = NameDerivation(1);
/** <reserved-XXXX> (label, not a name) */
export const NAME_DERIVATION_RESERVED = NameDerivation(2);
/** <noncharacter-XXXX> (label, not a name) */
export const NAME_DERIVATION_NONCHARACTER = NameDerivation(3);
/** <private-use-XXXX> (label, not a name) */
export const NAME_DERIVATION_PRIVATE_USE = NameDerivation(4);
/** <surrogate-XXXX> (label, not a name) */
export const NAME_DERIVATION_SURROGATE = NameDerivation(5);
/** HANGUL SYLLABLE ZZZZ (rule NR1) */
export const NAME_DERIVATION_HANGUL_SYLLABLE = NameDerivation(6);
/** CJK UNIFIED IDEOGRAPH-XXXX (rule NR2) */
export const NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH = NameDerivation(7);
/** CJK COMPATIBILITY IDEOGRAPH-XXXX (rule NR2) */
export const NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH = NameDerivation(8);
/** EGYPTIAN HIEROGLYPH-XXXX (rule NR2) */
export const NAME_DERIVATION_EGYPTIAN_HIEROGLYPH = NameDerivation(9);
/** TANGUT IDEOGRAPH-XXXX (rule NR2) */
export const NAME_DERIVATION_TANGUT_IDEOGRAPH = NameDerivation(10);
/** NUSHU CHARACTER-XXXX (rule NR2) */
export const NAME_DERIVATION_NUSHU_CHARACTER = NameDerivation(11);
/** KHITAN SMALL SCRIPT CHARACTER-XXXX (rule NR2) */
export const NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER = NameDerivation(12);

/**
 * The General_Category (Gc) property value.
 *
 * https://www.unicode.org/reports/tr44/#General_Category_Values
 */
export type GeneralCategory<T extends number = number> = T & {
  __brand: "GeneralCategory";
};
export function GeneralCategory<const T extends number>(
  value: T,
): GeneralCategory<T> {
  return value as GeneralCategory & T;
}

export const GENERAL_CATEGORY_UNSPECIFIED = GeneralCategory(0);
/** Uppercase_Letter (Lu) */
export const UPPERCASE_LETTER = GeneralCategory(1);
/** Lowercase_Letter (Ll) */
export const LOWERCASE_LETTER = GeneralCategory(2);
/** Titlecase_Letter (Lt) */
export const TITLECASE_LETTER = GeneralCategory(3);
/** Modifier_Letter (Lm) */
export const MODIFIER_LETTER = GeneralCategory(4);
/** Other_Letter (Lo) */
export const OTHER_LETTER = GeneralCategory(5);
/** Nonspacing_Mark (Mn) */
export const NONSPACING_MARK = GeneralCategory(6);
/** Spacing_Mark (Mc) */
export const SPACING_MARK = GeneralCategory(7);
/** Enclosing_Mark (Me) */
export const ENCLOSING_MARK = GeneralCategory(8);
/** Decimal_Number (Nd) */
export const DECIMAL_NUMBER = GeneralCategory(9);
/** Letter_Number (Nl) */
export const LETTER_NUMBER = GeneralCategory(10);
/** Other_Number (No) */
export const OTHER_NUMBER = GeneralCategory(11);
/** Connector_Punctuation (Pc) */
export const CONNECTOR_PUNCTUATION = GeneralCategory(12);
/** Dash_Punctuation (Pd) */
export const DASH_PUNCTUATION = GeneralCategory(13);
/** Open_Punctuation (Pe) */
export const OPEN_PUNCTUATION = GeneralCategory(14);
/** Close_Punctuation (Pf) */
export const CLOSE_PUNCTUATION = GeneralCategory(15);
/** Initial_Punctuation (Pi) */
export const INITIAL_PUNCTUATION = GeneralCategory(16);
/** Final_Punctuation (Pf) */
export const FINAL_PUNCTUATION = GeneralCategory(17);
/** Other_Punctuation (Po) */
export const OTHER_PUNCTUATION = GeneralCategory(18);
/** Math_Symbol (Sm) */
export const MATH_SYMBOL = GeneralCategory(19);
/** Currency_Symbol (Sc) */
export const CURRENCY_SYMBOL = GeneralCategory(20);
/** Modifier_Symbol (Sk) */
export const MODIFIER_SYMBOL = GeneralCategory(21);
/** Other_Symbol (So) */
export const OTHER_SYMBOL = GeneralCategory(22);
/** Space_Separator (Zs) */
export const SPACE_SEPARATOR = GeneralCategory(23);
/** Line_Separator (Zl) */
export const LINE_SEPARATOR = GeneralCategory(24);
/** Paragraph_Separator (Zp) */
export const PARAGRAPH_SEPARATOR = GeneralCategory(25);
/** Control (Cc) */
export const CONTROL = GeneralCategory(26);
/** Format (Cf) */
export const FORMAT = GeneralCategory(27);
/** Surrogate (Cs) */
export const SURROGATE = GeneralCategory(28);
/** Private_Use (Co) */
export const PRIVATE_USE = GeneralCategory(29);
/** Unassigned (Cn) */
export const UNASSIGNED = GeneralCategory(30);
