// A "trait" here means an assertion that a character has
// a certain property value, e.g. Gc=Lu.

import {
  GENERAL_CATEGORIES,
  type GeneralCategoryReq,
} from "../lib/ucd/character-data";
import {
  UNASSIGNED,
  UPPERCASE_LETTER,
} from "../lib/ucd/proto/character_data_pb";

/**
 * A trait is represented as a non-negative integer,
 * which is then used as a bit index into a FilterTerm.
 */
export type Trait = number;

const TRAIT_GC_START = 0;
const TRAIT_GC_END = TRAIT_GC_START + (UNASSIGNED - UPPERCASE_LETTER) + 1;

export type ExpandedTrait = GeneralCategoryTrait;

export type GeneralCategoryTrait = {
  property: "generalCategory";
  value: GeneralCategoryReq;
};

export function expandTrait(trait: Trait): ExpandedTrait {
  if (trait >= TRAIT_GC_START && trait < TRAIT_GC_END) {
    const gcValue = (trait +
      (UPPERCASE_LETTER - TRAIT_GC_START)) as GeneralCategoryReq;
    return {
      property: "generalCategory",
      value: gcValue,
    };
  }
  throw new RangeError(`Invalid trait number: ${trait}`);
}

export function compressTrait(expandedTrait: ExpandedTrait): Trait {
  if (expandedTrait.property === "generalCategory") {
    return generalCategoryTrait(expandedTrait.value);
  }
  throw new RangeError(`Unknown property for trait: ${expandedTrait.property}`);
}

export function generalCategoryTrait(gc: GeneralCategoryReq): Trait {
  const trait = gc + (TRAIT_GC_START - UPPERCASE_LETTER);
  if (trait < TRAIT_GC_START || trait >= TRAIT_GC_END) {
    throw new RangeError("generalCategory value out of range for trait");
  }
  return trait;
}

export const GC_TRAIT_ENTRIES: readonly [GeneralCategoryReq, Trait][] =
  GENERAL_CATEGORIES.map((gc) => [gc, generalCategoryTrait(gc)]);

export const GC_TRAITS: readonly Trait[] = GC_TRAIT_ENTRIES.map(
  ([, trait]) => trait,
);

export const ALL_TRAITS: readonly Trait[] = [...GC_TRAITS];
