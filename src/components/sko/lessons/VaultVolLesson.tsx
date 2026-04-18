import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Box } from "lucide-react";

/**
 * VAULT.VOL — Cyber Banker grade 6 module.
 *
 * Pedagogical core: volume of a cuboid (V = a × b × c) plus integer
 * division (how many banknote *bricks* fit inside a vault). We picked a
 * banknote brick of a fixed micro-volume so the answer is always a clean
 * integer — students reason about geometry, not about messy fractions.
 *
 * Banknote brick = 100 banknotów = 16 × 7 × 1.5 cm = 168 cm³ (real-world
 * estimate, rounded for didactic clarity). Each round states the brick
 * volume explicitly so the formula is transparent on screen.
 */

interface VaultRound {
  w: number;          // vault width  (dm)
  d: number;          // vault depth  (dm)
  h: number;          // vault height (dm)
  brickL: number;     // brick volume in litres (1 dm³ = 1 L)
  label: string;      // brick description, e.g. "100 × 100zł = 1L"
}

const ROUNDS: VaultRound[] = [
  // Volumes intentionally produce clean integer brick counts.
  { w: 4, d: 3, h: 2, brickL: 1, label: "1 paczka = 1 L" },
  { w: 5, d: 4, h: 3, brickL: 2, label: "1 paczka = 2 L" },
  { w: 6, d: 5, h: 4, brickL: 3, label: "1 paczka = 3 L" },
];

export const VaultVolLesson = ({ onExit }: { onExit: () => void }) => (
  <ExerciseContainer
    lessonId="g6-vault-vol"
    title="VAULT.VOL"
    subtitle="Objętość sejfu · ile paczek banknotów się zmieści?"
    baseReward={35}
    steps={ROUNDS.length}
    onExit={onExit}
    renderStep={(i, props) => <VaultStep key={i} round={ROUNDS[i]} {...props} />}
  />
);

const VaultStep = ({ round, submit }: { round: VaultRound } & ExerciseStepProps) => {
  const [value, setValue] = useState("");

  // Vault internal volume in litres (since 1 dm³ = 1 L). Brick count =
  // floor(volume / brick), but we author rounds so it's always exact.
  const volume   = useMemo(() => round.w * round.d * round.h, [round]);
  const expected = useMemo(() => Math.floor(volume / round.brickL), [volume, round.brickL]);

  const handleSubmit = () => {
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      submit(false, "Wpisz liczbę całkowitą paczek.");
      return;
    }
    const ok = parsed === expected;
    submit(
      ok,
      ok ? undefined : `Sejf ma ${volume} L. ${volume} ÷ ${round.brickL} = ${expected} paczek.`
    );
  };

  return (
    <div className="rounded-md border border-primary/30 bg-card p-6 shadow-bouncy">
      <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-primary">
        <span>&gt; VAULT.SCAN // GEOMETRY_MODULE</span>
        <span className="flex items-center gap-1 text-success">
          <Box className="h-3 w-3" /> CALIBRATED
        </span>
      </div>

      {/* Faux 3D vault projection */}
      <VaultVisual w={round.w} d={round.d} h={round.h} />

      {/* Spec sheet */}
      <div className="mt-5 grid grid-cols-2 gap-3 font-mono text-sm sm:grid-cols-4">
        <Stat label="SZER." value={`${round.w} dm`} />
        <Stat label="GŁĘB." value={`${round.d} dm`} />
        <Stat label="WYS."  value={`${round.h} dm`} />
        <Stat label="PACZKA" value={round.label} highlight />
      </div>

      <div className="mt-5">
        <p className="font-mono text-sm text-muted-foreground">
          &gt; Oblicz <strong className="text-foreground">objętość sejfu</strong> (a × b × c)
          i sprawdź ile paczek banknotów się zmieści.
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Input
            inputMode="numeric"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-12 font-mono text-lg"
            autoFocus
          />
          <span className="font-display text-sm font-bold text-primary">PACZEK</span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: value ? 1 : 0 }}
          className="mt-2 font-mono text-[11px] text-muted-foreground"
        >
          &gt; wzór: V = a · b · c, potem podziel przez objętość paczki.
        </motion.div>
      </div>

      <Button
        disabled={!value}
        onClick={handleSubmit}
        className="mt-5 h-12 w-full rounded-md bg-primary font-display text-sm font-black uppercase tracking-widest text-primary-foreground disabled:opacity-40"
      >
        EXEC ▸ Zapakuj sejf
      </Button>
    </div>
  );
};

/**
 * Cheap isometric-ish vault rendering. Pure CSS — no SVG dependency, no
 * three.js. Scales the cuboid so even tiny sejfs read as 3D.
 */
const VaultVisual = ({ w, d, h }: { w: number; d: number; h: number }) => {
  const max = Math.max(w, d, h);
  const px = (n: number) => 30 + (n / max) * 100; // 30..130 px range
  return (
    <div className="relative mx-auto flex h-44 items-center justify-center [perspective:600px]">
      <motion.div
        initial={{ rotateY: -20, rotateX: 18 }}
        animate={{ rotateY: [-20, -10, -20], rotateX: 18 }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: px(w),
          height: px(h),
          transformStyle: "preserve-3d",
        }}
        className="relative"
      >
        {/* front */}
        <div className="absolute inset-0 border-2 border-primary/60 bg-primary/10 [backface-visibility:hidden]" />
        {/* right side */}
        <div
          className="absolute right-0 top-0 h-full border-2 border-primary/40 bg-primary/20"
          style={{
            width: px(d),
            transform: `rotateY(90deg) translateX(${px(d) / 2}px) translateZ(${px(w) / 2 - px(d) / 2}px)`,
          }}
        />
        {/* top */}
        <div
          className="absolute left-0 top-0 w-full border-2 border-primary/40 bg-primary/30"
          style={{
            height: px(d),
            transform: `rotateX(90deg) translateY(-${px(d) / 2}px) translateZ(${px(h) / 2 - px(d) / 2}px)`,
          }}
        />
        {/* dimension labels */}
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[10px] text-primary">
          {w} dm
        </span>
        <span className="absolute -left-8 top-1/2 -translate-y-1/2 font-mono text-[10px] text-primary">
          {h} dm
        </span>
      </motion.div>
    </div>
  );
};

const Stat = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={[
    "rounded-sm border px-3 py-2",
    highlight ? "border-coin/60 bg-coin/10" : "border-primary/15 bg-card/40",
  ].join(" ")}>
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className={`mt-0.5 ${highlight ? "text-coin-foreground" : "text-primary"}`}>{value}</div>
  </div>
);
