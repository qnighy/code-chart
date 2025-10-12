"use client";

import { use, useEffect, useRef, Suspense } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { CharacterDisplay } from "./CharacterDisplay";
import { formatCPNumber } from "./cp-number";
import { chunks } from "../shared";
import { chunkIndexOf } from "../lib/ucd/chunk";
import { deriveCharacterData } from "../lib/ucd/derived-data";

interface CodepointModalProps {
  codePoint: number | null;
  onClose: () => void;
  onNavigate: (cp: number) => void;
}

interface CodepointModalContentProps {
  codePoint: number;
  onClose: () => void;
  onNavigate: (cp: number) => void;
}

function CodepointModalContent({
  codePoint,
  onClose,
  onNavigate,
}: CodepointModalContentProps) {
  // Load chunk data using the use function
  const chunkIndex = chunkIndexOf(codePoint);
  const chunk = use(chunks.getChunk(chunkIndex));
  const entry = chunk.characters.find((c) => c.codePoint === codePoint);
  const charData = deriveCharacterData(codePoint, entry);

  const normalized = formatCPNumber(codePoint);
  const character = String.fromCodePoint(codePoint);

  const prevCp = codePoint > 0 ? codePoint - 1 : null;
  const nextCp = codePoint < 0x10ffff ? codePoint + 1 : null;

  const handlePrevious = () => {
    if (prevCp !== null) {
      onNavigate(prevCp);
    }
  };

  const handleNext = () => {
    if (nextCp !== null) {
      onNavigate(nextCp);
    }
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header with close button */}
      <div className="flex items-start justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold pr-8 text-gray-900 dark:text-gray-100">
          U+{normalized} {charData.name}
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0 text-gray-900 dark:text-gray-100"
          aria-label="Close dialog"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation and Character Display */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
        <button
          onClick={handlePrevious}
          disabled={prevCp === null}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100"
          aria-label="Previous character"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8 text-center w-[200px] sm:w-[280px] h-[200px] flex items-center justify-center text-gray-900 dark:text-gray-100">
          <CharacterDisplay
            codePoint={codePoint}
            className="text-5xl sm:text-7xl overflow-hidden"
            replacementClassName="text-gray-400 dark:text-gray-500"
          />
        </div>

        <button
          onClick={handleNext}
          disabled={nextCp === null}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed text-gray-900 dark:text-gray-100"
          aria-label="Next character"
        >
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Character Information */}
      <div className="space-y-4">
        <div className="border-t dark:border-gray-700 pt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
            Character Information
          </h3>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="font-medium text-gray-700 dark:text-gray-300">
              Code Point:
            </dt>
            <dd className="font-mono text-gray-900 dark:text-gray-100">
              U+{normalized}
            </dd>

            <dt className="font-medium text-gray-700 dark:text-gray-300">
              General Category:
            </dt>
            <dd className="font-mono text-gray-900 dark:text-gray-100">
              {charData.generalCategory}
            </dd>

            <dt className="font-medium text-gray-700 dark:text-gray-300">
              Decimal:
            </dt>
            <dd className="font-mono text-gray-900 dark:text-gray-100">
              {codePoint}
            </dd>

            <dt className="font-medium text-gray-700 dark:text-gray-300">
              Character:
            </dt>
            <dd className="text-xl text-gray-900 dark:text-gray-100">
              {character}
            </dd>

            <dt className="font-medium text-gray-700 dark:text-gray-300">
              UTF-8:
            </dt>
            <dd className="font-mono text-gray-900 dark:text-gray-100">
              {Array.from(new TextEncoder().encode(character))
                .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
                .join(" ")}
            </dd>

            <dt className="font-medium text-gray-700 dark:text-gray-300">
              UTF-16:
            </dt>
            <dd className="font-mono text-gray-900 dark:text-gray-100">
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
                .map((code) => code.toString(16).toUpperCase().padStart(4, "0"))
                .join(" ")}
            </dd>
          </dl>
        </div>
      </div>

      {/* View Full Page Link */}
      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <a
          href={`/u/${normalized}`}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          View full page →
        </a>
      </div>
    </div>
  );
}

function CodepointModalSkeleton() {
  return (
    <div className="p-6 sm:p-8 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-start justify-between mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Character display skeleton */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6">
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8 text-center w-[200px] sm:w-[280px] h-[200px] flex items-center justify-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Information skeleton */}
      <div className="space-y-4">
        <div className="border-t pt-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CodepointModal({
  codePoint,
  onClose,
  onNavigate,
}: CodepointModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (codePoint !== null) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [codePoint]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      onClose();
    };

    const handleClick = (e: MouseEvent) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!isInDialog) {
        onClose();
      }
    };

    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  if (codePoint === null) {
    return (
      <dialog
        ref={dialogRef}
        className="rounded-lg shadow-2xl backdrop:bg-black/50"
      >
        {/* Empty dialog */}
      </dialog>
    );
  }

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg shadow-2xl backdrop:bg-black/50 p-0 w-[90vw] max-w-2xl min-h-[600px] mt-[10vh] mx-auto bg-white dark:bg-gray-900"
    >
      <Suspense fallback={<CodepointModalSkeleton />}>
        <CodepointModalContent
          codePoint={codePoint}
          onClose={onClose}
          onNavigate={onNavigate}
        />
      </Suspense>
    </dialog>
  );
}
