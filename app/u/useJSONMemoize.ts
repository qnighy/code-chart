import { useDebugValue, useMemo } from "react";

export function useJSONMemoize<T>(value: T): T {
  const json = JSON.stringify(value);
  const valueMemoized = useMemo(() => JSON.parse(json), [json]);
  useDebugValue(valueMemoized);
  return valueMemoized;
}
