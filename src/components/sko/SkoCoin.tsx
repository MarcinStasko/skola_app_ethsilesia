import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Animated SKO Coin — gold disc with a Polish złoty glyph. */
export const SkoCoin = ({
  size = 28,
  spinning = false,
  className,
}: { size?: number; spinning?: boolean; className?: string }) => (
  <motion.div
    className={cn(
      "inline-flex items-center justify-center rounded-full bg-gradient-coin shadow-coin font-display font-black text-coin-foreground select-none",
      spinning && "animate-coin-spin",
      className
    )}
    style={{ width: size, height: size, fontSize: size * 0.5 }}
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", stiffness: 500, damping: 18 }}
  >
    zł
  </motion.div>
);
