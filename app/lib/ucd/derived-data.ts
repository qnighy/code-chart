import type { CharacterData, GeneralCategoryCore } from "./character-data";

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
      name: "<unassigned>",
      generalCategory: "UNASSIGNED",
    };
  }
  const { name, generalCategory = "UNASSIGNED" } = baseData;
  if (
    typeof generalCategory === "number" ||
    generalCategory === "GENERAL_CATEGORY_UNSPECIFIED"
  ) {
    throw new TypeError(`Invalid general category: ${generalCategory}`);
  }
  return {
    codePoint,
    name,
    generalCategory,
  };
}
