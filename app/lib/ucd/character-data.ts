import {
  CLOSE_PUNCTUATION,
  CONNECTOR_PUNCTUATION,
  CONTROL,
  CURRENCY_SYMBOL,
  DASH_PUNCTUATION,
  DECIMAL_NUMBER,
  ENCLOSING_MARK,
  FINAL_PUNCTUATION,
  FORMAT,
  INITIAL_PUNCTUATION,
  LETTER_NUMBER,
  LINE_SEPARATOR,
  LOWERCASE_LETTER,
  MATH_SYMBOL,
  MODIFIER_LETTER,
  MODIFIER_SYMBOL,
  NONSPACING_MARK,
  OPEN_PUNCTUATION,
  OTHER_LETTER,
  OTHER_NUMBER,
  OTHER_PUNCTUATION,
  OTHER_SYMBOL,
  PARAGRAPH_SEPARATOR,
  PRIVATE_USE,
  SPACE_SEPARATOR,
  SPACING_MARK,
  SURROGATE,
  TITLECASE_LETTER,
  UNASSIGNED,
  UPPERCASE_LETTER,
} from "./proto/character_data_pb";

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
