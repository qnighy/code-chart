import type { ReactElement } from "react";
import { connection } from "next/server";

import { CodepointList } from "./CodepointList";

export default async function CodepointListPage(): Promise<ReactElement> {
  // Prevent the page from being rendered at build time
  // so that we can safely use `useSearchParams`.
  await connection();

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
        <CodepointList codepoints={codepoints} />
      </main>
    </div>
  );
}
