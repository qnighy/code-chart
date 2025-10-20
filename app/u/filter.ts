import type { ReadonlyURLSearchParams } from "next/navigation";
import {
  GENERAL_CATEGORY_SHORTHANDS,
  type GeneralCategoryReq,
} from "../lib/ucd/character-data";
import type { DerivedData } from "../lib/ucd/derived-data";
import { GC_TRAIT_ENTRIES, generalCategoryTrait, type Trait } from "./trait";

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
      gcShorthands.push(GENERAL_CATEGORY_SHORTHANDS[gc]);
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
    if (gcShorthands.has(GENERAL_CATEGORY_SHORTHANDS[gc])) {
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
  const traits: Trait[] = [generalCategoryTrait(item.generalCategory)];
  for (const trait of traits) {
    if (!hasBit(filter, trait)) {
      return false;
    }
  }
  return true;
}

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
