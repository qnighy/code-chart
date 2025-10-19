/**
 * Sanitizes text for safe HTML serialization by removing characters
 * that would cause parsing errors or emit warnings in HTML.
 *
 * Removes:
 * - NULL and control characters (except whitespace)
 * - CR (U+000D) which gets normalized
 * - Surrogates that are not part of valid pairs
 * - Noncharacters
 */
export function sanitizeForHtmlSerialization(text: string): string {
  // See the following algorithm for allowed characters:
  //
  // - 13.2.3.5 Preprocessing the input stream https://html.spec.whatwg.org/multipage/parsing.html#preprocessing-the-input-stream
  // - 13.2.5.80 Numeric character reference end state https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state
  //
  // We need to avoid the following characters for serialization:
  //
  // - U+0000 (NULL) ... emits unexpected-null-character or null-character-reference
  // - Controls other than whitespace or NULL ... emits control-character-in-input-stream or control-character-reference
  //   - U+0001..U+0008 (U+0009 TAB and U+000A LF are whitespace)
  //   - U+000B (U+000C FF and U+000D CR are whitespace)
  //   - U+000E..U+001F
  //   - U+007F
  //   - U+0080..U+009F
  // - U+000D (CR) ... gets normalized to U+000A (LF) or emits control-character-reference
  // - Surrogates that are not part of a valid surrogate pair ... emits surrogate-in-input-stream or surrogate-character-reference
  //   - U+D800..U+DBFF upper surrogates
  //   - U+DC00..U+DFFF lower surrogates
  // - Noncharacters ... emits noncharacter-in-input-stream or noncharacter-character-reference
  //   - U+FDD0..U+FDEF
  //   - U+xFFFE and U+xFFFF for each plane x=0..16

  return text.replace(
    /[\u0000-\u0008\u000B\u000D-\u001F\u007F-\u009F\uD800-\uDFFF\p{Noncharacter_Code_Point}]/gu,
    "",
  );
}
