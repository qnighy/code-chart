"use client";

import { useState } from "react";
import Link from "next/link";
import { CharacterDisplay } from "./CharacterDisplay";
import { formatCPNumber } from "./cp-number";
import { CodepointModal } from "./CodepointModal";

interface CodepointListProps {
  codepoints: number[];
}

export function CodepointList({ codepoints }: CodepointListProps) {
  const [selectedCodepoint, setSelectedCodepoint] = useState<number | null>(
    null,
  );

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    cp: number,
  ) => {
    // Allow default behavior for modified clicks (ctrl, cmd, shift, etc.)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }

    // Prevent default navigation and show modal instead
    e.preventDefault();
    setSelectedCodepoint(cp);
  };

  const handleCloseModal = () => {
    setSelectedCodepoint(null);
  };

  const handleNavigate = (cp: number) => {
    setSelectedCodepoint(cp);
  };

  return (
    <>
      <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-2">
        {codepoints.map((cp) => {
          const cpHex = formatCPNumber(cp);

          return (
            <Link
              key={cp}
              href={`/u/${cpHex}`}
              onClick={(e) => handleLinkClick(e, cp)}
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

      <CodepointModal
        codePoint={selectedCodepoint}
        onClose={handleCloseModal}
        onNavigate={handleNavigate}
      />
    </>
  );
}
