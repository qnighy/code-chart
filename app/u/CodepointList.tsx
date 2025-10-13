"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { VList, type VListHandle } from "virtua";
import { CharacterDisplay } from "./CharacterDisplay";
import { parseCPNumber, formatCPNumber } from "./cp-number";
import { CodepointModal } from "./CodepointModal";

interface CodepointListProps {
  codepoints: number[];
}

export function CodepointList({ codepoints }: CodepointListProps) {
  const searchParams = useSearchParams();
  const vlistRef = useRef<VListHandle>(null);

  // Parse codepoint from query parameter
  const cpParam = searchParams.get("cp");
  const selectedCodepoint = cpParam ? parseCPNumber(cpParam) : null;

  // Validate and normalize the cp parameter
  useEffect(() => {
    if (!cpParam) return;

    if (selectedCodepoint != null) {
      // Check if normalization is needed
      const normalized = formatCPNumber(selectedCodepoint);
      if (normalized !== cpParam.toUpperCase()) {
        // Normalize the cp parameter
        updateUrlWithCodepoint(normalized);
      }
    } else {
      // Invalid cp parameter, remove it
      updateUrlWithCodepoint(null);
    }
  }, [cpParam, selectedCodepoint]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    cp: number,
  ) => {
    // Allow default behavior for modified clicks (ctrl, cmd, shift, etc.)
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }

    // Prevent default navigation and show modal instead by updating query params
    e.preventDefault();
    const cpHex = formatCPNumber(cp);
    updateUrlWithCodepoint(cpHex);
  };

  const handleCloseModal = () => {
    updateUrlWithCodepoint(null);
  };

  const handleNavigate = (cp: number) => {
    const cpHex = formatCPNumber(cp);
    updateUrlWithCodepoint(cpHex);
  };

  // Group codepoints into rows of 16
  const rows: number[][] = [];
  for (let i = 0; i < codepoints.length; i += 16) {
    rows.push(codepoints.slice(i, i + 16));
  }

  return (
    <>
      <VList ref={vlistRef} style={{ height: "calc(100vh - 200px)" }}>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap gap-2 mb-2">
            {row.map((cp) => {
              const cpHex = formatCPNumber(cp);

              return (
                <Link
                  key={cp}
                  href={`/u/${cpHex}`}
                  onClick={(e) => handleLinkClick(e, cp)}
                  className="aspect-square border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center relative group w-16"
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
        ))}
      </VList>

      <CodepointModal
        codePoint={selectedCodepoint}
        onClose={handleCloseModal}
        onNavigate={handleNavigate}
      />
    </>
  );
}

function updateUrlWithCodepoint(cpHex: string | null) {
  const params = new URLSearchParams(window.location.search);
  if (cpHex) {
    params.set("cp", cpHex);
  } else {
    params.delete("cp");
  }
  const queryString = params.toString();
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}${hash}`;
  window.history.replaceState(null, "", newUrl);
}
