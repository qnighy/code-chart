/**
 * Keeps track of a bidirectionally paginatable list.
 */
export type VirtualList = {
  /**
   * The view containing a consecutive part of the list
   * with known items.
   */
  readonly list: readonly number[];
  /**
   * The half-open range of values where the list is known to be complete.
   */
  readonly frontier: readonly [low: number, high: number];
};

export function createVirtualList(init: number): VirtualList {
  return {
    list: [],
    frontier: [init, init],
  };
}

export function expandVirtualList(
  list: VirtualList,
  append: readonly number[],
  appenderRange: readonly [low: number, high: number],
): VirtualList {
  const newListBody = Array.from(new Set([...list.list, ...append])).sort(
    (a, b) => a - b,
  );
  const consective =
    appenderRange[0] <= list.frontier[1] &&
    appenderRange[1] >= list.frontier[0];
  const newFrontier: readonly [number, number] = consective
    ? [
        Math.min(list.frontier[0], appenderRange[0]),
        Math.max(list.frontier[1], appenderRange[1]),
      ]
    : list.frontier;
  const newList: VirtualList = {
    ...list,
    list: newListBody,
    frontier: newFrontier,
  };
  return newList;
}

// TODO: virtualListCutOff function

export function cutOffVirtualList(
  list: VirtualList,
  cutOff: number,
  threshold: number,
  dir: "backward" | "forward",
): VirtualList {
  if (list.list.length <= cutOff || list.list.length <= threshold) {
    return list;
  }
  if (dir === "backward") {
    const index = list.list.length - cutOff;
    const newFrontier = Math.max(list.frontier[0], list.list[index - 1]! + 1);
    return {
      ...list,
      list: list.list.slice(index),
      frontier: [newFrontier, list.frontier[1]],
    };
  } else {
    const index = cutOff;
    const newFrontier = Math.min(list.frontier[1], list.list[index]!);
    return {
      ...list,
      list: list.list.slice(0, index),
      frontier: [list.frontier[0], newFrontier],
    };
  }
}

export type VirtualListDerivation = readonly VirtualListDerivationRow[];
export type VirtualListDerivationRow = readonly VirtualListDerivationCell[];
export type VirtualListDerivationCell =
  | number
  | "loading-before"
  | "loading-after"
  | "empty";

const ROW_ALIGN = 16;
const ROW_ALIGN_THRESHOLD = 8;
const LOADER_ROWS = 4;
const RANGE_LOW = 0;
const RANGE_HIGH = 0x110000;

export function getVirtualListDerivation(
  list: VirtualList,
  current: number,
): VirtualListDerivation {
  const hasLowFrontier = list.frontier[0] > RANGE_LOW;
  const hasHighFrontier = list.frontier[1] < RANGE_HIGH;

  const partialGroups = groupPartially(list.list);
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
      prepender.push("loading-before");
    }
    partialGroupsPrecede.unshift(...prepender);
  }
  if (hasHighFrontier) {
    const appender: PartiallyGroupedElement[] = [];
    for (let i = 0; i < LOADER_ROWS * ROW_ALIGN; i++) {
      appender.push("loading-after");
    }
    partialGroupsFollow.push(...appender);
  }
  const grouped: VirtualListDerivationRow[] = [
    ...regroupForward(partialGroupsPrecede),
    ...regroupBackward(partialGroupsFollow),
  ];
  return grouped;
}

type PartiallyGroupedElement =
  | VirtualListDerivationCell
  | VirtualListDerivationRow;

function partialGroupRange(
  elem: PartiallyGroupedElement,
): readonly [number, number] {
  if (typeof elem === "number") {
    return [elem, elem + 1];
  } else if (typeof elem === "string") {
    throw new TypeError("Unexpected loading or empty cell in partial group");
  } else {
    const el = elem.find((e) => typeof e === "number");
    if (el == null) {
      throw new TypeError("Unexpected empty partial group");
    }
    const start = Math.floor((el as number) / ROW_ALIGN) * ROW_ALIGN;
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
      const group: (number | "empty")[] = Array.from(
        { length: ROW_ALIGN },
        () => "empty",
      );
      for (let j = start; j < i; j++) {
        const el = elements[j]!;
        group[el % ROW_ALIGN] = el;
      }
      grouped.push(group);
    } else {
      grouped.push(...elements.slice(start, i));
    }
  }
  return grouped;
}

function regroupForward(
  partialGroups: readonly PartiallyGroupedElement[],
): readonly VirtualListDerivationRow[] {
  const grouped: VirtualListDerivationRow[] = [];
  let currentRow: VirtualListDerivationCell[] | null = null as
    | VirtualListDerivationCell[]
    | null;
  const flush = (last = false) => {
    if (currentRow != null) {
      while (!last && currentRow.length < ROW_ALIGN) {
        currentRow.push("empty");
      }
      grouped.push(currentRow);
      currentRow = null;
    }
  };

  for (const elem of partialGroups) {
    if (typeof elem === "number" || typeof elem === "string") {
      if (currentRow != null && currentRow.length >= ROW_ALIGN) {
        flush();
      }
      currentRow ??= [];
      currentRow.push(elem);
    } else {
      flush();
      grouped.push(elem);
    }
  }
  flush(true);
  return grouped;
}

function regroupBackward(
  partialGroups: readonly PartiallyGroupedElement[],
): readonly VirtualListDerivationRow[] {
  const groupedReversed: VirtualListDerivationRow[] = [];
  let currentRowReversed: VirtualListDerivationCell[] | null = null as
    | VirtualListDerivationCell[]
    | null;
  const flush = (last = false) => {
    if (currentRowReversed != null) {
      while (!last && currentRowReversed.length < ROW_ALIGN) {
        currentRowReversed.push("empty");
      }
      groupedReversed.push(currentRowReversed.toReversed());
      currentRowReversed = null;
    }
  };

  for (const elem of partialGroups.toReversed()) {
    if (typeof elem === "number" || typeof elem === "string") {
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
      groupedReversed.push(elem);
    }
  }
  flush(true);
  return groupedReversed.reverse();
}
