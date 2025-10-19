import type { ReactElement } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";

import { CodepointList } from "./CodepointList";

export const metadata: Metadata = {
  title: "Unicode Code Points",
  description:
    "Browse and explore all Unicode code points. Search through the complete Unicode character database.",
  openGraph: {
    title: "Unicode Code Points",
    description:
      "Browse and explore all Unicode code points. Search through the complete Unicode character database.",
  },
  twitter: {
    card: "summary",
    title: "Unicode Code Points",
    description:
      "Browse and explore all Unicode code points. Search through the complete Unicode character database.",
  },
};

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
