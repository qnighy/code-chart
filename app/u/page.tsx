import type { ReactElement } from "react";
import { connection } from "next/server";

import { CodepointList } from "./CodepointList";

export default async function CodepointListPage(): Promise<ReactElement> {
  // Prevent the page from being rendered at build time
  // so that we can safely use `useSearchParams`.
  await connection();

  return (
    <div className="min-h-screen p-8 font-sans">
      <main className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Unicode Code Points</h1>

        <CodepointList />
      </main>
    </div>
  );
}
