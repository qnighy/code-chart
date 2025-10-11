import { notFound, redirect } from "next/navigation";
import { parseCPNumber, formatCPNumber } from "../cp-number";
import { ArbitraryText } from "../../ArbitraryText";

interface PageProps {
  params: Promise<{
    codepoint: string;
  }>;
}

export default async function CodepointPage({ params }: PageProps) {
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

  // Get the character from the code point
  const character = String.fromCodePoint(cp);

  return (
    <div className="min-h-screen p-8 font-sans">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          U+{normalized}
        </h1>
        
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-12 mb-8 text-center">
          <div className="text-9xl mb-4">
            <ArbitraryText>
              {character}
            </ArbitraryText>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-2">Character Information</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="font-medium">Code Point:</dt>
              <dd className="font-mono">U+{normalized}</dd>
              
              <dt className="font-medium">Decimal:</dt>
              <dd className="font-mono">{cp}</dd>
              
              <dt className="font-medium">Character:</dt>
              <dd className="text-2xl">{character}</dd>
              
              <dt className="font-medium">UTF-8:</dt>
              <dd className="font-mono">
                {Array.from(new TextEncoder().encode(character))
                  .map(b => b.toString(16).toUpperCase().padStart(2, "0"))
                  .join(" ")}
              </dd>
              
              <dt className="font-medium">UTF-16:</dt>
              <dd className="font-mono">
                {Array.from(character)
                  .flatMap(c => {
                    const code = c.charCodeAt(0);
                    if (code >= 0xD800 && code <= 0xDBFF) {
                      // High surrogate
                      const low = character.charCodeAt(1);
                      return [code, low];
                    }
                    return [code];
                  })
                  .map(code => code.toString(16).toUpperCase().padStart(4, "0"))
                  .join(" ")}
              </dd>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
