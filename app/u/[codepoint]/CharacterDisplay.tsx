"use client";

import { ArbitraryText } from "../../ArbitraryText";

interface CharacterDisplayProps {
  codePoint: number;
  /**
   * Additional class names to apply to the container element.
   */
  className?: string | undefined;
  /**
   * Class names to apply when displaying an ordinary character.
   */
  ordinaryClassName?: string | undefined;
  /**
   * Class names to apply when displaying a substitute character (e.g., control pictures).
   */
  replacementClassName?: string | undefined;
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

export function CharacterDisplay({
  codePoint,
  className = "",
  ordinaryClassName = "",
  replacementClassName = "",
}: CharacterDisplayProps) {
  const character = String.fromCodePoint(codePoint);
  const { char: displayChar, isSubstitute } = getDisplayChar(codePoint);

  const handleCopy = (e: React.ClipboardEvent) => {
    if (isSubstitute) {
      // Prevent default copy behavior and copy the original character instead
      e.preventDefault();
      e.clipboardData.setData("text/plain", character);
    }
  };

  const appliedClassName =
    `${className} ${isSubstitute ? replacementClassName : ordinaryClassName}`.trim();

  return (
    <div className={appliedClassName} onCopy={handleCopy}>
      <ArbitraryText>{displayChar}</ArbitraryText>
    </div>
  );
}
