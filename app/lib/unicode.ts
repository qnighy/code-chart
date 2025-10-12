export function codePointHex(cp: number): string {
  if (cp < 0 || cp > 0x10ffff) {
    throw new RangeError(`Code point out of range: 0x${cp.toString(16)}`);
  }
  return cp.toString(16).toUpperCase().padStart(4, "0");
}

export function codePointHexName(cp: number): string {
  return `U+${codePointHex(cp)}`;
}
