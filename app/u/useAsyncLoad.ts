import { useEffect, useRef, useState } from "react";

export type UseAsyncLoadOptions = {
  requestLoad: boolean;
  onRequestLoad: () => Promise<void>;
  onError: (error: unknown) => void;
};

export type UseAsyncLoadResult = {
  isLoading: boolean;
};

/**
 * Use this hook to continually request loading data asynchronously
 * until all the required data is loaded.
 */
export function useAsyncLoad(options: UseAsyncLoadOptions): UseAsyncLoadResult {
  const { requestLoad, onRequestLoad, onError } = options;
  const isLoading = useRef(false);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!requestLoad || isLoading.current || isLoadingState || isRetrying) {
      return;
    }

    isLoading.current = true;
    setIsLoadingState(true);

    Promise.try(() => onRequestLoad())
      .catch((error) => {
        onError(error);
        setIsRetrying(true);
        setTimeout(() => {
          setIsRetrying(false);
        }, 1000);
      })
      .finally(() => {
        isLoading.current = false;
        setIsLoadingState(false);
      });
  }, [requestLoad, isLoadingState, isRetrying, onRequestLoad, onError]);

  return { isLoading: isLoadingState };
}
