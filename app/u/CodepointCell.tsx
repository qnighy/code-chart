"use client";

import Link from "next/link";
import { CharacterDisplay } from "./CharacterDisplay";
import { formatCPNumber } from "./cp-number";
import { codePointHex } from "../lib/unicode";

type CodepointCellProps = {
  codePoint: number;
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>, cp: number) => void;
};

export function CodepointCell({ codePoint, onLinkClick }: CodepointCellProps) {
  const cpHex = formatCPNumber(codePoint);

  return (
    <Link
      key={codePointHex(codePoint)}
      href={`/u/${cpHex}`}
      onClick={(e) => onLinkClick(e, codePoint)}
      className="aspect-square border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center relative group w-16"
    >
      <div className="text-center">
        <CharacterDisplay
          codePoint={codePoint}
          className="text-2xl sm:text-3xl md:text-4xl"
          replacementClassName="text-gray-400 dark:text-gray-500"
        />
        <div className="text-[0.5rem] sm:text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
          {cpHex}
        </div>
      </div>
    </Link>
  );
}

export function EmptyPaddingCell() {
  return (
    <div className="aspect-square border border-gray-300 dark:border-gray-700 rounded w-16" />
  );
}

export function EmptyShimmerCell() {
  return (
    <div className="aspect-square border border-gray-300 dark:border-gray-700 rounded w-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
  );
}
