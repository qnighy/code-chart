"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { CharacterDisplay } from "./CharacterDisplay";
import { parseCPNumber, formatCPNumber } from "./cp-number";
import { CodepointModal } from "./CodepointModal";
import { LoaderCell } from "./LoaderCell";
import { useIntersectionObserver } from "./useIntersectionObserver";
import { layoutVirtualUList } from "./virtual-ulist";
import { useVirtualUListDispatch } from "./useVirtualUListDispatch";
import { codePointHex } from "../lib/unicode";

const MIN_KEEPED_LINES = 128;
const EXTRA_KEEPED_LINES = 10;

export function CodepointList() {
  const searchParams = useSearchParams();

  const currentPositionParam = searchParams.get("current");
  const currentPos = currentPositionParam
    ? parseCPNumber(currentPositionParam)
    : null;

  const {
    listData,
    backwardExpand,
    forwardExpand,
    backwardCutOff,
    forwardCutOff,
  } = useVirtualUListDispatch(currentPos ?? 0);

  const derivedList = useMemo(
    () => layoutVirtualUList(listData, currentPos ?? 0),
    [listData, currentPos],
  );
  const vlistRef = useRef<VirtuosoHandle>(null);

  const loadMoreBefore = useCallback(() => {
    const frontier = listData.frontier[0];
    if (frontier <= 0) return; // Already at the beginning
    const loadTo = Math.max(frontier - 256, 0);
    const newCps: number[] = [];
    for (let cp = loadTo; cp < frontier; cp++) {
      newCps.push(cp);
    }
    backwardExpand(newCps, [loadTo, frontier]);
  }, [backwardExpand, listData]);

  const loadMoreAfter = useCallback(() => {
    const frontier = listData.frontier[1];
    if (frontier >= 0x110000) return; // Already at the end
    const loadTo = Math.min(frontier + 256, 0x110000);
    const newCps: number[] = [];
    for (let cp = frontier; cp < loadTo; cp++) {
      newCps.push(cp);
    }
    forwardExpand(newCps, [frontier, loadTo]);
  }, [forwardExpand, listData]);

  const clearLines = (dir: "backward" | "forward") => {
    const size =
      16 *
      Math.max(
        MIN_KEEPED_LINES,
        numLinesShown.current * 2 + EXTRA_KEEPED_LINES,
      );
    if (dir === "backward") {
      backwardCutOff(size, size);
    } else {
      forwardCutOff(size, size);
    }
  };

  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  // Create two shared IntersectionObservers for loader cells using the hook
  const loaderBeforeObserver = useIntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        vlistRef.current?.scrollBy({ top: 200 });
        clearLines("forward");
        loadMoreBefore();
      }
    },
    { rootRef: scrollRootRef, rootMargin: "2048px" },
  );

  const loaderAfterObserver = useIntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        clearLines("backward");
        loadMoreAfter();
      }
    },
    { rootRef: scrollRootRef, rootMargin: "2048px" },
  );

  // Used for cache removal as a hint to how many lines should be kept
  const numLinesShown = useRef(0);
  const onRangeChanged = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      numLinesShown.current = range.endIndex - range.startIndex;

      const middleIndex = Math.floor((range.startIndex + range.endIndex) / 2);
      if (middleIndex < 0 || middleIndex >= derivedList.length) {
        return;
      }
      const middleRow = derivedList[middleIndex];
      updateUrlWithPosition(middleRow.range[0]);
    },
    [derivedList],
  );

  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    loadMoreBefore();
    loadMoreAfter();
  }, [loadMoreBefore, loadMoreAfter]);

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

  return (
    <div ref={scrollRootRef}>
      <Virtuoso
        ref={vlistRef}
        data={derivedList}
        style={{ height: "calc(100vh - 200px)" }}
        rangeChanged={onRangeChanged}
        increaseViewportBy={{ top: 400, bottom: 400 }}
        itemContent={(_rowIndex, row) => {
          const firstCell = row.cells[0]!;
          const firstCode = row.range[0];
          const key =
            firstCell.type === "Loading"
              ? `row-${codePointHex(firstCode)}-${firstCell.offset}`
              : `row-${codePointHex(firstCode)}`;
          return (
            <div key={key} className="flex flex-wrap gap-2 mb-2">
              {row.cells.map((cell) => {
                if (cell.type === "Empty") {
                  return (
                    <div
                      key={`e-${codePointHex(cell.codePoint)}-${cell.offset}`}
                      className="aspect-square w-16"
                    />
                  );
                } else if (cell.type === "Loading") {
                  return (
                    <LoaderCell
                      key={`ld-${codePointHex(cell.codePoint)}-${cell.offset}`}
                      observer={
                        cell.direction === "before"
                          ? loaderBeforeObserver
                          : loaderAfterObserver
                      }
                    />
                  );
                }

                const cpHex = formatCPNumber(cell.codePoint);

                return (
                  <Link
                    key={codePointHex(cell.codePoint)}
                    href={`/u/${cpHex}`}
                    onClick={(e) => handleLinkClick(e, cell.codePoint)}
                    className="aspect-square border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center relative group w-16"
                  >
                    <div className="text-center">
                      <CharacterDisplay
                        codePoint={cell.codePoint}
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
          );
        }}
      />

      <CodepointModal
        codePoint={selectedCodepoint}
        onClose={handleCloseModal}
        onNavigate={handleNavigate}
      />
    </div>
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

function updateUrlWithPosition(position: number | null) {
  const params = new URLSearchParams(window.location.search);
  if (position != null) {
    params.set("current", codePointHex(position));
  } else {
    params.delete("current");
  }
  const queryString = params.toString();
  const pathname = window.location.pathname;
  const hash = window.location.hash;
  const newUrl = `${pathname}${queryString ? `?${queryString}` : ""}${hash}`;
  window.history.replaceState(null, "", newUrl);
}
