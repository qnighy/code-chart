import type { ReadonlyURLSearchParams } from "next/navigation";
import { type GeneralCategoryCore } from "../lib/ucd/character-data";
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
} from "../lib/ucd/proto/character_data_pb";
import type { DerivedData } from "../lib/ucd/derived-data";

export type Filter = FilterTerm;

/**
 * A filter consisting of a set of allowed property values.
 *
 * An empty array for a property is equivalent to
 * an array containing all possible values for that property
 * in terms of filtering, but they are distinct in the user interface.
 */
export type FilterTerm = {
  generalCategory: GeneralCategoryCore[];
};

export const emptyFilter: Filter = {
  generalCategory: [],
};

export const GENERAL_CATEGORIES: readonly GeneralCategoryCore[] = [
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
];

const GC_FROM_SHORTHAND: Record<string, GeneralCategoryCore> = {
  Lu: UPPERCASE_LETTER,
  Ll: LOWERCASE_LETTER,
  Lt: TITLECASE_LETTER,
  Lm: MODIFIER_LETTER,
  Lo: OTHER_LETTER,
  Mn: NONSPACING_MARK,
  Mc: SPACING_MARK,
  Me: ENCLOSING_MARK,
  Nd: DECIMAL_NUMBER,
  Nl: LETTER_NUMBER,
  No: OTHER_NUMBER,
  Pc: CONNECTOR_PUNCTUATION,
  Pd: DASH_PUNCTUATION,
  Ps: OPEN_PUNCTUATION,
  Pe: CLOSE_PUNCTUATION,
  Pi: INITIAL_PUNCTUATION,
  Pf: FINAL_PUNCTUATION,
  Po: OTHER_PUNCTUATION,
  Sm: MATH_SYMBOL,
  Sc: CURRENCY_SYMBOL,
  Sk: MODIFIER_SYMBOL,
  So: OTHER_SYMBOL,
  Zs: SPACE_SEPARATOR,
  Zl: LINE_SEPARATOR,
  Zp: PARAGRAPH_SEPARATOR,
  Cc: CONTROL,
  Cf: FORMAT,
  Cs: SURROGATE,
  Co: PRIVATE_USE,
  Cn: UNASSIGNED,
};

const GC_TO_SHORTHAND: Record<GeneralCategoryCore, string> = Object.fromEntries(
  Object.entries(GC_FROM_SHORTHAND).map(([k, v]) => [v, k]),
) as Record<GeneralCategoryCore, string>;

export function normalizeGeneralCategories(
  generalCategories: readonly GeneralCategoryCore[],
): GeneralCategoryCore[] {
  const set = new Set<GeneralCategoryCore>(generalCategories);
  return GENERAL_CATEGORIES.filter((gc) => set.has(gc));
}

export function filterToSearchParams(
  filter: Filter,
  searchParams: URLSearchParams,
): void {
  if (filter.generalCategory.length > 0) {
    const gcParams = normalizeGeneralCategories(filter.generalCategory)
      .map((gc) => GC_TO_SHORTHAND[gc])
      .join(",");
    searchParams.set("gc", gcParams);
  } else {
    searchParams.delete("gc");
  }
}

export function filterToSearch(filter: Filter): string {
  const searchParams = new URLSearchParams();
  filterToSearchParams(filter, searchParams);
  return searchParams.toString();
}

export function filterFromSearchParams(
  searchParams: URLSearchParams | ReadonlyURLSearchParams,
): Filter {
  const gcParam = searchParams.get("gc");
  const generalCategory: GeneralCategoryCore[] = [];
  if (gcParam != null && gcParam.length > 0) {
    for (const shorthand of gcParam.split(",")) {
      if (Object.hasOwn(GC_FROM_SHORTHAND, shorthand)) {
        generalCategory.push(GC_FROM_SHORTHAND[shorthand]!);
      }
    }
  }
  return {
    generalCategory: normalizeGeneralCategories(generalCategory),
  };
}

export function isTrivialFilter(filter: Filter): boolean {
  if (
    filter.generalCategory.length > 0 &&
    filter.generalCategory.length < GENERAL_CATEGORIES.length
  ) {
    return false;
  }
  return true;
}

export function evaluateFilter(filter: Filter, item: DerivedData): boolean {
  if (filter.generalCategory.length > 0) {
    if (!filter.generalCategory.includes(item.generalCategory)) {
      return false;
    }
  }
  return true;
}
