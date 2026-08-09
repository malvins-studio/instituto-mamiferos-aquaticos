"use client";

import { useEffect, useRef } from "react";

// Como useEffect, mas nunca dispara na primeira renderização (incluindo o
// duplo-disparo do React Strict Mode) — só roda quando uma dependência muda
// de verdade após o mount.
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
