"use client";

import { useEffect, useRef } from "react";

interface LoaderCellProps {
  observer?: IntersectionObserver;
}

export function LoaderCell({ observer }: LoaderCellProps) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = divRef.current;
    if (!element || !observer) return;

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [observer]);

  return (
    <div
      ref={divRef}
      className="aspect-square border border-dashed border-gray-300 dark:border-gray-700 rounded flex items-center justify-center w-16"
    >
      <div className="animate-pulse text-gray-400 dark:text-gray-500">
        <svg
          className="w-6 h-6"
          fill="none"
          strokeWidth="2"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </div>
    </div>
  );
}
