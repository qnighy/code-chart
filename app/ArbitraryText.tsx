/**
 * ArbitraryText serializes an arbitrary UCS-2 text as an HTML
 * by escaping controls, and replaces the resulting text with
 * the input text on hydration.
 */

"use client";

import { type ReactElement, useEffect, useState } from "react";
import { sanitizeForHtmlSerialization } from "./u/ArbitraryText.helper";

export type ArbitraryTextProps = {
  children: string;
};

export function ArbitraryText(props: ArbitraryTextProps): ReactElement | null {
  const { children } = props;
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const safeText = hydrated ? children : sanitizeForHtmlSerialization(children);

  return <>{safeText}</>;
}
