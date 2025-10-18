"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { VList, type VListHandle } from "virtua";
import { CharacterDisplay } from "./CharacterDisplay";
import { parseCPNumber, formatCPNumber } from "./cp-number";
import { CodepointModal } from "./CodepointModal";
import { LoaderCell } from "./LoaderCell";
import { useIntersectionObserver } from "./useIntersectionObserver";
import {
  createVirtualList,
  expandVirtualList,
  getVirtualListDerivation,
  type VirtualList,
  type VirtualListDerivationRow,
} from "./virtual-list";

export function CodepointList() {
  const [listData, setListData] = useState<VirtualList>(() =>
    createVirtualList(0),
  );
  const derivedList = useMemo(
    () => getVirtualListDerivation(listData),
    [listData],
  );
  const vlistRef = useRef<VListHandle>(null);

  const loadMoreBefore = useCallback(() => {
    const frontier = listData.frontier[0];
    if (frontier <= 0) return; // Already at the beginning
    const loadTo = Math.max(frontier - 256, 0);
    const newCps: number[] = [];
    for (let cp = loadTo; cp < frontier; cp++) {
      newCps.push(cp);
    }
    setListData((prev) => expandVirtualList(prev, newCps, [loadTo, frontier]));
  }, [listData]);

  const loadMoreAfter = useCallback(() => {
    const frontier = listData.frontier[1];
    if (frontier >= 0x110000) return; // Already at the end
    const loadTo = Math.min(frontier + 256, 0x110000);
    const newCps: number[] = [];
    for (let cp = frontier; cp < loadTo; cp++) {
      newCps.push(cp);
    }
    setListData((prev) => expandVirtualList(prev, newCps, [frontier, loadTo]));
  }, [listData]);

  // Create two shared IntersectionObservers for loader cells using the hook
  const loaderBeforeObserver = useIntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMoreBefore();
      }
    },
    { threshold: 0.1 },
  );

  const loaderAfterObserver = useIntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMoreAfter();
      }
    },
    { threshold: 0.1 },
  );

  const onScroll = useCallback(() => {
    const vlist = vlistRef.current;
    if (!vlist) {
      return;
    }
    const start = vlist.findStartIndex();
    const end = vlist.findEndIndex();
    // TODO: load-more logic
  }, []);

  const initialLoadDone = useRef(false);
  useEffect(() => {
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;
    loadMoreBefore();
    loadMoreAfter();
  }, [loadMoreBefore, loadMoreAfter]);

  const searchParams = useSearchParams();

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
    <>
      <VList<VirtualListDerivationRow>
        ref={vlistRef}
        data={derivedList}
        onScroll={onScroll}
        style={{ height: "calc(100vh - 200px)" }}
      >
        {(row, rowIndex) => {
          const firstCode = row.find((elem) => typeof elem === "number");
          const key =
            firstCode != null ? `row-${firstCode}` : `row-empty-${rowIndex}`;
          return (
            <div key={key} className="flex flex-wrap gap-2 mb-2">
              {row.map((cp, cellIndex) => {
                if (cp === "empty") {
                  return (
                    <div
                      key={`empty-${cellIndex}`}
                      className="aspect-square w-16"
                    />
                  );
                } else if (cp === "loading-before" || cp === "loading-after") {
                  return (
                    <LoaderCell
                      key={`${cp}-${cellIndex}`}
                      observer={
                        cp === "loading-before"
                          ? (loaderBeforeObserver ?? undefined)
                          : (loaderAfterObserver ?? undefined)
                      }
                    />
                  );
                }

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
          );
        }}
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
