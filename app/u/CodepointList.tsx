"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useSearchParams } from "next/navigation";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { parseCPNumber, formatCPNumber } from "./cp-number";
import { CodepointModal } from "./CodepointModal";
import {
  CodepointCell,
  EmptyPaddingCell,
  EmptyShimmerCell,
} from "./CodepointCell";
import { layoutVirtualUList } from "./virtual-ulist";
import { useVirtualUListDispatch } from "./useVirtualUListDispatch";
import { codePointHex } from "../lib/unicode";
import type { GeneralCategoryCore } from "../lib/ucd/character-data";
import { useAsyncLoad } from "./useAsyncLoad";
import { chunkIndexOf, chunkRangeOf } from "../lib/ucd/chunk";
import { chunks } from "../shared";
import { deriveCharacterData } from "../lib/ucd/derived-data";

const MIN_KEEPED_LINES = 128;
const EXTRA_KEEPED_LINES = 10;

export function CodepointList(): ReactElement | null {
  const searchParams = useSearchParams();

  const generalCategoryParam = searchParams.get("gc");
  const generalCategory =
    generalCategoryParam != null &&
    Object.hasOwn(GeneralCategoryShorthandMap, generalCategoryParam)
      ? GeneralCategoryShorthandMap[generalCategoryParam]!
      : undefined;

  return (
    <CodepointListBody
      key={generalCategory ?? "all"}
      generalCategory={generalCategory}
    />
  );
}

type CodepointListBodyProps = {
  generalCategory: GeneralCategoryCore | undefined;
};

const GeneralCategoryShorthandMap: Record<string, GeneralCategoryCore> = {
  Lu: "UPPERCASE_LETTER",
  Ll: "LOWERCASE_LETTER",
  Lt: "TITLECASE_LETTER",
  Lm: "MODIFIER_LETTER",
  Lo: "OTHER_LETTER",
  Mn: "NONSPACING_MARK",
  Mc: "SPACING_MARK",
  Me: "ENCLOSING_MARK",
  Nd: "DECIMAL_NUMBER",
  Nl: "LETTER_NUMBER",
  No: "OTHER_NUMBER",
  Pc: "CONNECTOR_PUNCTUATION",
  Pd: "DASH_PUNCTUATION",
  Ps: "OPEN_PUNCTUATION",
  Pe: "CLOSE_PUNCTUATION",
  Pi: "INITIAL_PUNCTUATION",
  Pf: "FINAL_PUNCTUATION",
  Po: "OTHER_PUNCTUATION",
  Sm: "MATH_SYMBOL",
  Sc: "CURRENCY_SYMBOL",
  Sk: "MODIFIER_SYMBOL",
  So: "OTHER_SYMBOL",
  Zs: "SPACE_SEPARATOR",
  Zl: "LINE_SEPARATOR",
  Zp: "PARAGRAPH_SEPARATOR",
  Cc: "CONTROL",
  Cf: "FORMAT",
  Cs: "SURROGATE",
  Co: "PRIVATE_USE",
  Cn: "UNASSIGNED",
};

function CodepointListBody(props: CodepointListBodyProps): ReactElement | null {
  const { generalCategory } = props;
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

  const [loadMoreBeforeTarget, setLoadMoreBeforeTarget] = useState<
    number | undefined
  >(undefined);
  const [loadMoreAfterTarget, setLoadMoreAfterTarget] = useState<
    number | undefined
  >(undefined);

  useEffect(() => {
    if (
      loadMoreBeforeTarget != null &&
      (loadMoreBeforeTarget >= listData.offset || !layoutData.hasLowFrontier)
    ) {
      // Clear the target when reached
      setLoadMoreBeforeTarget(undefined);
    }
  }, [loadMoreBeforeTarget, listData.offset, layoutData.hasLowFrontier]);

  useEffect(() => {
    if (
      loadMoreAfterTarget != null &&
      (loadMoreAfterTarget <= listData.offset + listData.rows.length ||
        !layoutData.hasHighFrontier)
    ) {
      // Clear the target when reached
      setLoadMoreAfterTarget(undefined);
    }
  }, [loadMoreAfterTarget, listData, layoutData.hasHighFrontier]);

  useAsyncLoad({
    requestLoad:
      loadMoreBeforeTarget != null &&
      loadMoreBeforeTarget < listData.offset &&
      layoutData.hasLowFrontier,
    onRequestLoad: async () => {
      const frontier = listData.lowFrontier;
      if (frontier <= 0) {
        // Already at the beginning
        setLoadMoreBeforeTarget(undefined);
        return;
      }
      const chunkIndex = chunkIndexOf(frontier - 1);
      const [chunkStart] = chunkRangeOf(chunkIndex);
      const chunk =
        generalCategory != null ? await chunks.getChunk(chunkIndex) : undefined;
      const indexedChunk = Object.fromEntries(
        chunk?.characters.map((c) => [c.codePoint, c]) ?? [],
      );
      const newCps: number[] = [];
      for (let cp = chunkStart; cp < frontier; cp++) {
        if (generalCategory != null) {
          const charData = deriveCharacterData(cp, indexedChunk[cp]);
          if (charData.generalCategory !== generalCategory) {
            continue;
          }
        }
        newCps.push(cp);
      }
      backwardExpand(newCps, [chunkStart, frontier]);
    },
    onError: (error: unknown) => {
      // TODO: show toast
      console.error(error);
    },
  });

  useAsyncLoad({
    requestLoad:
      loadMoreAfterTarget != null &&
      loadMoreAfterTarget > listData.offset + listData.rows.length &&
      layoutData.hasHighFrontier,
    onRequestLoad: async () => {
      const frontier = listData.highFrontier;
      if (frontier >= 0x110000) {
        // Already at the end
        setLoadMoreAfterTarget(undefined);
        return;
      }
      const chunkIndex = chunkIndexOf(frontier);
      const [, chunkEnd] = chunkRangeOf(chunkIndex);
      const chunk =
        generalCategory != null ? await chunks.getChunk(chunkIndex) : undefined;
      const indexedChunk = Object.fromEntries(
        chunk?.characters.map((c) => [c.codePoint, c]) ?? [],
      );
      const newCps: number[] = [];
      for (let cp = frontier; cp < chunkEnd; cp++) {
        if (generalCategory != null) {
          const charData = deriveCharacterData(cp, indexedChunk[cp]);
          if (charData.generalCategory !== generalCategory) {
            continue;
          }
        }
        newCps.push(cp);
      }
      forwardExpand(newCps, [frontier, chunkEnd]);
    },
    onError: (error: unknown) => {
      // TODO: show toast
      console.error(error);
    },
  });

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

  const requestLoadMoreBefore = useCallback(() => {
    clearLines("forward");
    setLoadMoreBeforeTarget(listData.offset - 1);
  }, [clearLines, listData.offset]);

  const requestLoadMoreAfter = useCallback(() => {
    clearLines("backward");
    setLoadMoreAfterTarget(listData.offset + listData.rows.length + 1);
  }, [clearLines, listData.offset, listData.rows.length]);

  // Used for cache removal as a hint to how many lines should be kept
  const numLinesShown = useRef(0);
  const onRangeChanged = useCallback(
    (range: { startIndex: number; endIndex: number }) => {
      numLinesShown.current = range.endIndex - range.startIndex;

      const middleIndex =
        Math.floor((range.startIndex + range.endIndex) / 2) - layoutData.offset;
      if (middleIndex < 0 || middleIndex >= layoutData.rows.length) {
        return;
      }
      const middleRow = layoutData.rows[middleIndex];
      setInitializePosition(false);
      updateUrlWithPosition(middleRow.range[0]);
    },
    [layoutData],
  );

  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    setLoadMoreBeforeTarget(layoutData.offset - 1);
    setLoadMoreAfterTarget(layoutData.offset + layoutData.rows.length + 1);
  }, [setLoadMoreBeforeTarget, setLoadMoreAfterTarget, layoutData]);

  const [initializePosition, setInitializePosition] = useState(true);

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
    <div>
      <Virtuoso
        ref={vlistRef}
        firstItemIndex={layoutData.offset}
        data={layoutData.rows}
        style={{ height: "calc(100vh - 200px)" }}
        {...(initializePosition
          ? {
              initialTopMostItemIndex: {
                align: "center",
                index: Math.min(
                  layoutData.currentRowIndex,
                  layoutData.rows.length - 1,
                ),
              },
            }
          : {})}
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
          const alignmentClass =
            row.alignment === "end" ? "justify-end" : "justify-start";
          return (
            <div
              key={key}
              className={`flex flex-wrap gap-2 mb-2 ${alignmentClass}`}
            >
              {row.cells.map((cell) => {
                if (cell.type === "Empty" && cell.cellKind === "padding") {
                  return (
                    <EmptyPaddingCell
                      key={`e-${codePointHex(cell.codePoint)}-${cell.offset}`}
                    />
                  );
                } else if (cell.type === "Empty") {
                  return (
                    <EmptyShimmerCell
                      key={`ld-${codePointHex(cell.codePoint)}-${cell.offset}`}
                    />
                  );
                }

                return (
                  <CodepointCell
                    key={codePointHex(cell.codePoint)}
                    codePoint={cell.codePoint}
                    onLinkClick={handleLinkClick}
                  />
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

function ShimmerHeader() {
  // Width calculation: 16 cells × 4rem (w-16) + 15 gaps × 0.5rem (gap-2) = 71.5rem
  return (
    <div className="mb-2">
      <div className="h-[4.5rem] max-w-[71.5rem] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded" />
    </div>
  );
}

function ShimmerFooter() {
  // Width calculation: 16 cells × 4rem (w-16) + 15 gaps × 0.5rem (gap-2) = 71.5rem
  return (
    <div className="mt-2">
      <div className="h-[4.5rem] max-w-[71.5rem] bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse rounded" />
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
