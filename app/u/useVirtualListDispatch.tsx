import {
  useCallback,
  useDebugValue,
  useEffect,
  useReducer,
  useState,
} from "react";
import {
  createVirtualList,
  cutOffVirtualList,
  expandVirtualList,
  type VirtualList,
} from "./virtual-list";

export type UseVirtualListDispatchResult = {
  listData: VirtualList;
  reverse: boolean;
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
  const [state, dispatch] = useReducer(queueReducer, {
    listData: createVirtualList(0),
    pending: [],
  });
  const { listData, pending } = state;

  const enqueue = useCallback((action: ListDataAction) => {
    dispatch({ type: "ENQUEUE", action });
  }, []);

  const [reverse, setReverse] = useState(false);
  const [prevReverse, setPrevReverse] = useState(false);

  useEffect(() => {
    const pendingReverse =
      pending.length === 0 ? reverse : isActionReverse(pending[0]);
    if (pendingReverse !== reverse) {
      setTimeout(() => {
        setReverse(pendingReverse);
      }, 10);
      return;
    }
    if (reverse !== prevReverse) {
      setTimeout(() => {
        setPrevReverse(reverse);
      }, 10);
      return;
    }
    if (pending.length > 0) {
      setTimeout(() => {
        dispatch({ type: "CONSUME", reverse });
      }, 10);
    }
  }, [pending, reverse, prevReverse]);

  const backwardExpand = useCallback(
    (newCps: number[], appenderRange: readonly [number, number]) => {
      enqueue({ type: "BACKWARD_EXPAND", newCps, appenderRange });
    },
    [enqueue],
  );

  const forwardExpand = useCallback(
    (newCps: number[], appenderRange: readonly [number, number]) => {
      enqueue({ type: "FORWARD_EXPAND", newCps, appenderRange });
    },
    [enqueue],
  );

  const backwardCutOff = useCallback(
    (cutOff: number, threshold: number) => {
      if (listData.list.length <= cutOff || listData.list.length <= threshold) {
        return;
      }
      enqueue({ type: "BACKWARD_CUT_OFF", cutOff, threshold });
    },
    [enqueue, listData.list.length],
  );

  const forwardCutOff = useCallback(
    (cutOff: number, threshold: number) => {
      if (listData.list.length <= cutOff || listData.list.length <= threshold) {
        return;
      }
      enqueue({ type: "FORWARD_CUT_OFF", cutOff, threshold });
    },
    [enqueue, listData.list.length],
  );

  useDebugValue({
    listData: {
      listSize: listData.list.length,
      frontier: listData.frontier,
      current: listData.current,
    },
    reverse,
  });

  return {
    listData,
    reverse,
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

function isActionReverse(action: ListDataAction | undefined): boolean {
  if (!action) return false;
  const type = action.type;
  return type === "BACKWARD_EXPAND" || type === "BACKWARD_CUT_OFF";
}

function listDataReducer(
  state: VirtualList,
  action: ListDataAction,
): VirtualList {
  switch (action.type) {
    case "BACKWARD_EXPAND":
    case "FORWARD_EXPAND":
      return expandVirtualList(state, action.newCps, action.appenderRange);
    case "BACKWARD_CUT_OFF":
    case "FORWARD_CUT_OFF":
      return cutOffVirtualList(
        state,
        action.cutOff,
        action.threshold,
        action.type === "BACKWARD_CUT_OFF" ? "backward" : "forward",
      );
    default:
      return state;
  }
}

type QueueState = {
  listData: VirtualList;
  pending: ListDataAction[];
};

type QueueAction = EnqueueAction | ConsumeAction;

type EnqueueAction = {
  type: "ENQUEUE";
  action: ListDataAction;
};

type ConsumeAction = {
  type: "CONSUME";
  reverse: boolean;
};

function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "ENQUEUE":
      return {
        ...state,
        pending: [...state.pending, action.action],
      };
    case "CONSUME": {
      let newListData = state.listData;
      let i = 0;
      while (i < state.pending.length) {
        const pendingAction = state.pending[i]!;
        const isReverse = isActionReverse(pendingAction);
        if (isReverse !== action.reverse) {
          break;
        }
        newListData = listDataReducer(newListData, pendingAction);
        i++;
      }
      return {
        ...state,
        listData: newListData,
        pending: state.pending.slice(i),
      };
    }
  }
}
