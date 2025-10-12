import { describe, expect, it } from "vitest";

import { codePointHexName } from "../unicode";
import { deriveName } from "./derived-data";

describe("deriveName", () => {
  it("returns the declared name", () => {
    expect(
      deriveName(
        0x0041,
        "LATIN CAPITAL LETTER A",
        "NAME_DERIVATION_UNSPECIFIED",
      ),
    ).toBe("LATIN CAPITAL LETTER A");
  });

  it("derives the name for a control character", () => {
    expect(deriveName(0x0000, "", "NAME_DERIVATION_CONTROL")).toBe(
      "<control-0000>",
    );
  });

  it("derives the name for a reserved character", () => {
    expect(deriveName(0xd9876, "", "NAME_DERIVATION_RESERVED")).toBe(
      "<reserved-D9876>",
    );
  });

  it("derives the name for a noncharacter", () => {
    expect(deriveName(0x10ffff, "", "NAME_DERIVATION_NONCHARACTER")).toBe(
      "<noncharacter-10FFFF>",
    );
  });

  it("derives the name for a private use character", () => {
    expect(deriveName(0xe000, "", "NAME_DERIVATION_PRIVATE_USE")).toBe(
      "<private-use-E000>",
    );
  });

  it("derives the name for a surrogate character", () => {
    expect(deriveName(0xd800, "", "NAME_DERIVATION_SURROGATE")).toBe(
      "<surrogate-D800>",
    );
  });

  it("derives the names for Hangul syllables", () => {
    const codepoints = Array.from({ length: 11172 }, (_, i) => 0xac00 + i);
    const result = codepoints.map(
      (cp) =>
        `${codePointHexName(cp)} ${deriveName(cp, "", "NAME_DERIVATION_HANGUL_SYLLABLE")}`,
    );
    expect(result).toMatchSnapshot();
  });

  it("derives the name for a CJK unified ideograph", () => {
    expect(
      deriveName(0x4e00, "", "NAME_DERIVATION_CJK_UNIFIED_IDEOGRAPH"),
    ).toBe("CJK UNIFIED IDEOGRAPH-4E00");
  });

  it("derives the name for a CJK compatibility ideograph", () => {
    expect(
      deriveName(0xf900, "", "NAME_DERIVATION_CJK_COMPATIBILITY_IDEOGRAPH"),
    ).toBe("CJK COMPATIBILITY IDEOGRAPH-F900");
  });

  it("derives the name for an Egyptian hieroglyph", () => {
    expect(deriveName(0x13460, "", "NAME_DERIVATION_EGYPTIAN_HIEROGLYPH")).toBe(
      "EGYPTIAN HIEROGLYPH-13460",
    );
  });

  it("derives the name for a Tangut ideograph", () => {
    expect(deriveName(0x17000, "", "NAME_DERIVATION_TANGUT_IDEOGRAPH")).toBe(
      "TANGUT IDEOGRAPH-17000",
    );
  });

  it("derives the name for a Khitan small script character", () => {
    expect(
      deriveName(0x18b00, "", "NAME_DERIVATION_KHITAN_SMALL_SCRIPT_CHARACTER"),
    ).toBe("KHITAN SMALL SCRIPT CHARACTER-18B00");
  });

  it("derives the name for a Nushu character", () => {
    expect(deriveName(0x1b170, "", "NAME_DERIVATION_NUSHU_CHARACTER")).toBe(
      "NUSHU CHARACTER-1B170",
    );
  });
});
