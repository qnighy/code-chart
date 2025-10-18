import { useCallback, useDebugValue, useReducer } from "react";
import {
  createVirtualUList,
  cutOffVirtualUListBackward,
  cutOffVirtualUListForward,
  expandVirtualUListBackward,
  expandVirtualUListForward,
  type VirtualUList,
} from "./virtual-ulist";

export type UseVirtualUListDispatchResult = {
  listData: VirtualUList;
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

export function useVirtualUListDispatch(
  init: number,
): UseVirtualUListDispatchResult {
  const [listData, dispatch] = useReducer(
    listDataReducer,
    createVirtualUList(init),
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

  const backwardCutOff = useCallback(
    (cutOff: number, threshold: number) => {
      if (listData.rows.length <= threshold) {
        return;
      }
      dispatch({ type: "BACKWARD_CUT_OFF", cutOff });
    },
    [listData.rows.length],
  );

  const forwardCutOff = useCallback(
    (cutOff: number, threshold: number) => {
      if (listData.rows.length <= threshold) {
        return;
      }
      dispatch({ type: "FORWARD_CUT_OFF", cutOff });
    },
    [listData.rows.length],
  );

  useDebugValue({
    rowCount: listData.rows.length,
    lowFrontier: listData.lowFrontier,
    highFrontier: listData.highFrontier,
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
};

type ForwardCutOffAction = {
  type: "FORWARD_CUT_OFF";
  cutOff: number;
};

function listDataReducer(
  state: VirtualUList,
  action: ListDataAction,
): VirtualUList {
  switch (action.type) {
    case "BACKWARD_EXPAND":
      return expandVirtualUListBackward(
        state,
        action.newCps,
        action.appenderRange,
      );
    case "FORWARD_EXPAND":
      return expandVirtualUListForward(
        state,
        action.newCps,
        action.appenderRange,
      );
    case "BACKWARD_CUT_OFF":
      return cutOffVirtualUListBackward(state, action.cutOff);
    case "FORWARD_CUT_OFF": {
      return cutOffVirtualUListForward(state, action.cutOff);
    }
    default:
      return state;
  }
}
