"use client";

import { useEffect, useRef } from "react";

export function useEffectSkipFirst(
  effect: () => void,
  deps: React.DependencyList
) {
  const isMounted = useRef(false);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
