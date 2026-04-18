import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

/**
 * "Kalkulator Odsetek — Hacking the Vault" (Klasa 7)
 *
 * Cel pedagogiczny:
 *   - Procent składany: A = P · (1 + r/100)^t
 *   - Wyrażenia algebraiczne, potęgi, procenty
 *
 * Mechanika:
 *   1. Sejf ma TARGET wartość A (np. 14 500 zł).
 *   2. Gracz dostaje 3 slidery: Principal P, Rate r%, Time t (lat).
 *   3. Każdy slider zmienia "live" wynik. Gdy |A_user - A_target| ≤
 *      tolerancja → sejf się otwiera. Inaczej → ACCESS DENIED + glitch.
 *   4. Pasek "HACK PROGRESS" pokazuje ASCII bar 0..100% bliskości celu,
 *      więc gracz dostaje continuous feedback zanim potwierdzi.
 *
 * Edukacyjnie: gracz odkrywa że wydłużenie czasu lub podniesienie
 * stopy procentowej daje nieliniowy zysk (potęga), nie liniowy — to
 * sedno procentu składanego.
 */

interface VaultRound {
  /** Cel — kwota do "odblokowania". */
  target: number;
  /** Tolerancja absolutna w zł (im większy cel tym większa). */
  tolerance: number;
  /** Tytuł kodu misji. */
  code: string;
  /** Opis lore. */
  brief: string;
  /** Sliderowy przedział P/r/t. */
  bounds: {
    P: [number, number, number]; // [min, max, step]
    r: [number, number, number];
    t: [number, number, number];
  };
  /** Domyślne pozycje sliderów (start). */
  start: { P: number; r: number; t: number };
}

const ROUNDS: VaultRound[] = [
  {
    code: "VAULT.01 // STARTER",
    brief: "Lokata roczna. Dobierz P, r, t aby otworzyć sejf.",
    target: 1100,
    tolerance: 5,
    bounds: { P: [500, 2000, 50], r: [1, 10, 1], t: [1, 5, 1] },
    start: { P: 1000, r: 5, t: 1 },
  },
  {
    code: "VAULT.02 // CRYPTO LOAD",
    brief: "Wysoki APY, krótki termin. Procent składany działa.",
    target: 5500,
    tolerance: 25,
    bounds: { P: [2000, 8000, 100], r: [3, 15, 1], t: [1, 6, 1] },
    start: { P: 5000, r: 5, t: 1 },
  },
  {
    code: "VAULT.03 // LONG GAME",
    brief: "10 lat to potęga. Dobierz parametry.",
    target: 14500,
    tolerance: 80,
    bounds: { P: [3000, 12000, 100], r: [2, 12, 1], t: [3, 12, 1] },
    start: { P: 8000, r: 4, t: 4 },
  },
];

export const VaultHackLesson = ({ onExit }: { onExit: () => void }) => (
  <ExerciseContainer
    lessonId="g7-vault-hack"
    title="Kalkulator Odsetek"
    subtitle="Klasa 7 · Hacking the Vault — procent składany"
    baseReward={50}
    steps={ROUNDS.length}
    onExit={onExit}
    renderStep={(i, props) => <VaultRoundStep key={i} round={ROUNDS[i]} {...props} />}
  />
);

const fmt = (n: number) =>
  n.toLocaleString("pl-PL", { maximumFractionDigits: 2 });

const VaultRoundStep = ({
  round, submit,
}: { round: VaultRound } & ExerciseStepProps) => {
  const [P, setP] = useState(round.start.P);
  const [r, setR] = useState(round.start.r);
  const [t, setT] = useState(round.start.t);
  const [hacking, setHacking] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "> init holo-broker.exe",
    "> connecting to PKO.SECURE.VAULT…",
    "> READY. Adjust parameters.",
  ]);

  // A = P · (1 + r/100)^t — czysty procent składany
  const amount = useMemo(() => P * Math.pow(1 + r / 100, t), [P, r, t]);
  const delta = amount - round.target;
  const absDelta = Math.abs(delta);
  const within = absDelta <= round.tolerance;

  /**
   * Hack-progress: 0% gdy daleko, 100% gdy w tolerancji.
   * Skala logarytmiczna nadawałaby zbyt wczesne "prawie tam"; używamy
   * liniowej z punktem zerowym przy 50% targetu (miss > target/2 = 0%).
   */
  const hackPct = useMemo(() => {
    const horizon = round.target * 0.5;
    if (absDelta >= horizon) return 0;
    return Math.round(((horizon - absDelta) / horizon) * 100);
  }, [absDelta, round.target]);

  // Co zmianę parametru — krótki log, ale bez zalewania konsoli.
  const lastLogged = useRef({ P, r, t });
  useEffect(() => {
    const prev = lastLogged.current;
    const changes: string[] = [];
    if (prev.P !== P) changes.push(`SET principal = ${fmt(P)} PLN`);
    if (prev.r !== r) changes.push(`SET rate = ${r}%`);
    if (prev.t !== t) changes.push(`SET time = ${t}y`);
    if (changes.length) {
      setLogs((L) => [...L.slice(-8), ...changes.map((c) => `> ${c}`)]);
      lastLogged.current = { P, r, t };
    }
  }, [P, r, t]);

  const attemptHack = () => {
    if (hacking) return;
    setHacking(true);
    setLogs((L) => [...L.slice(-6), `> EXEC compound(P=${fmt(P)}, r=${r}%, t=${t}y)`,
      `> result: A = ${fmt(amount)} PLN`,
      `> target: ${fmt(round.target)} PLN  (Δ ${fmt(delta)})`]);

    // Animacja "łamania szyfru" trwa ~1.6s — daje teatru przed wynikiem.
    setTimeout(() => {
      if (within) {
        setLogs((L) => [...L, "> ✓ ACCESS GRANTED. Vault unlocked."]);
        submit(true, `A = P·(1+r/100)^t = ${fmt(amount)} PLN`);
      } else {
        const hint = delta > 0
          ? `Za dużo o ${fmt(absDelta)} PLN — zmniejsz t lub r.`
          : `Za mało o ${fmt(absDelta)} PLN — zwiększ t lub r (potęga!).`;
        setLogs((L) => [...L, `> ✕ ACCESS DENIED. ${hint}`]);
        submit(false, hint);
      }
      setHacking(false);
    }, 1600);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      {/* LEFT — terminal & vault status */}
      <div className="relative overflow-hidden rounded-md border border-primary/40 bg-card p-5 shadow-bouncy">
        <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-primary">
          <span className="text-glow">[{round.code}]</span>
          <span className={within ? "text-success" : "text-destructive"}>
            {within ? "● LOCK ALIGNED" : "● MISALIGNED"}
          </span>
        </div>

        <p className="mb-4 font-mono text-xs text-muted-foreground">
          &gt; {round.brief}
        </p>

        {/* Target / current readout */}
        <div className="mb-4 grid grid-cols-2 gap-2 font-mono text-xs">
          <Readout label="TARGET" value={`${fmt(round.target)} PLN`} accent="primary" />
          <Readout
            label="CURRENT"
            value={`${fmt(amount)} PLN`}
            accent={within ? "success" : "destructive"}
          />
        </div>

        {/* ASCII hack bar */}
        <AsciiHackBar pct={hackPct} hacking={hacking} />

        {/* Terminal log */}
        <div className="relative mt-4 h-44 overflow-hidden rounded-sm border border-primary/20 bg-background/60 p-3 font-mono text-[11px] leading-relaxed">
          <div className="flex flex-col gap-0.5">
            {logs.slice(-10).map((line, i) => (
              <motion.div
                key={`${i}-${line}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className={
                  line.includes("✓") ? "text-success"
                  : line.includes("✕") ? "text-destructive"
                  : line.startsWith("> SET") ? "text-accent"
                  : "text-foreground/80"
                }
              >
                {line}
              </motion.div>
            ))}
            {/* blinking caret */}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="text-primary"
            >
              _
            </motion.span>
          </div>
          <span className="scanlines pointer-events-none absolute inset-0" />
        </div>
      </div>

      {/* RIGHT — the parameter rig */}
      <div className="space-y-4 rounded-md border border-primary/30 bg-card p-5 shadow-bouncy">
        <ParamSlider
          label="P · PRINCIPAL"
          unit="PLN"
          value={P}
          bounds={round.bounds.P}
          onChange={setP}
          hint="Kapitał początkowy"
        />
        <ParamSlider
          label="r · RATE"
          unit="%"
          value={r}
          bounds={round.bounds.r}
          onChange={setR}
          hint="Roczna stopa procentowa"
        />
        <ParamSlider
          label="t · TIME"
          unit="lat"
          value={t}
          bounds={round.bounds.t}
          onChange={setT}
          hint="Liczba lat kapitalizacji"
        />

        {/* Formula reminder — algebra in plain sight */}
        <div className="rounded-sm border border-primary/20 bg-background/60 p-3 text-center font-mono text-sm">
          <span className="text-muted-foreground">A = </span>
          <span className="text-primary">P</span>
          <span className="text-muted-foreground"> · (1 + </span>
          <span className="text-primary">r</span>
          <span className="text-muted-foreground">/100)^</span>
          <span className="text-primary">t</span>
        </div>

        <Button
          disabled={hacking}
          onClick={attemptHack}
          className="h-12 w-full rounded-sm bg-gradient-primary font-mono font-bold uppercase tracking-widest text-primary-foreground shadow-bouncy disabled:opacity-50"
        >
          {hacking ? "▣ HACKING…" : "▶ EXEC HACK"}
        </Button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

const Readout = ({
  label, value, accent,
}: { label: string; value: string; accent: "primary" | "success" | "destructive" }) => {
  const color =
    accent === "primary" ? "text-primary text-glow"
    : accent === "success" ? "text-success"
    : "text-destructive";
  return (
    <div className="rounded-sm border border-primary/20 bg-background/40 p-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-1 font-display text-lg ${color}`}>{value}</div>
    </div>
  );
};

const ParamSlider = ({
  label, unit, value, bounds, onChange, hint,
}: {
  label: string;
  unit: string;
  value: number;
  bounds: [number, number, number];
  onChange: (v: number) => void;
  hint: string;
}) => {
  const [min, max, step] = bounds;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest">
        <span className="text-primary">{label}</span>
        <span className="text-foreground">
          {value.toLocaleString("pl-PL")} <span className="text-muted-foreground">{unit}</span>
        </span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="my-2"
      />
      <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
        <span>{min}</span>
        <span>{hint}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

/**
 * ASCII HACK BAR — terminal look, framed in [ ▰▰▰▱▱ ] style.
 * Renders 24 cells; filled cells use a unicode block, empty use light shade.
 * When `hacking` is true we add a sweeping shimmer overlay.
 */
const AsciiHackBar = ({ pct, hacking }: { pct: number; hacking: boolean }) => {
  const CELLS = 24;
  const filled = Math.round((pct / 100) * CELLS);
  const cells = Array.from({ length: CELLS }, (_, i) => (i < filled ? "▰" : "▱"));

  return (
    <div className="relative">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        <span>HACK PROGRESS</span>
        <span className={pct === 100 ? "text-success" : "text-primary"}>
          {pct.toString().padStart(3, "0")}%
        </span>
      </div>
      <div className="relative mt-1 overflow-hidden rounded-sm border border-primary/30 bg-background/60 px-2 py-1 font-mono text-base tracking-tight">
        <span className="text-primary">[ </span>
        <span className={pct === 100 ? "text-success" : "text-primary"}>
          {cells.join("")}
        </span>
        <span className="text-primary"> ]</span>

        {hacking && (
          <motion.span
            className="pointer-events-none absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
            initial={{ x: "-20%" }}
            animate={{ x: "120%" }}
            transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>
    </div>
  );
};
