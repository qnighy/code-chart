import Link from "next/link";
import type { ReactElement } from "react";

import { formatCPNumber } from "./cp-number";
import { CharacterDisplay } from "./CharacterDisplay";

export default async function CodepointListPage(): Promise<ReactElement> {
  // Display the first plane (BMP - Basic Multilingual Plane) by default
  // U+0000 to U+FFFF
  const startCp = 0x0000;
  const endCp = 0x00ff; // Start with first 256 characters for now

  const codepoints: number[] = [];
  for (let cp = startCp; cp <= endCp; cp++) {
    codepoints.push(cp);
  }

  return (
    <div className="min-h-screen p-8 font-sans">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Unicode Code Points</h1>

        {/* Grid layout for code points */}
        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
          {codepoints.map((cp) => {
            const cpHex = formatCPNumber(cp);

            return (
              <Link
                key={cp}
                href={`/u/${cpHex}`}
                className="aspect-square border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center relative group"
              >
                <div className="text-center">
                  <CharacterDisplay
                    codePoint={cp}
                    className="text-2xl sm:text-3xl md:text-4xl"
                    replacementClassName="text-gray-400 dark:text-gray-500"
                  />
                  <div className="text-[0.5rem] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                    {cpHex}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
