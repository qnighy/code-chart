const ROW_ALIGN = 16;
const ROW_ALIGN_THRESHOLD = 8;
const RANGE_LOW = 0;
const RANGE_HIGH = 0x110000;

/**
 * Keeps track of a bidirectionally paginatable list of Unicode code points.
 */
export type VirtualUList = {
  /**
   * The list is complete for all code points in the half-open range
   * [lowFrontier, highFrontier).
   */
  lowFrontier: number;
  /**
   * The relative offset to keep track of scroll position.
   * It points to the persistent index of the first row in `rows`.
   */
  offset: number;
  /**
   * The list of current set of rows.
   */
  rows: readonly DelimitedRow[];

  /**
   * The list is complete for all code points in the half-open range
   * [lowFrontier, highFrontier).
   */
  highFrontier: number;
};

export type DelimitedRow = DiscreteRow | AlignedRow;

export type DiscreteRow = {
  type: "Discrete";
  values: readonly number[];
};

export type AlignedRow = {
  type: "Aligned";
  values: readonly number[];
};

export function createVirtualUList(init: number): VirtualUList {
  return {
    lowFrontier: init,
    offset: 0x110000,
    rows: [],
    highFrontier: init,
  };
}

export function expandVirtualUListBackward(
  list: VirtualUList,
  prependCodePoints: readonly number[],
  prependerRange: readonly [low: number, high: number],
): VirtualUList {
  if (list.lowFrontier !== prependerRange[1]) {
    // Not an intended prepend operation.
    // Maybe caused by a race condition.
    return list;
  }
  let cutAt = 0;
  let cutSize = 0;
  while (
    cutAt < list.rows.length &&
    list.rows[cutAt - 1]?.type !== "Aligned" &&
    cutSize < ROW_ALIGN
  ) {
    cutSize += list.rows[cutAt]!.values.length;
    cutAt++;
  }
  const discretes = [
    ...prependCodePoints,
    ...list.rows.slice(0, cutAt).flatMap((row) => row.values),
  ];
  const reDelimited = delimitDiscretesBackward(discretes);
  return {
    lowFrontier: prependerRange[0],
    offset: list.offset - (reDelimited.length - cutAt),
    rows: [...reDelimited, ...list.rows.slice(cutAt)],
    highFrontier: list.highFrontier,
  };
}

export function expandVirtualUListForward(
  list: VirtualUList,
  appendCodePoints: readonly number[],
  appenderRange: readonly [low: number, high: number],
): VirtualUList {
  if (list.highFrontier !== appenderRange[0]) {
    // Not an intended append operation.
    // Maybe caused by a race condition.
    return list;
  }
  let cutAt = list.rows.length;
  let cutSize = 0;
  while (
    cutAt > 0 &&
    list.rows[cutAt]?.type !== "Aligned" &&
    cutSize < ROW_ALIGN
  ) {
    cutSize += list.rows[cutAt - 1]!.values.length;
    cutAt--;
  }
  const discretes = [
    ...list.rows.slice(cutAt).flatMap((row) => row.values),
    ...appendCodePoints,
  ];
  const reDelimited = delimitDiscretesForward(discretes);
  return {
    lowFrontier: list.lowFrontier,
    offset: list.offset,
    rows: [...list.rows.slice(0, cutAt), ...reDelimited],
    highFrontier: appenderRange[1],
  };
}

function delimitDiscretesBackward(
  discretes: readonly number[],
): DelimitedRow[] {
  const rowsReversed: DelimitedRow[] = [];
  let i = discretes.length;
  let discreteEnd = discretes.length;
  const flush = (to: number, last = false) => {
    while (discreteEnd > to && (last || discreteEnd - to >= ROW_ALIGN)) {
      const discreteStart = Math.max(to, discreteEnd - ROW_ALIGN);
      rowsReversed.push({
        type: "Discrete",
        values: discretes.slice(discreteStart, discreteEnd),
      });
      discreteEnd = discreteStart;
    }
  };
  while (i > 0) {
    const end = i;
    const endElement = discretes[i - 1]!;
    i--;
    while (
      i > 0 &&
      Math.floor(discretes[i - 1]! / ROW_ALIGN) ===
        Math.floor(endElement / ROW_ALIGN)
    ) {
      i--;
    }
    if (end - i >= ROW_ALIGN_THRESHOLD) {
      flush(end, true);
      discreteEnd = i;
      rowsReversed.push({ type: "Aligned", values: discretes.slice(i, end) });
    } else {
      flush(i);
    }
  }
  return rowsReversed.toReversed();
}

function delimitDiscretesForward(discretes: readonly number[]): DelimitedRow[] {
  const rows: DelimitedRow[] = [];
  let i = 0;
  let discreteStart = 0;
  const flush = (to: number, last = false) => {
    while (discreteStart < to && (last || to - discreteStart >= ROW_ALIGN)) {
      const discreteEnd = Math.min(to, discreteStart + ROW_ALIGN);
      rows.push({
        type: "Discrete",
        values: discretes.slice(discreteStart, discreteEnd),
      });
      discreteStart = discreteEnd;
    }
  };
  while (i < discretes.length) {
    const start = i;
    const startElement = discretes[i]!;
    i++;
    while (
      i < discretes.length &&
      Math.floor(discretes[i]! / ROW_ALIGN) ===
        Math.floor(startElement / ROW_ALIGN)
    ) {
      i++;
    }
    if (i - start >= ROW_ALIGN_THRESHOLD) {
      flush(start, true);
      discreteStart = i;
      rows.push({ type: "Aligned", values: discretes.slice(start, i) });
    } else {
      flush(i);
    }
  }
  flush(i, true);
  return rows;
}

export function cutOffVirtualUListBackward(
  list: VirtualUList,
  cutOffRows: number,
): VirtualUList {
  if (list.rows.length <= cutOffRows) {
    return list;
  }
  const index = list.rows.length - cutOffRows;
  return {
    ...list,
    offset: list.offset + index,
    rows: list.rows.slice(index),
    lowFrontier: list.rows[index - 1]!.values.at(-1)! + 1,
  };
}

export function cutOffVirtualUListForward(
  list: VirtualUList,
  cutOffRows: number,
): VirtualUList {
  if (list.rows.length <= cutOffRows) {
    return list;
  }
  const index = cutOffRows;
  return {
    ...list,
    rows: list.rows.slice(0, index),
    highFrontier: list.rows[index]!.values[0]!,
  };
}

export type VLayout = {
  rows: readonly VLayoutRow[];
  currentRowIndex: number;
  offset: number;
  hasLowFrontier: boolean;
  hasHighFrontier: boolean;
};
export type VLayoutRow = {
  readonly type: "Row";
  readonly cells: readonly VLayoutCell[];
  readonly range: readonly [number, number];
  readonly alignment: "start" | "end";
};
export type VLayoutCell = CodePointCell | EmptyCell;

export type CodePointCell = {
  type: "CodePoint";
  codePoint: number;
};

export type EmptyCell = {
  type: "Empty";
  codePoint: number;
  offset: number;
  cellKind: "padding" | "shimmer";
};

export function layoutVirtualUList(
  list: VirtualUList,
  current: number,
): VLayout {
  const hasLowFrontier = list.lowFrontier > RANGE_LOW;
  const hasHighFrontier = list.highFrontier < RANGE_HIGH;

  let currentRowPos = list.rows.findIndex((row) => {
    const end = row.values.at(-1)! + 1;
    return end > current;
  });
  if (currentRowPos === -1) {
    currentRowPos = list.rows.length;
  }
  return {
    rows: list.rows.map((row, rowIndex): VLayoutRow => {
      let cells: VLayoutCell[];
      if (row.type === "Discrete") {
        cells = row.values.map(
          (cp): VLayoutCell => ({
            type: "CodePoint",
            codePoint: cp,
          }),
        );
      } else {
        const floor = Math.floor(row.values[0]! / ROW_ALIGN) * ROW_ALIGN;
        cells = Array.from({ length: ROW_ALIGN }, (_, i): VLayoutCell => {
          const cp = floor + i;
          return {
            type: "Empty",
            codePoint: cp,
            offset: 0,
            cellKind: "padding",
          };
        });
        for (const cp of row.values) {
          cells[cp - floor] = {
            type: "CodePoint",
            codePoint: cp,
          };
        }
      }
      // Align to the right if this is the first row of a multi-row list
      // and the row is a discrete row, and there is a low frontier.
      // This means that the row may be expanded backward later.
      const alignment =
        rowIndex === 0 &&
        row.type === "Discrete" &&
        list.rows.length > 1 &&
        hasLowFrontier
          ? "end"
          : "start";
      return {
        type: "Row",
        cells,
        range: [row.values[0]!, row.values.at(-1)! + 1],
        alignment,
      };
    }),
    currentRowIndex: currentRowPos,
    offset: list.offset,
    hasLowFrontier,
    hasHighFrontier,
  };
}
