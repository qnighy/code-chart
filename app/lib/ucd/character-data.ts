export type CharacterData = {
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
   * NameDerivation name_derivation = 4;
   * ```
   */
  nameDerivation: NameDerivation;
  /**
   * ```protobuf
   * GeneralCategory general_category = 3;
   * ```
   */
  generalCategory: GeneralCategory;
};

/**
 * ```protobuf
 * enum NameDerivation {
 *   // No name derivation.
 *   NAME_DERIVATION_UNSPECIFIED = 0;
 *   // <control-NNNN> (label, not a name)
 *   NAME_DERIVATION_CONTROL = 1;
 *   // <reserved-XXXX> (label, not a name)
 *   NAME_DERIVATION_RESERVED = 2;
 *   // <noncharacter-XXXX> (label, not a name)
 *   NAME_DERIVATION_NONCHARACTER = 3;
 *   // <private-use-XXXX> (label, not a name)
 *   NAME_DERIVATION_PRIVATE_USE = 4;
 *   // <surrogate-XXXX> (label, not a name)
 *   NAME_DERIVATION_SURROGATE = 5;
 *   // HANGUL SYLLABLE ZZZZ (rule NR1)
 *   NAME_DERIVATION_HANGUL_SYLLABLE = 6;
 *   // CJK UNIFIED IDEOGRAPH-XXXX (rule NR2)
 *   NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH = 7;
 *   // CJK COMPATIBILITY IDEOGRAPH-XXXX (rule NR2)
 *   NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH = 8;
 *   // EGYPTIAN HIEROGLYPH-XXXX (rule NR2)
 *   NAME_DERIVATION_EGYPTIAN_HIEROGLYPH = 9;
 *   // TANGUT IDEOGRAPH-XXXX (rule NR2)
 *   NAME_DERIVATION_TANGUT_IDEOGRAPH = 10;
 *   // NUSHU CHARACTER-XXXX (rule NR2)
 *   NAME_DERIVATION_NUSHU_CHARACTER = 11;
 *   // KHITAN SMALL SCRIPT CHARACTER-XXXX (rule NR2)
 *   NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER = 12;
 * }
 * ```
 */
export type NameDerivation =
  | "NAME_DERIVATION_UNSPECIFIED"
  | "NAME_DERIVATION_CONTROL"
  | "NAME_DERIVATION_RESERVED"
  | "NAME_DERIVATION_NONCHARACTER"
  | "NAME_DERIVATION_PRIVATE_USE"
  | "NAME_DERIVATION_SURROGATE"
  | "NAME_DERIVATION_HANGUL_SYLLABLE"
  | "NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH"
  | "NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH"
  | "NAME_DERIVATION_EGYPTIAN_HIEROGLYPH"
  | "NAME_DERIVATION_TANGUT_IDEOGRAPH"
  | "NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER"
  | "NAME_DERIVATION_NUSHU_CHARACTER"
  | number;

/**
 * https://www.unicode.org/reports/tr44/#General_Category_Values
 *
 * ```protobuf
 * enum GeneralCategory {
 *   GENERAL_CATEGORY_UNSPECIFIED = 0;
 *   UPPERCASE_LETTER = 1;
 *   LOWERCASE_LETTER = 2;
 *   TITLECASE_LETTER = 3;
 *   MODIFIER_LETTER = 4;
 *   OTHER_LETTER = 5;
 *   NONSPACING_MARK = 6;
 *   SPACING_MARK = 7;
 *   ENCLOSING_MARK = 8;
 *   DECIMAL_NUMBER = 9;
 *   LETTER_NUMBER = 10;
 *   OTHER_NUMBER = 11;
 *   CONNECTOR_PUNCTUATION = 12;
 *   DASH_PUNCTUATION = 13;
 *   OPEN_PUNCTUATION = 14;
 *   CLOSE_PUNCTUATION = 15;
 *   INITIAL_PUNCTUATION = 16;
 *   FINAL_PUNCTUATION = 17;
 *   OTHER_PUNCTUATION = 18;
 *   MATH_SYMBOL = 19;
 *   CURRENCY_SYMBOL = 20;
 *   MODIFIER_SYMBOL = 21;
 *   OTHER_SYMBOL = 22;
 *   SPACE_SEPARATOR = 23;
 *   LINE_SEPARATOR = 24;
 *   PARAGRAPH_SEPARATOR = 25;
 *   CONTROL = 26;
 *   FORMAT = 27;
 *   SURROGATE = 28;
 *   PRIVATE_USE = 29;
 *   UNASSIGNED = 30;
 * }
 * ```
 */
export type GeneralCategory =
  | "GENERAL_CATEGORY_UNSPECIFIED"
  | "UPPERCASE_LETTER"
  | "LOWERCASE_LETTER"
  | "TITLECASE_LETTER"
  | "MODIFIER_LETTER"
  | "OTHER_LETTER"
  | "NONSPACING_MARK"
  | "SPACING_MARK"
  | "ENCLOSING_MARK"
  | "DECIMAL_NUMBER"
  | "LETTER_NUMBER"
  | "OTHER_NUMBER"
  | "CONNECTOR_PUNCTUATION"
  | "DASH_PUNCTUATION"
  | "OPEN_PUNCTUATION"
  | "CLOSE_PUNCTUATION"
  | "INITIAL_PUNCTUATION"
  | "FINAL_PUNCTUATION"
  | "OTHER_PUNCTUATION"
  | "MATH_SYMBOL"
  | "CURRENCY_SYMBOL"
  | "MODIFIER_SYMBOL"
  | "OTHER_SYMBOL"
  | "SPACE_SEPARATOR"
  | "LINE_SEPARATOR"
  | "PARAGRAPH_SEPARATOR"
  | "CONTROL"
  | "FORMAT"
  | "SURROGATE"
  | "PRIVATE_USE"
  | "UNASSIGNED"
  | number;

export type GeneralCategoryCore = Exclude<
  GeneralCategory,
  "GENERAL_CATEGORY_UNSPECIFIED" | number
>;
