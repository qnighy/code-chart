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
   * GeneralCategory general_category = 3;
   * ```
   */
  generalCategory: GeneralCategory;
};

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
