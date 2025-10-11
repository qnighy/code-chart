export type CPNumber = number;

/**
 * Parses a hexadecimal part of U+XXXX code point notation
 * and returns the corresponding code point number.
 *
 * @param text A string representing a hexadecimal number (e.g., "1F600").
 */
export function parseCPNumber(text: string): CPNumber | null {
  if (!/^[0-9A-Fa-f]+$/.test(text)) {
    return null;
  }
  const codePoint = parseInt(text, 16);
  if (codePoint < 0x110000) {
    return codePoint;
  }
  return null;
}

/**
 * Formats a code point number as the hexadecimal part of U+XXXX notation.
 *
 * @param cp A code point number.
 */
export function formatCPNumber(cp: CPNumber): string {
  if (!Number.isInteger(cp)) {
    throw new TypeError("Code point must be an integer");
  }
  if (!(0 <= cp && cp < 0x110000)) {
    throw new RangeError("Code point must be in range 0 to 0x10FFFF");
  }
  return cp.toString(16).toUpperCase().padStart(4, "0");
}
