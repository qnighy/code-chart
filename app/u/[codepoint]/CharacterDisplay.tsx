"use client";

import { ArbitraryText } from "../../ArbitraryText";

interface CharacterDisplayProps {
  codePoint: number;
}

// Get display character for control characters
// C0 controls (U+0000 to U+001F) map to Control Pictures (U+2400 to U+241F)
// Space (U+0020) maps to Open Box (U+2423)
function getDisplayChar(codePoint: number): {
  char: string;
  isSubstitute: boolean;
} {
  if (codePoint >= 0x00 && codePoint <= 0x1f) {
    // C0 control characters
    return {
      char: String.fromCodePoint(0x2400 + codePoint),
      isSubstitute: true,
    };
  } else if (codePoint === 0x20) {
    // Space character
    return {
      char: String.fromCodePoint(0x2423), // Open box
      isSubstitute: true,
    };
  }
  return { char: String.fromCodePoint(codePoint), isSubstitute: false };
}

export function CharacterDisplay({ codePoint }: CharacterDisplayProps) {
  const character = String.fromCodePoint(codePoint);
  const { char: displayChar, isSubstitute } = getDisplayChar(codePoint);

  const handleCopy = (e: React.ClipboardEvent) => {
    if (isSubstitute) {
      // Prevent default copy behavior and copy the original character instead
      e.preventDefault();
      e.clipboardData.setData("text/plain", character);
    }
  };

  return (
    <div
      className={`text-6xl sm:text-9xl overflow-hidden ${isSubstitute ? "text-gray-400 dark:text-gray-500" : ""}`}
      onCopy={handleCopy}
    >
      <ArbitraryText>{displayChar}</ArbitraryText>
    </div>
  );
}
