import { motion, type PanInfo } from "framer-motion";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A draggable Polish coin (1, 2, 5 zł).
 *
 * Why a custom coin (vs <SkoCoin />): we need realistic denomination
 * styling (silver-rim 1/2 zł, gold center 2/5 zł) so kids learn to
 * recognize real PKO/NBP coinage, not just the SKO branded chip.
 *
 * Drag mechanics:
 *  - dragMomentum=false → coin stops where released, no inertia overshoot
 *    (small kids can't aim while it's still gliding).
 *  - high spring stiffness on snap-back → satisfying "boing" return.
 *  - We pass the raw release point up via onDropEnd; the parent decides
 *    if it landed inside the piggy bank's bounding box.
 */
export interface DraggableCoinProps {
  value: 1 | 2 | 5;
  /** Stable id so React can re-key after a coin is consumed. */
  id: string;
  /** Bounds element ref — drag is constrained to this rect. */
  constraintsRef: React.RefObject<HTMLElement>;
  /** Called with viewport (clientX/Y) coords on release. */
  onDropEnd: (id: string, point: { x: number; y: number }) => void;
  /** When true, the coin animates out (consumed by piggy bank). */
  consumed?: boolean;
  className?: string;
}

const DENOM_STYLES: Record<1 | 2 | 5, string> = {
  // 1zł — solid silver
  1: "bg-gradient-to-br from-zinc-200 via-zinc-100 to-zinc-300 text-zinc-700 ring-zinc-400/60",
  // 2zł — bimetal: gold center, silver rim (we fake the rim with ring)
  2: "bg-gradient-to-br from-amber-300 via-amber-200 to-amber-400 text-amber-900 ring-zinc-400/70 ring-4",
  // 5zł — bimetal inverse: silver center, gold rim
  5: "bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200 text-zinc-700 ring-amber-400/80 ring-4",
};

export const DraggableCoin = ({
  value, id, constraintsRef, onDropEnd, consumed, className,
}: DraggableCoinProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastPoint = useRef({ x: 0, y: 0 });

  const handleDrag = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    lastPoint.current = { x: info.point.x, y: info.point.y };
  };

  const handleDragEnd = (
    e: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    // Framer's info.point can be relative to drag origin depending on
    // constraints/momentum config. The native event always carries
    // viewport coords, which is what our hit-test needs.
    let x = info.point.x;
    let y = info.point.y;
    if ("clientX" in e && typeof e.clientX === "number") {
      x = e.clientX;
      y = e.clientY;
    } else if ("changedTouches" in e && e.changedTouches?.[0]) {
      x = e.changedTouches[0].clientX;
      y = e.changedTouches[0].clientY;
    }
    onDropEnd(id, { x, y });
  };

  return (
    <motion.button
      layout
      drag={!consumed}
      dragConstraints={constraintsRef}
      dragElastic={0.18}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileHover={{ scale: 1.06, rotate: -3 }}
      whileTap={{ scale: 0.94 }}
      whileDrag={{ scale: 1.18, zIndex: 50, cursor: "grabbing" }}
      // Snap-back is automatic when we don't manually animate `x/y`
      // because dragConstraints + no momentum returns the element to
      // its layout origin via Framer's internal spring.
      animate={consumed
        ? { scale: 0, opacity: 0, y: 80, rotate: 180 }
        : { scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 520,
        damping: 22,
        mass: 0.6,
      }}
      className={cn(
        "relative flex aspect-square w-16 cursor-grab select-none items-center justify-center rounded-full font-display font-black shadow-coin ring-2 sm:w-20",
        DENOM_STYLES[value],
        isDragging && "shadow-2xl",
        className
      )}
      aria-label={`Moneta ${value} złotych`}
    >
      <div className="text-center leading-none">
        <div className="text-2xl sm:text-3xl">{value}</div>
        <div className="text-[8px] font-bold uppercase tracking-wider opacity-70">zł</div>
      </div>
    </motion.button>
  );
};
