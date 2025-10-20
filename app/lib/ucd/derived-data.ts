import { codePointHex, codePointHexName } from "../unicode";
import { type GeneralCategoryCore } from "./character-data";
import {
  NAME_DERIVATION_RESERVED,
  UNASSIGNED,
  UPPERCASE_LETTER,
  LOWERCASE_LETTER,
  TITLECASE_LETTER,
  MODIFIER_LETTER,
  OTHER_LETTER,
  NONSPACING_MARK,
  SPACING_MARK,
  ENCLOSING_MARK,
  DECIMAL_NUMBER,
  LETTER_NUMBER,
  OTHER_NUMBER,
  CONNECTOR_PUNCTUATION,
  DASH_PUNCTUATION,
  OPEN_PUNCTUATION,
  CLOSE_PUNCTUATION,
  INITIAL_PUNCTUATION,
  FINAL_PUNCTUATION,
  OTHER_PUNCTUATION,
  MATH_SYMBOL,
  CURRENCY_SYMBOL,
  MODIFIER_SYMBOL,
  OTHER_SYMBOL,
  SPACE_SEPARATOR,
  LINE_SEPARATOR,
  PARAGRAPH_SEPARATOR,
  CONTROL,
  FORMAT,
  SURROGATE,
  PRIVATE_USE,
  NAME_DERIVATION_CONTROL,
  NAME_DERIVATION_NONCHARACTER,
  NAME_DERIVATION_PRIVATE_USE,
  NAME_DERIVATION_SURROGATE,
  NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH,
  NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH,
  NAME_DERIVATION_EGYPTIAN_HIEROGLYPH,
  NAME_DERIVATION_TANGUT_IDEOGRAPH,
  NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER,
  NAME_DERIVATION_NUSHU_CHARACTER,
  NAME_DERIVATION_UNSPECIFIED,
  NAME_DERIVATION_HANGUL_SYLLABLE,
  type NameDerivation,
  type CharacterData,
} from "./proto/character_data_pb";

export type DerivedData = {
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
  /**
   * ```protobuf
   * GeneralCategory general_category = 3;
   * ```
   */
  generalCategory: GeneralCategoryCore;
};

export function deriveCharacterData(
  codePoint: number,
  baseData: CharacterData | undefined,
): DerivedData {
  if (!baseData) {
    return {
      codePoint,
      // TODO: support NONCHARACTER derivation
      name: deriveName(codePoint, "", NAME_DERIVATION_RESERVED),
      generalCategory: UNASSIGNED,
    };
  }
  const {
    name: baseName,
    nameDerivation,
    generalCategory = UNASSIGNED,
  } = baseData;
  const name = deriveName(codePoint, baseName, nameDerivation);
  const derivedGeneralCategory: GeneralCategoryCore =
    GENERAL_CATEGORY_CORES.has(generalCategory as GeneralCategoryCore)
      ? (generalCategory as GeneralCategoryCore)
      : UNASSIGNED;
  return {
    codePoint,
    name,
    generalCategory: derivedGeneralCategory,
  };
}

const GENERAL_CATEGORY_CORES: Set<GeneralCategoryCore> = new Set([
  UPPERCASE_LETTER,
  LOWERCASE_LETTER,
  TITLECASE_LETTER,
  MODIFIER_LETTER,
  OTHER_LETTER,
  NONSPACING_MARK,
  SPACING_MARK,
  ENCLOSING_MARK,
  DECIMAL_NUMBER,
  LETTER_NUMBER,
  OTHER_NUMBER,
  CONNECTOR_PUNCTUATION,
  DASH_PUNCTUATION,
  OPEN_PUNCTUATION,
  CLOSE_PUNCTUATION,
  INITIAL_PUNCTUATION,
  FINAL_PUNCTUATION,
  OTHER_PUNCTUATION,
  MATH_SYMBOL,
  CURRENCY_SYMBOL,
  MODIFIER_SYMBOL,
  OTHER_SYMBOL,
  SPACE_SEPARATOR,
  LINE_SEPARATOR,
  PARAGRAPH_SEPARATOR,
  CONTROL,
  FORMAT,
  SURROGATE,
  PRIVATE_USE,
  UNASSIGNED,
]);

const nameTemplates: Record<NameDerivation, string> = {
  [NAME_DERIVATION_CONTROL]: "<control-$>",
  [NAME_DERIVATION_RESERVED]: "<reserved-$>",
  [NAME_DERIVATION_NONCHARACTER]: "<noncharacter-$>",
  [NAME_DERIVATION_PRIVATE_USE]: "<private-use-$>",
  [NAME_DERIVATION_SURROGATE]: "<surrogate-$>",
  [NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH]: "CJK UNIFIED IDEOGRAPH-$",
  [NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH]:
    "CJK COMPATIBILITY IDEOGRAPH-$",
  [NAME_DERIVATION_EGYPTIAN_HIEROGLYPH]: "EGYPTIAN HIEROGLYPH-$",
  [NAME_DERIVATION_TANGUT_IDEOGRAPH]: "TANGUT IDEOGRAPH-$",
  [NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER]:
    "KHITAN SMALL SCRIPT CHARACTER-$",
  [NAME_DERIVATION_NUSHU_CHARACTER]: "NUSHU CHARACTER-$",
};

export function deriveName(
  codePoint: number,
  name: string,
  nameDerivation: NameDerivation,
): string {
  if (nameDerivation === NAME_DERIVATION_UNSPECIFIED) {
    return name;
  } else if (nameDerivation === NAME_DERIVATION_HANGUL_SYLLABLE) {
    return deriveHangulSyllableName(codePoint);
  } else {
    const template = nameTemplates[nameDerivation];
    if (!template) {
      throw new RangeError(`Invalid name derivation: ${nameDerivation}`);
    }
    return template.replace("$", codePointHex(codePoint));
  }
}

const S_BASE = 0xac00;
const L_COUNT = 19;
const V_COUNT = 21;
const T_COUNT = 28;
const S_END = S_BASE + L_COUNT * V_COUNT * T_COUNT;
const L_TABLE = [
  "G", //  U+1100 HANGUL CHOSEONG KIYEOK
  "GG", // U+1101 HANGUL CHOSEONG SSANGKIYEOK
  "N", //  U+1102 HANGUL CHOSEONG NIEUN
  "D", //  U+1103 HANGUL CHOSEONG TIKEUT
  "DD", // U+1104 HANGUL CHOSEONG SSANGTIKEUT
  "R", //  U+1105 HANGUL CHOSEONG RIEUL
  "M", //  U+1106 HANGUL CHOSEONG MIEUM
  "B", //  U+1107 HANGUL CHOSEONG PIEUP
  "BB", // U+1108 HANGUL CHOSEONG SSANGPIEUP
  "S", //  U+1109 HANGUL CHOSEONG SIOS
  "SS", // U+110A HANGUL CHOSEONG SSANGSIOS
  "", //   U+110B HANGUL CHOSEONG IEUNG
  "J", //  U+110C HANGUL CHOSEONG CIEUC
  "JJ", // U+110D HANGUL CHOSEONG SSANGCIEUC
  "C", //  U+110E HANGUL CHOSEONG CHIEUCH
  "K", //  U+110F HANGUL CHOSEONG KHIEUKH
  "T", //  U+1110 HANGUL CHOSEONG THIEUTH
  "P", //  U+1111 HANGUL CHOSEONG PHIEUPH
  "H", //  U+1112 HANGUL CHOSEONG HIEUH
];
const V_TABLE = [
  "A", //   U+1161 HANGUL JUNGSEONG A
  "AE", //  U+1162 HANGUL JUNGSEONG AE
  "YA", //  U+1163 HANGUL JUNGSEONG YA
  "YAE", // U+1164 HANGUL JUNGSEONG YAE
  "EO", //  U+1165 HANGUL JUNGSEONG EO
  "E", //   U+1166 HANGUL JUNGSEONG E
  "YEO", // U+1167 HANGUL JUNGSEONG YEO
  "YE", //  U+1168 HANGUL JUNGSEONG YE
  "O", //   U+1169 HANGUL JUNGSEONG O
  "WA", //  U+116A HANGUL JUNGSEONG WA
  "WAE", // U+116B HANGUL JUNGSEONG WAE
  "OE", //  U+116C HANGUL JUNGSEONG OE
  "YO", //  U+116D HANGUL JUNGSEONG YO
  "U", //   U+116E HANGUL JUNGSEONG U
  "WEO", // U+116F HANGUL JUNGSEONG WEO
  "WE", //  U+1170 HANGUL JUNGSEONG WE
  "WI", //  U+1171 HANGUL JUNGSEONG WI
  "YU", //  U+1172 HANGUL JUNGSEONG YU
  "EU", //  U+1173 HANGUL JUNGSEONG EU
  "YI", //  U+1174 HANGUL JUNGSEONG YI
  "I", //   U+1175 HANGUL JUNGSEONG I
];
const T_TABLE = [
  "",
  "G", //  U+11A8 HANGUL JONGSEONG KIYEOK
  "GG", // U+11A9 HANGUL JONGSEONG SSANGKIYEOK
  "GS", // U+11AA HANGUL JONGSEONG KIYEOK-SIOS
  "N", //  U+11AB HANGUL JONGSEONG NIEUN
  "NJ", // U+11AC HANGUL JONGSEONG NIEUN-CIEUC
  "NH", // U+11AD HANGUL JONGSEONG NIEUN-HIEUH
  "D", //  U+11AE HANGUL JONGSEONG TIKEUT
  "L", //  U+11AF HANGUL JONGSEONG RIEUL
  "LG", // U+11B0 HANGUL JONGSEONG RIEUL-KIYEOK
  "LM", // U+11B1 HANGUL JONGSEONG RIEUL-MIEUM
  "LB", // U+11B2 HANGUL JONGSEONG RIEUL-PIEUP
  "LS", // U+11B3 HANGUL JONGSEONG RIEUL-SIOS
  "LT", // U+11B4 HANGUL JONGSEONG RIEUL-THIEUTH
  "LP", // U+11B5 HANGUL JONGSEONG RIEUL-PHIEUPH
  "LH", // U+11B6 HANGUL JONGSEONG RIEUL-HIEUH
  "M", //  U+11B7 HANGUL JONGSEONG MIEUM
  "B", //  U+11B8 HANGUL JONGSEONG PIEUP
  "BS", // U+11B9 HANGUL JONGSEONG PIEUP-SIOS
  "S", //  U+11BA HANGUL JONGSEONG SIOS
  "SS", // U+11BB HANGUL JONGSEONG SSANGSIOS
  "NG", // U+11BC HANGUL JONGSEONG IEUNG
  "J", //  U+11BD HANGUL JONGSEONG CIEUC
  "C", //  U+11BE HANGUL JONGSEONG CHIEUCH
  "K", //  U+11BF HANGUL JONGSEONG KHIEUKH
  "T", //  U+11C0 HANGUL JONGSEONG THIEUTH
  "P", //  U+11C1 HANGUL JONGSEONG PHIEUPH
  "H", //  U+11C2 HANGUL JONGSEONG HIEUH
];

function deriveHangulSyllableName(codePoint: number): string {
  if (codePoint < S_BASE || codePoint >= S_END) {
    throw new RangeError(
      `Not a Hangul syllable: ${codePointHexName(codePoint)}`,
    );
  }
  const sIndex = codePoint - S_BASE;
  const lIndex = Math.floor(sIndex / (V_COUNT * T_COUNT));
  const vIndex = Math.floor((sIndex % (V_COUNT * T_COUNT)) / T_COUNT);
  const tIndex = sIndex % T_COUNT;

  return `HANGUL SYLLABLE ${L_TABLE[lIndex]}${V_TABLE[vIndex]}${T_TABLE[tIndex]}`;
}
