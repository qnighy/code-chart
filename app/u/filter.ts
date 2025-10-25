import type { ReadonlyURLSearchParams } from "next/navigation";
import {
  GENERAL_CATEGORY_SHORTHANDS,
  type GeneralCategoryReq,
} from "../lib/ucd/character-data";
import type { DerivedData } from "../lib/ucd/derived-data";
import { GC_TRAIT_ENTRIES, generalCategoryTrait, type Trait } from "./trait";
import type { SkipInfo } from "../lib/ucd/proto/chunk_pb";
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
import { FullMap } from "../lib/utils/full-map";

export type Filter = FilterTerm;

/**
 * A filter consisting of a set of allowed property values,
 * represented as a bit set.
 *
 * An empty array for a property is equivalent to
 * an array containing all possible values for that property
 * in terms of filtering, but they are distinct in the user interface.
 */
export type FilterTerm = bigint;

export const emptyFilter: Filter = 0n;

export type FilterRepresentation = FilterTermRepresentation;
export type FilterTermRepresentation = {
  generalCategory: GeneralCategoryReq[];
};

export function describeFilter(filter: Filter): FilterRepresentation {
  return describeFilterTerm(filter);
}
function describeFilterTerm(term: FilterTerm): FilterTermRepresentation {
  const generalCategory: GeneralCategoryReq[] = [];
  for (const [gc, trait] of GC_TRAIT_ENTRIES) {
    if (hasBit(term, trait)) {
      generalCategory.push(gc);
    }
  }
  return {
    generalCategory,
  };
}

function normalizeTerm(term: FilterTerm): FilterTerm {
  let current = term;
  if ((current & GC_MASK) === 0n) {
    current |= GC_MASK;
  }
  return current;
}

const GC_MASK = bitOrAll(GC_TRAIT_ENTRIES.map(([, trait]) => mask1At(trait)));

const FULL_MASK = GC_MASK;

export function filterToSearchParams(
  filter: Filter,
  searchParams: URLSearchParams,
): void {
  const gcShorthands: string[] = [];
  for (const [gc, trait] of GC_TRAIT_ENTRIES) {
    if (hasBit(filter, trait)) {
      gcShorthands.push(GENERAL_CATEGORY_SHORTHANDS.get(gc));
    }
  }
  if (gcShorthands.length > 0) {
    searchParams.set("gc", gcShorthands.join(","));
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
  let filter: Filter = 0n;

  const gcParam = searchParams.get("gc");
  const gcShorthands = new Set((gcParam ?? "").split(","));
  for (const [gc, trait] of GC_TRAIT_ENTRIES) {
    if (gcShorthands.has(GENERAL_CATEGORY_SHORTHANDS.get(gc))) {
      filter |= mask1At(trait);
    }
  }
  return filter;
}

export function isTrivialFilter(filter: Filter): boolean {
  const n = normalizeTerm(filter);
  return n === FULL_MASK;
}

export function evaluateFilter(filter: Filter, item: DerivedData): boolean {
  const n = normalizeTerm(filter);
  const traits: Trait[] = [generalCategoryTrait(item.generalCategory)];
  for (const trait of traits) {
    if (!hasBit(n, trait)) {
      return false;
    }
  }
  return true;
}

const LARGE_SKIP = 0x110000;

export function evaluateFilterSkip(
  filter: Filter,
  skipInfo: SkipInfo | null,
): number {
  if (skipInfo == null) {
    return 0;
  }
  const n = normalizeTerm(filter);
  let gcSkip = LARGE_SKIP;
  for (const [gc, trait] of GC_TRAIT_ENTRIES) {
    if (hasBit(n, trait)) {
      const key = gcSkipInfoKeys.get(gc);
      gcSkip = Math.min(gcSkip, skipInfo[key]);
    }
  }
  return gcSkip;
}

const gcSkipInfoKeys: FullMap<GeneralCategoryReq, keyof SkipInfo> = new FullMap(
  [
    [UPPERCASE_LETTER, "generalCategoryUppercaseLetter"],
    [LOWERCASE_LETTER, "generalCategoryLowercaseLetter"],
    [TITLECASE_LETTER, "generalCategoryTitlecaseLetter"],
    [MODIFIER_LETTER, "generalCategoryModifierLetter"],
    [OTHER_LETTER, "generalCategoryOtherLetter"],
    [NONSPACING_MARK, "generalCategoryNonspacingMark"],
    [SPACING_MARK, "generalCategorySpacingMark"],
    [ENCLOSING_MARK, "generalCategoryEnclosingMark"],
    [DECIMAL_NUMBER, "generalCategoryDecimalNumber"],
    [LETTER_NUMBER, "generalCategoryLetterNumber"],
    [OTHER_NUMBER, "generalCategoryOtherNumber"],
    [CONNECTOR_PUNCTUATION, "generalCategoryConnectorPunctuation"],
    [DASH_PUNCTUATION, "generalCategoryDashPunctuation"],
    [OPEN_PUNCTUATION, "generalCategoryOpenPunctuation"],
    [CLOSE_PUNCTUATION, "generalCategoryClosePunctuation"],
    [INITIAL_PUNCTUATION, "generalCategoryInitialPunctuation"],
    [FINAL_PUNCTUATION, "generalCategoryFinalPunctuation"],
    [OTHER_PUNCTUATION, "generalCategoryOtherPunctuation"],
    [MATH_SYMBOL, "generalCategoryMathSymbol"],
    [CURRENCY_SYMBOL, "generalCategoryCurrencySymbol"],
    [MODIFIER_SYMBOL, "generalCategoryModifierSymbol"],
    [OTHER_SYMBOL, "generalCategoryOtherSymbol"],
    [SPACE_SEPARATOR, "generalCategorySpaceSeparator"],
    [LINE_SEPARATOR, "generalCategoryLineSeparator"],
    [PARAGRAPH_SEPARATOR, "generalCategoryParagraphSeparator"],
    [CONTROL, "generalCategoryControl"],
    [FORMAT, "generalCategoryFormat"],
    [SURROGATE, "generalCategorySurrogate"],
    [PRIVATE_USE, "generalCategoryPrivateUse"],
    [UNASSIGNED, "generalCategoryUnassigned"],
  ],
);

export function hasTrait(filter: Filter, trait: Trait): boolean {
  return hasBit(filter, trait);
}

export function addTraitToFilter(filter: Filter, trait: Trait): Filter {
  return filter | mask1At(trait);
}

export function removeTraitFromFilter(filter: Filter, trait: Trait): Filter {
  return filter & ~mask1At(trait);
}

function mask1At(shift: number): bigint {
  return 1n << BigInt(shift);
}

function hasBit(bits: bigint, shift: number): boolean {
  return (bits & mask1At(shift)) !== 0n;
}

function bitOrAll(bitsArray: bigint[]): bigint {
  let result = 0n;
  for (const bits of bitsArray) {
    result |= bits;
  }
  return result;
}
