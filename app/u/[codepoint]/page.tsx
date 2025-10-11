import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";

import { parseCPNumber, formatCPNumber } from "../cp-number";
import { CharacterDisplay } from "./CharacterDisplay";
import { chunks } from "../../shared";
import { chunkIndexOf } from "../../lib/ucd/chunk";

interface PageProps {
  params: Promise<{
    codepoint: string;
  }>;
}

export default async function CodepointPage({
  params,
}: PageProps): Promise<ReactElement | null> {
  const { codepoint } = await params;

  // Parse the codepoint
  const cp = parseCPNumber(codepoint);

  // Return 404 if the codepoint is invalid
  if (cp === null) {
    notFound();
  }

  // Normalize the codepoint format
  const normalized = formatCPNumber(cp);

  // Redirect if the codepoint can be normalized (different from input)
  if (normalized !== codepoint.toUpperCase()) {
    redirect(`/u/${normalized}`);
  }

  const chunk = await chunks.getChunk(chunkIndexOf(cp));
  const entry = chunk.characters.find((c) => c.codePoint === cp);

  // Get the character from the code point
  const character = String.fromCodePoint(cp);

  // Calculate adjacent code points
  const prevCp = cp > 0 ? cp - 1 : null;
  const nextCp = cp < 0x10ffff ? cp + 1 : null;

  return (
    <div className="min-h-screen p-8 font-sans">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          U+{normalized} {entry?.name}
        </h1>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-8">
          {prevCp !== null ? (
            <Link
              href={`/u/${formatCPNumber(prevCp)}`}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Previous character"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </Link>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
          )}

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-12 text-center min-w-[200px] sm:min-w-[400px] min-h-[200px] sm:min-h-[300px] flex items-center justify-center">
            <CharacterDisplay codePoint={cp} />
          </div>

          {nextCp !== null ? (
            <Link
              href={`/u/${formatCPNumber(nextCp)}`}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
              aria-label="Next character"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </Link>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0" />
          )}
        </div>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">
              Character Information
            </h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="font-medium">Code Point:</dt>
              <dd className="font-mono">U+{normalized}</dd>

              {/* General Category */}
              <dt className="font-medium">General Category:</dt>
              <dd className="font-mono">{entry?.generalCategory}</dd>

              <dt className="font-medium">Decimal:</dt>
              <dd className="font-mono">{cp}</dd>

              <dt className="font-medium">Character:</dt>
              <dd className="text-2xl">{character}</dd>

              <dt className="font-medium">UTF-8:</dt>
              <dd className="font-mono">
                {Array.from(new TextEncoder().encode(character))
                  .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
                  .join(" ")}
              </dd>

              <dt className="font-medium">UTF-16:</dt>
              <dd className="font-mono">
                {Array.from(character)
                  .flatMap((c) => {
                    const code = c.charCodeAt(0);
                    if (code >= 0xd800 && code <= 0xdbff) {
                      // High surrogate
                      const low = character.charCodeAt(1);
                      return [code, low];
                    }
                    return [code];
                  })
                  .map((code) =>
                    code.toString(16).toUpperCase().padStart(4, "0"),
                  )
                  .join(" ")}
              </dd>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
