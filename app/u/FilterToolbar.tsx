"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import {
  addTraitToFilter,
  filterToSearchParams,
  hasTrait,
  removeTraitFromFilter,
  type Filter,
} from "./filter";
import {
  GENERAL_CATEGORIES,
  GENERAL_CATEGORY_NAMES,
  GENERAL_CATEGORY_SHORTHANDS,
  type GeneralCategoryReq,
} from "../lib/ucd/character-data";
import { generalCategoryTrait } from "./trait";

export type FilterToolbarProps = {
  filter: Filter;
};

export function FilterToolbar(props: FilterToolbarProps): ReactElement {
  const { filter } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const setFilter = useCallback(
    (newFilter: Filter) => {
      const params = new URLSearchParams(searchParams);
      filterToSearchParams(newFilter, params);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const handleToggleCategory = useCallback(
    (category: GeneralCategoryReq, isChecked: boolean) => {
      const trait = generalCategoryTrait(category);

      if (isChecked) {
        setFilter(addTraitToFilter(filter, trait));
      } else {
        setFilter(removeTraitFromFilter(filter, trait));
      }
    },
    [filter, setFilter],
  );

  const handleClearAll = useCallback(() => {
    let current: Filter = filter;
    for (const category of GENERAL_CATEGORIES) {
      current = removeTraitFromFilter(current, generalCategoryTrait(category));
    }
    setFilter(current);
  }, [filter, setFilter]);

  const handleSelectAll = useCallback(() => {
    let current: Filter = filter;
    for (const category of GENERAL_CATEGORIES) {
      current = addTraitToFilter(current, generalCategoryTrait(category));
    }
    setFilter(current);
  }, [filter, setFilter]);

  const selectedCount = useMemo(() => {
    let count = 0;
    for (const category of GENERAL_CATEGORIES) {
      if (hasTrait(filter, generalCategoryTrait(category))) {
        count++;
      }
    }
    return count;
  }, [filter]);
  const buttonLabel =
    selectedCount === 0
      ? "All General Categories"
      : selectedCount === GENERAL_CATEGORIES.length
        ? "All General Categories"
        : `${selectedCount} ${selectedCount === 1 ? "Category" : "Categories"} Selected`;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter by General Category:
        </label>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 min-w-[250px] justify-between"
          >
            <span className="text-sm truncate">{buttonLabel}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <div className="absolute z-20 mt-2 w-[400px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-[400px] overflow-hidden flex flex-col">
                {/* Header with actions */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {selectedCount} of {GENERAL_CATEGORIES.length} selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      Select All
                    </button>
                    <span className="text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Scrollable list */}
                <div className="overflow-y-auto flex-1">
                  {GENERAL_CATEGORIES.map((gc) => {
                    const isChecked = hasTrait(
                      filter,
                      generalCategoryTrait(gc),
                    );
                    const label = generalCategoryToLabel(gc);

                    return (
                      <label
                        key={gc}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) =>
                            handleToggleCategory(gc, e.currentTarget.checked)
                          }
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                          {label}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Clear filter button when there's an active filter */}
        {selectedCount > 0 && selectedCount < GENERAL_CATEGORIES.length && (
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Clear filter"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function generalCategoryToLabel(gc: GeneralCategoryReq): string {
  return `${GENERAL_CATEGORY_NAMES[gc]} (${GENERAL_CATEGORY_SHORTHANDS[gc]})`;
}
