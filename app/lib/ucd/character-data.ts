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
export type NameDerivation = number;

export const NAME_DERIVATION_UNSPECIFIED = 0;
export const NAME_DERIVATION_CONTROL = 1;
export const NAME_DERIVATION_RESERVED = 2;
export const NAME_DERIVATION_NONCHARACTER = 3;
export const NAME_DERIVATION_PRIVATE_USE = 4;
export const NAME_DERIVATION_SURROGATE = 5;
export const NAME_DERIVATION_HANGUL_SYLLABLE = 6;
export const NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH = 7;
export const NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH = 8;
export const NAME_DERIVATION_EGYPTIAN_HIEROGLYPH = 9;
export const NAME_DERIVATION_TANGUT_IDEOGRAPH = 10;
export const NAME_DERIVATION_NUSHU_CHARACTER = 11;
export const NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER = 12;

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
export type GeneralCategory = number;

export const GENERAL_CATEGORY_UNSPECIFIED = 0;
export const UPPERCASE_LETTER = 1;
export const LOWERCASE_LETTER = 2;
export const TITLECASE_LETTER = 3;
export const MODIFIER_LETTER = 4;
export const OTHER_LETTER = 5;
export const NONSPACING_MARK = 6;
export const SPACING_MARK = 7;
export const ENCLOSING_MARK = 8;
export const DECIMAL_NUMBER = 9;
export const LETTER_NUMBER = 10;
export const OTHER_NUMBER = 11;
export const CONNECTOR_PUNCTUATION = 12;
export const DASH_PUNCTUATION = 13;
export const OPEN_PUNCTUATION = 14;
export const CLOSE_PUNCTUATION = 15;
export const INITIAL_PUNCTUATION = 16;
export const FINAL_PUNCTUATION = 17;
export const OTHER_PUNCTUATION = 18;
export const MATH_SYMBOL = 19;
export const CURRENCY_SYMBOL = 20;
export const MODIFIER_SYMBOL = 21;
export const OTHER_SYMBOL = 22;
export const SPACE_SEPARATOR = 23;
export const LINE_SEPARATOR = 24;
export const PARAGRAPH_SEPARATOR = 25;
export const CONTROL = 26;
export const FORMAT = 27;
export const SURROGATE = 28;
export const PRIVATE_USE = 29;
export const UNASSIGNED = 30;

export type GeneralCategoryCore =
  | typeof UPPERCASE_LETTER
  | typeof LOWERCASE_LETTER
  | typeof TITLECASE_LETTER
  | typeof MODIFIER_LETTER
  | typeof OTHER_LETTER
  | typeof NONSPACING_MARK
  | typeof SPACING_MARK
  | typeof ENCLOSING_MARK
  | typeof DECIMAL_NUMBER
  | typeof LETTER_NUMBER
  | typeof OTHER_NUMBER
  | typeof CONNECTOR_PUNCTUATION
  | typeof DASH_PUNCTUATION
  | typeof OPEN_PUNCTUATION
  | typeof CLOSE_PUNCTUATION
  | typeof INITIAL_PUNCTUATION
  | typeof FINAL_PUNCTUATION
  | typeof OTHER_PUNCTUATION
  | typeof MATH_SYMBOL
  | typeof CURRENCY_SYMBOL
  | typeof MODIFIER_SYMBOL
  | typeof OTHER_SYMBOL
  | typeof SPACE_SEPARATOR
  | typeof LINE_SEPARATOR
  | typeof PARAGRAPH_SEPARATOR
  | typeof CONTROL
  | typeof FORMAT
  | typeof SURROGATE
  | typeof PRIVATE_USE
  | typeof UNASSIGNED;

export const GENERAL_CATEGORY_NAMES: Record<GeneralCategoryCore, string> = {
  [UPPERCASE_LETTER]: "Uppercase_Letter",
  [LOWERCASE_LETTER]: "Lowercase_Letter",
  [TITLECASE_LETTER]: "Titlecase_Letter",
  [MODIFIER_LETTER]: "Modifier_Letter",
  [OTHER_LETTER]: "Other_Letter",
  [NONSPACING_MARK]: "Nonspacing_Mark",
  [SPACING_MARK]: "Spacing_Mark",
  [ENCLOSING_MARK]: "Enclosing_Mark",
  [DECIMAL_NUMBER]: "Decimal_Number",
  [LETTER_NUMBER]: "Letter_Number",
  [OTHER_NUMBER]: "Other_Number",
  [CONNECTOR_PUNCTUATION]: "Connector_Punctuation",
  [DASH_PUNCTUATION]: "Dash_Punctuation",
  [OPEN_PUNCTUATION]: "Open_Punctuation",
  [CLOSE_PUNCTUATION]: "Close_Punctuation",
  [INITIAL_PUNCTUATION]: "Initial_Punctuation",
  [FINAL_PUNCTUATION]: "Final_Punctuation",
  [OTHER_PUNCTUATION]: "Other_Punctuation",
  [MATH_SYMBOL]: "Math_Symbol",
  [CURRENCY_SYMBOL]: "Currency_Symbol",
  [MODIFIER_SYMBOL]: "Modifier_Symbol",
  [OTHER_SYMBOL]: "Other_Symbol",
  [SPACE_SEPARATOR]: "Space_Separator",
  [LINE_SEPARATOR]: "Line_Separator",
  [PARAGRAPH_SEPARATOR]: "Paragraph_Separator",
  [CONTROL]: "Control",
  [FORMAT]: "Format",
  [SURROGATE]: "Surrogate",
  [PRIVATE_USE]: "Private_Use",
  [UNASSIGNED]: "Unassigned",
};
