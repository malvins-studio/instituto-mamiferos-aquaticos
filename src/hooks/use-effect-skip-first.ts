"use client";

import { useEffect, useRef } from "react";

export function useEffectSkipFirst(
  effect: () => void,
  deps: React.DependencyList
) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
