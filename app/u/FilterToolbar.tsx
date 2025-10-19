"use client";

import { useCallback, useRef, useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import {
  GENERAL_CATEGORIES,
  filterToSearchParams,
  type Filter,
} from "./filter";
import type { GeneralCategoryCore } from "../lib/ucd/character-data";

export type FilterToolbarProps = {
  filter: Filter;
};

export function FilterToolbar(props: FilterToolbarProps): ReactElement {
  const { filter } = props;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggleCategory = useCallback(
    (category: GeneralCategoryCore) => {
      const currentCategories = new Set(filter.generalCategory);

      if (currentCategories.has(category)) {
        currentCategories.delete(category);
      } else {
        currentCategories.add(category);
      }

      const newFilter: Filter = {
        ...filter,
        generalCategory: Array.from(currentCategories),
      };

      // Update URL with new filter
      const params = new URLSearchParams(searchParams);
      filterToSearchParams(newFilter, params);

      // Preserve other params like 'cp' and 'current'
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [filter, searchParams, router],
  );

  const handleClearAll = useCallback(() => {
    const newFilter: Filter = {
      ...filter,
      generalCategory: [],
    };

    const params = new URLSearchParams(searchParams);
    filterToSearchParams(newFilter, params);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [filter, searchParams, router]);

  const handleSelectAll = useCallback(() => {
    const newFilter: Filter = {
      ...filter,
      generalCategory: [...GENERAL_CATEGORIES],
    };

    const params = new URLSearchParams(searchParams);
    filterToSearchParams(newFilter, params);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [filter, searchParams, router]);

  const selectedCount = filter.generalCategory.length;
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
                  {GENERAL_CATEGORIES.map((category) => {
                    const isChecked = filter.generalCategory.includes(category);
                    const label = generalCategoryToLabel(category);

                    return (
                      <label
                        key={category}
                        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleCategory(category)}
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

const GC_TO_LABEL: Record<GeneralCategoryCore, string> = {
  UPPERCASE_LETTER: "Uppercase Letter (Lu)",
  LOWERCASE_LETTER: "Lowercase Letter (Ll)",
  TITLECASE_LETTER: "Titlecase Letter (Lt)",
  MODIFIER_LETTER: "Modifier Letter (Lm)",
  OTHER_LETTER: "Other Letter (Lo)",
  NONSPACING_MARK: "Nonspacing Mark (Mn)",
  SPACING_MARK: "Spacing Mark (Mc)",
  ENCLOSING_MARK: "Enclosing Mark (Me)",
  DECIMAL_NUMBER: "Decimal Number (Nd)",
  LETTER_NUMBER: "Letter Number (Nl)",
  OTHER_NUMBER: "Other Number (No)",
  CONNECTOR_PUNCTUATION: "Connector Punctuation (Pc)",
  DASH_PUNCTUATION: "Dash Punctuation (Pd)",
  OPEN_PUNCTUATION: "Open Punctuation (Ps)",
  CLOSE_PUNCTUATION: "Close Punctuation (Pe)",
  INITIAL_PUNCTUATION: "Initial Punctuation (Pi)",
  FINAL_PUNCTUATION: "Final Punctuation (Pf)",
  OTHER_PUNCTUATION: "Other Punctuation (Po)",
  MATH_SYMBOL: "Math Symbol (Sm)",
  CURRENCY_SYMBOL: "Currency Symbol (Sc)",
  MODIFIER_SYMBOL: "Modifier Symbol (Sk)",
  OTHER_SYMBOL: "Other Symbol (So)",
  SPACE_SEPARATOR: "Space Separator (Zs)",
  LINE_SEPARATOR: "Line Separator (Zl)",
  PARAGRAPH_SEPARATOR: "Paragraph Separator (Zp)",
  CONTROL: "Control (Cc)",
  FORMAT: "Format (Cf)",
  SURROGATE: "Surrogate (Cs)",
  PRIVATE_USE: "Private Use (Co)",
  UNASSIGNED: "Unassigned (Cn)",
};

function generalCategoryToLabel(gc: GeneralCategoryCore): string {
  return GC_TO_LABEL[gc];
}
