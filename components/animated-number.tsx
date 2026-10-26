"use client";
import { useEffect, useRef, useState } from "react";
/** Presentation only: never feeds animated values back into the XP engine. */
export function AnimatedNumber({
  value,
  animateOnMount = false,
}: {
  value: number;
  animateOnMount?: boolean;
}) {
  const initial = animateOnMount ? 0 : value;
  const [shown, setShown] = useState(initial);
  const previous = useRef(initial);
  useEffect(() => {
    const from = previous.current;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const start = performance.now();
    let frame = 0;
    const tick = (time: number) => {
      const t = reduced ? 1 : Math.min(1, (time - start) / 420);
      const next = Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3)));
      previous.current = next;
      setShown(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    if (from !== value) frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <span aria-label={value.toLocaleString("fr-CA")}>
      <span aria-hidden="true">{shown.toLocaleString("fr-CA")}</span>
    </span>
  );
}
