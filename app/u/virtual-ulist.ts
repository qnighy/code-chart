/**
 * Keeps track of a bidirectionally paginatable list of Unicode code points.
 */
export type VirtualUList = {
  /**
   * The known code points in the list, sorted in ascending order.
   */
  readonly codePoints: readonly number[];
  /**
   * The half-open range of codepoints where the list is known to be complete.
   */
  readonly frontier: readonly [low: number, high: number];
};

export function createVirtualUList(init: number): VirtualUList {
  return {
    codePoints: [],
    frontier: [init, init],
  };
}

export function expandVirtualUList(
  list: VirtualUList,
  appendCodePoints: readonly number[],
  appenderRange: readonly [low: number, high: number],
): VirtualUList {
  const newListBody = Array.from(
    new Set([...list.codePoints, ...appendCodePoints]),
  ).sort((a, b) => a - b);
  const consective =
    appenderRange[0] <= list.frontier[1] &&
    appenderRange[1] >= list.frontier[0];
  const newFrontier: readonly [number, number] = consective
    ? [
        Math.min(list.frontier[0], appenderRange[0]),
        Math.max(list.frontier[1], appenderRange[1]),
      ]
    : list.frontier;
  const newList: VirtualUList = {
    ...list,
    codePoints: newListBody,
    frontier: newFrontier,
  };
  return newList;
}

export function cutOffVirtualUList(
  list: VirtualUList,
  cutOff: number,
  threshold: number,
  dir: "backward" | "forward",
): VirtualUList {
  if (list.codePoints.length <= cutOff || list.codePoints.length <= threshold) {
    return list;
  }
  if (dir === "backward") {
    const index = list.codePoints.length - cutOff;
    const newFrontier = Math.max(
      list.frontier[0],
      list.codePoints[index - 1]! + 1,
    );
    return {
      ...list,
      codePoints: list.codePoints.slice(index),
      frontier: [newFrontier, list.frontier[1]],
    };
  } else {
    const index = cutOff;
    const newFrontier = Math.min(list.frontier[1], list.codePoints[index]!);
    return {
      ...list,
      codePoints: list.codePoints.slice(0, index),
      frontier: [list.frontier[0], newFrontier],
    };
  }
}

export type VirtualUListDerivation = readonly VirtualUListDerivationRow[];
export type VirtualUListDerivationRow = readonly VirtualUListDerivationCell[];
export type VirtualUListDerivationCell =
  | CodePointCell
  | LoadingCell
  | EmptyCell;

export type CodePointCell = {
  type: "CodePoint";
  codePoint: number;
};

export type LoadingCell = {
  type: "Loading";
  codePoint: number;
  direction: "before" | "after";
};

export type EmptyCell = {
  type: "Empty";
  codePoint: number;
};

const ROW_ALIGN = 16;
const ROW_ALIGN_THRESHOLD = 8;
const LOADER_ROWS = 4;
const RANGE_LOW = 0;
const RANGE_HIGH = 0x110000;

export function getVirtualUListDerivation(
  list: VirtualUList,
  current: number,
): VirtualUListDerivation {
  const hasLowFrontier = list.frontier[0] > RANGE_LOW;
  const hasHighFrontier = list.frontier[1] < RANGE_HIGH;

  const partialGroups = groupPartially(list.codePoints);
  let partitionPos = partialGroups.findIndex((elem) => {
    const [, end] = partialGroupRange(elem);
    return end > current;
  });
  if (partitionPos === -1) {
    partitionPos = partialGroups.length;
  }
  const partialGroupsPrecede = partialGroups.slice(0, partitionPos);
  const partialGroupsFollow = partialGroups.slice(partitionPos);
  if (hasLowFrontier) {
    const prepender: PartiallyGroupedElement[] = [];
    for (let i = 0; i < LOADER_ROWS * ROW_ALIGN; i++) {
      const codePoint = list.frontier[0] - LOADER_ROWS * ROW_ALIGN + i;
      prepender.push({ type: "Loading", codePoint, direction: "before" });
    }
    partialGroupsPrecede.unshift(...prepender);
  }
  if (hasHighFrontier) {
    const appender: PartiallyGroupedElement[] = [];
    for (let i = 0; i < LOADER_ROWS * ROW_ALIGN; i++) {
      const codePoint = list.frontier[1] + i;
      appender.push({ type: "Loading", codePoint, direction: "after" });
    }
    partialGroupsFollow.push(...appender);
  }
  const grouped: VirtualUListDerivationRow[] = [
    ...regroupForward(partialGroupsPrecede),
    ...regroupBackward(partialGroupsFollow),
  ];
  return grouped;
}

type PartiallyGroupedElement =
  | VirtualUListDerivationCell
  | { type: "Row"; row: VirtualUListDerivationRow };

function partialGroupRange(
  elem: PartiallyGroupedElement,
): readonly [number, number] {
  if (
    elem.type === "CodePoint" ||
    elem.type === "Loading" ||
    elem.type === "Empty"
  ) {
    return [elem.codePoint, elem.codePoint + 1];
  } else {
    if (elem.row.length === 0) {
      throw new TypeError("Unexpected empty partial group");
    }
    const start = Math.floor(elem.row[0]!.codePoint / ROW_ALIGN) * ROW_ALIGN;
    return [start, start + ROW_ALIGN];
  }
}

function groupPartially(
  elements: readonly number[],
): readonly PartiallyGroupedElement[] {
  const grouped: PartiallyGroupedElement[] = [];
  let i = 0;
  while (i < elements.length) {
    const start = i;
    const startElement = elements[i]!;
    i++;
    while (
      i < elements.length &&
      Math.floor(elements[i]! / ROW_ALIGN) ===
        Math.floor(startElement / ROW_ALIGN)
    ) {
      i++;
    }
    if (i - start >= ROW_ALIGN_THRESHOLD) {
      const aligned = Math.floor(startElement / ROW_ALIGN) * ROW_ALIGN;
      const group: VirtualUListDerivationCell[] = Array.from(
        { length: ROW_ALIGN },
        (_, i) => ({ type: "Empty", codePoint: aligned + i }),
      );
      for (let j = start; j < i; j++) {
        const el = elements[j]!;
        group[el % ROW_ALIGN] = { type: "CodePoint", codePoint: el };
      }
      grouped.push({ type: "Row", row: group });
    } else {
      grouped.push(
        ...elements.slice(start, i).map(
          (el): PartiallyGroupedElement => ({
            type: "CodePoint",
            codePoint: el,
          }),
        ),
      );
    }
  }
  return grouped;
}

function regroupForward(
  partialGroups: readonly PartiallyGroupedElement[],
): readonly VirtualUListDerivationRow[] {
  const grouped: VirtualUListDerivationRow[] = [];
  let currentRow: VirtualUListDerivationCell[] | null = null as
    | VirtualUListDerivationCell[]
    | null;
  const flush = (last = false) => {
    if (currentRow != null) {
      while (!last && currentRow.length < ROW_ALIGN) {
        currentRow.push({
          type: "Empty",
          codePoint: currentRow[currentRow.length - 1]!.codePoint + 1,
        });
      }
      grouped.push(currentRow);
      currentRow = null;
    }
  };

  for (const elem of partialGroups) {
    if (
      elem.type === "CodePoint" ||
      elem.type === "Loading" ||
      elem.type === "Empty"
    ) {
      if (currentRow != null && currentRow.length >= ROW_ALIGN) {
        flush();
      }
      currentRow ??= [];
      currentRow.push(elem);
    } else {
      flush();
      grouped.push(elem.row);
    }
  }
  flush(true);
  return grouped;
}

function regroupBackward(
  partialGroups: readonly PartiallyGroupedElement[],
): readonly VirtualUListDerivationRow[] {
  const groupedReversed: VirtualUListDerivationRow[] = [];
  let currentRowReversed: VirtualUListDerivationCell[] | null = null as
    | VirtualUListDerivationCell[]
    | null;
  const flush = (last = false) => {
    if (currentRowReversed != null) {
      while (!last && currentRowReversed.length < ROW_ALIGN) {
        currentRowReversed.push({
          type: "Empty",
          codePoint:
            currentRowReversed[currentRowReversed.length - 1]!.codePoint + 1,
        });
      }
      groupedReversed.push(currentRowReversed.toReversed());
      currentRowReversed = null;
    }
  };

  for (const elem of partialGroups.toReversed()) {
    if (
      elem.type === "CodePoint" ||
      elem.type === "Loading" ||
      elem.type === "Empty"
    ) {
      if (
        currentRowReversed != null &&
        currentRowReversed.length >= ROW_ALIGN
      ) {
        flush();
      }
      currentRowReversed ??= [];
      currentRowReversed.push(elem);
    } else {
      flush();
      groupedReversed.push(elem.row);
    }
  }
  flush(true);
  return groupedReversed.reverse();
}
