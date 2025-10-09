import { describe, expect, it } from "vitest";
import { formatCPNumber, parseCPNumber } from "./cp-number";

describe("parseCPNumber", () => {
  it("parses normalized 4-digit hex - 0000", () => {
    expect(parseCPNumber("0000")).toBe(0x0000);
  });

  it("parses normalized 4-digit hex - ABCD", () => {
    expect(parseCPNumber("ABCD")).toBe(0xABCD);
  });

  it("parses normalized 4-digit hex - FFFF", () => {
    expect(parseCPNumber("FFFF")).toBe(0xFFFF);
  });

  it("parses normalized 4-digit hex (upper surrogate) - D800", () => {
    expect(parseCPNumber("D800")).toBe(0xD800);
  });

  it("parses normalized 4-digit hex (lower surrogate) - DFFF", () => {
    expect(parseCPNumber("DFFF")).toBe(0xDFFF);
  });

  it("parses normalized 5-digit hex - 10000", () => {
    expect(parseCPNumber("10000")).toBe(0x10000);
  });
  
  it("parses normalized 5-digit hex - 1ABCD", () => {
    expect(parseCPNumber("1ABCD")).toBe(0x1ABCD);
  });

  it("parses normalized 6-digit hex - 10FFFF", () => {
    expect(parseCPNumber("10FFFF")).toBe(0x10FFFF);
  });

  it("parses lowercase hex - abcd", () => {
    expect(parseCPNumber("abcd")).toBe(0xABCD);
  });

  it("parses mixed-case hex - aBcD", () => {
    expect(parseCPNumber("aBcD")).toBe(0xABCD);
  });

  it("parses non-padded hex - 0", () => {
    expect(parseCPNumber("0")).toBe(0x0000);
  });

  it("parses non-padded hex - ABC", () => {
    expect(parseCPNumber("ABC")).toBe(0x0ABC);
  });

  it("parses padded hex - 000000", () => {
    expect(parseCPNumber("000000")).toBe(0x0000);
  });

  it("parses padded hex - 00000000000000000000000000000000000000000000000000000000000000000000", () => {
    expect(parseCPNumber("00000000000000000000000000000000000000000000000000000000000000000000")).toBe(0x0000);
  });

  it("parses padded hex - 000ABC", () => {
    expect(parseCPNumber("000ABC")).toBe(0x0ABC);
  });

  it("parses padded hex - 0000010FFFF", () => {
    expect(parseCPNumber("0000010FFFF")).toBe(0x10FFFF);
  });

  it("returns null for the empty string", () => {
    expect(parseCPNumber("")).toBeNull();
  });

  it("returns null for non-hex characters - G", () => {
    expect(parseCPNumber("G")).toBeNull();
  });

  it("returns null for hex above Unicode range - 110000", () => {
    expect(parseCPNumber("110000")).toBeNull();
  });

  it("returns null for hex above Unicode range - 0000000000000000000000000000000000000000000000000000000110000", () => {
    expect(parseCPNumber("0000000000000000000000000000000000000000000000000000000110000")).toBeNull();
  });

  it("returns null for hex above Unicode range - FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF", () => {
    expect(parseCPNumber("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF")).toBeNull();
  });
});

describe("formatCPNumber", () => {
  it("formats BMP codepoint - 0000", () => {
    expect(formatCPNumber(0x0000)).toBe("0000");
  });

  it("formats BMP codepoint - 0ABC", () => {
    expect(formatCPNumber(0x0ABC)).toBe("0ABC");
  });

  it("formats BMP codepoint - upper surrogate - D800", () => {
    expect(formatCPNumber(0xD800)).toBe("D800");
  });

  it("formats BMP codepoint - lower surrogate - DFFF", () => {
    expect(formatCPNumber(0xDFFF)).toBe("DFFF");
  });

  it("formats BMP codepoint - ABCD", () => {
    expect(formatCPNumber(0xABCD)).toBe("ABCD");
  });

  it("formats BMP codepoint - FFFF", () => {
    expect(formatCPNumber(0xFFFF)).toBe("FFFF");
  });

  it("formats non-BMP codepoint - 10000", () => {
    expect(formatCPNumber(0x10000)).toBe("10000");
  });

  it("formats non-BMP codepoint - 1ABCD", () => {
    expect(formatCPNumber(0x1ABCD)).toBe("1ABCD");
  });

  it("formats non-BMP codepoint - 10FFFF", () => {
    expect(formatCPNumber(0x10FFFF)).toBe("10FFFF");
  });

  it("throws TypeError for non-integer codepoint - 1.5", () => {
    expect(() => {
      formatCPNumber(1.5);
    }).toThrow(TypeError);
  });

  it("throws RangeError for negative codepoint - -1", () => {
    expect(() => {
      formatCPNumber(-1);
    }).toThrow(RangeError);
  });

  it("throws RangeError for too large codepoint - 110000", () => {
    expect(() => {
      formatCPNumber(0x110000);
    }).toThrow(RangeError);
  });
});
