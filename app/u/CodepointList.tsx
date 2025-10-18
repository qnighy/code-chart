"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { CharacterDisplay } from "./CharacterDisplay";
import { parseCPNumber, formatCPNumber } from "./cp-number";
import { CodepointModal } from "./CodepointModal";
import { LoaderCell } from "./LoaderCell";
import { layoutVirtualUList } from "./virtual-ulist";
import { useVirtualUListDispatch } from "./useVirtualUListDispatch";
import { codePointHex } from "../lib/unicode";

const MIN_KEEPED_LINES = 128;
const EXTRA_KEEPED_LINES = 10;

function ShimmerHeader() {
  return (
    <div className="w-full mb-2">
      <div className="h-[4.5rem] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded" />
    </div>
  );
}

function ShimmerFooter() {
  return (
    <div className="w-full mt-2">
      <div className="h-[4.5rem] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded" />
    </div>
  );
}

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

  const layoutData = useMemo(
    () => layoutVirtualUList(listData, currentPos ?? 0),
    [listData, currentPos],
  );
  const vlistRef = useRef<VirtuosoHandle>(null);

  const loadMoreBefore = useCallback(() => {
    const frontier = listData.lowFrontier;
    if (frontier <= 0) return; // Already at the beginning
    const loadTo = Math.max(frontier - 256, 0);
    const newCps: number[] = [];
    for (let cp = loadTo; cp < frontier; cp++) {
      newCps.push(cp);
    }
    setTimeout(() => {
      backwardExpand(newCps, [loadTo, frontier]);
    }, 0);
  }, [backwardExpand, listData]);

  const loadMoreAfter = useCallback(() => {
    const frontier = listData.highFrontier;
    if (frontier >= 0x110000) return; // Already at the end
    const loadTo = Math.min(frontier + 256, 0x110000);
    const newCps: number[] = [];
    for (let cp = frontier; cp < loadTo; cp++) {
      newCps.push(cp);
    }
    setTimeout(() => {
      forwardExpand(newCps, [frontier, loadTo]);
    }, 0);
  }, [forwardExpand, listData]);

  const clearLines = useCallback(
    (dir: "backward" | "forward") => {
      const size = Math.max(
        MIN_KEEPED_LINES,
        numLinesShown.current * 2 + EXTRA_KEEPED_LINES,
      );
      if (dir === "backward") {
        backwardCutOff(size, size);
      } else {
        forwardCutOff(size, size);
      }
    },
    [backwardCutOff, forwardCutOff],
  );

  const scrollRootRef = useRef<HTMLDivElement | null>(null);

  const requestLoadMoreBefore = useCallback(() => {
    clearLines("forward");
    loadMoreBefore();
  }, [clearLines, loadMoreBefore]);

  const requestLoadMoreAfter = useCallback(() => {
    clearLines("backward");
    loadMoreAfter();
  }, [clearLines, loadMoreAfter]);

  // Used for cache removal as a hint to how many lines should be kept
  const numLinesShown = useRef(0);
  const onRangeChanged = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      numLinesShown.current = range.endIndex - range.startIndex;

      if (range.startIndex <= 0 && layoutData.hasLowFrontier) {
        // Compensation for oft-misbehaving Virtuoso's startReached callback.
        vlistRef.current?.scrollToIndex({ align: "start", index: 1 });
        requestLoadMoreBefore();
      }

      const middleIndex = Math.floor((range.startIndex + range.endIndex) / 2);
      if (middleIndex < 0 || middleIndex >= layoutData.rows.length) {
        return;
      }
      const middleRow = layoutData.rows[middleIndex];
      updateUrlWithPosition(middleRow.range[0]);
    },
    [layoutData, requestLoadMoreBefore],
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

  const showTopShimmer = layoutData.hasLowFrontier;
  const showBottomShimmer = layoutData.hasHighFrontier;

  return (
    <div ref={scrollRootRef}>
      <Virtuoso
        ref={vlistRef}
        firstItemIndex={layoutData.offset}
        data={layoutData.rows}
        style={{ height: "calc(100vh - 200px)" }}
        initialTopMostItemIndex={{
          align: "center",
          index: Math.min(
            layoutData.currentRowIndex,
            layoutData.rows.length - 1,
          ),
        }}
        rangeChanged={onRangeChanged}
        startReached={requestLoadMoreBefore}
        endReached={requestLoadMoreAfter}
        increaseViewportBy={{ top: 400, bottom: 400 }}
        overscan={{ main: 1000, reverse: 1000 }}
        components={{
          Header: showTopShimmer ? ShimmerHeader : undefined,
          Footer: showBottomShimmer ? ShimmerFooter : undefined,
        }}
        itemContent={(_rowIndex, row) => {
          const firstCode = row.range[0];
          const key = `row-${codePointHex(firstCode)}`;
          return (
            <div key={key} className="flex flex-wrap gap-2 mb-2">
              {row.cells.map((cell) => {
                if (cell.type === "Empty" && cell.cellKind === "padding") {
                  return (
                    <div
                      key={`e-${codePointHex(cell.codePoint)}-${cell.offset}`}
                      className="aspect-square w-16"
                    />
                  );
                } else if (cell.type === "Empty") {
                  return (
                    <LoaderCell
                      key={`ld-${codePointHex(cell.codePoint)}-${cell.offset}`}
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
