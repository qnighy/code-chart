import { useEffect, useRef } from "react";

export type UseIntersectionObserverOptions = {
  rootRef?: React.RefObject<Element | null>;
  rootMargin?: string;
  threshold?: number | number[];
};

/**
 * Custom hook that creates an IntersectionObserver with a stable callback.
 * Uses the useEvent/useEventCallback pattern to avoid recreating the observer
 * when the callback changes, but recreates the observer when options change.
 *
 * @param callback - Function to call when observed elements intersect
 * @param options - IntersectionObserver options
 * @returns The IntersectionObserver instance
 */
export function useIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: UseIntersectionObserverOptions,
): IntersectionObserver | null {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date (useEvent pattern)
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Rebuild options object for stable comparison
  const rootMargin = options?.rootMargin;
  const threshold = options?.threshold;
  const rootRef = options?.rootRef;

  // Create observer, recreating when options change
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      ...(rootMargin !== undefined && { rootMargin }),
      ...(threshold !== undefined && { threshold }),
      ...(rootRef !== undefined && { root: rootRef.current }),
    };

    observerRef.current = new IntersectionObserver((entries) => {
      // Always call the latest callback via the ref
      callbackRef.current(entries);
    }, observerOptions);

    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [rootMargin, threshold, rootRef]);

  return observerRef.current;
}
