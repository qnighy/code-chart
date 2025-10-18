import { useCallback, useDebugValue, useReducer } from "react";
import {
  createVirtualList,
  cutOffVirtualList,
  expandVirtualList,
  type VirtualList,
} from "./virtual-list";

export type UseVirtualListDispatchResult = {
  listData: VirtualList;
  backwardExpand: (
    newCps: number[],
    appenderRange: readonly [number, number],
  ) => void;
  forwardExpand: (
    newCps: number[],
    appenderRange: readonly [number, number],
  ) => void;
  backwardCutOff: (cutOff: number, threshold: number) => void;
  forwardCutOff: (cutOff: number, threshold: number) => void;
};

export function useVirtualListDispatch(): UseVirtualListDispatchResult {
  const [listData, dispatch] = useReducer(
    listDataReducer,
    createVirtualList(0),
  );

  const backwardExpand = useCallback(
    (newCps: number[], appenderRange: readonly [number, number]) => {
      dispatch({ type: "BACKWARD_EXPAND", newCps, appenderRange });
    },
    [],
  );

  const forwardExpand = useCallback(
    (newCps: number[], appenderRange: readonly [number, number]) => {
      dispatch({ type: "FORWARD_EXPAND", newCps, appenderRange });
    },
    [],
  );

  const backwardCutOff = useCallback((cutOff: number, threshold: number) => {
    dispatch({ type: "BACKWARD_CUT_OFF", cutOff, threshold });
  }, []);

  const forwardCutOff = useCallback((cutOff: number, threshold: number) => {
    dispatch({ type: "FORWARD_CUT_OFF", cutOff, threshold });
  }, []);

  useDebugValue({
    listSize: listData.list.length,
    frontier: listData.frontier,
    current: listData.current,
  });

  return {
    listData,
    backwardExpand,
    forwardExpand,
    backwardCutOff,
    forwardCutOff,
  };
}

type ListDataAction =
  | BackwardExpandAction
  | ForwardExpandAction
  | BackwardCutOffAction
  | ForwardCutOffAction;

type BackwardExpandAction = {
  type: "BACKWARD_EXPAND";
  newCps: number[];
  appenderRange: readonly [number, number];
};

type ForwardExpandAction = {
  type: "FORWARD_EXPAND";
  newCps: number[];
  appenderRange: readonly [number, number];
};

type BackwardCutOffAction = {
  type: "BACKWARD_CUT_OFF";
  cutOff: number;
  threshold: number;
};

type ForwardCutOffAction = {
  type: "FORWARD_CUT_OFF";
  cutOff: number;
  threshold: number;
};

function listDataReducer(
  state: VirtualList,
  action: ListDataAction,
): VirtualList {
  switch (action.type) {
    case "BACKWARD_EXPAND":
    case "FORWARD_EXPAND":
      return expandVirtualList(state, action.newCps, action.appenderRange);
    case "BACKWARD_CUT_OFF":
    case "FORWARD_CUT_OFF": {
      if (
        state.list.length <= action.cutOff ||
        state.list.length <= action.threshold
      ) {
        return state;
      }
      return cutOffVirtualList(
        state,
        action.cutOff,
        action.threshold,
        action.type === "BACKWARD_CUT_OFF" ? "backward" : "forward",
      );
    }
    default:
      return state;
  }
}
