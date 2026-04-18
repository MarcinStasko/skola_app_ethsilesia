import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useMascotGuide — small orchestration hook on top of <MascotGuide />.
 *
 * Why a hook: lessons want to push hints from many code paths (idle timers,
 * wrong-answer detection, opportunity coaching) without manually managing
 * timeouts. The hook also de-duplicates: pushing the same tip twice in a
 * row is a no-op so we don't reset the auto-dismiss animation.
 */
export function useMascotGuide() {
  const [tip, setTip] = useState<string | null>(null);
  const lastRef = useRef<string | null>(null);

  const show = useCallback((message: string) => {
    if (lastRef.current === message) return;
    lastRef.current = message;
    setTip(message);
  }, []);

  const dismiss = useCallback(() => {
    lastRef.current = null;
    setTip(null);
  }, []);

  // Reset dedup memory when the mascot fades out organically.
  useEffect(() => {
    if (tip === null) lastRef.current = null;
  }, [tip]);

  return { tip, show, dismiss };
}
