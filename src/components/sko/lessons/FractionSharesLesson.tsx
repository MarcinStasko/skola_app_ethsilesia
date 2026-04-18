import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PieChart } from "lucide-react";

/**
 * FRAC.SHARES — Cyber Banker, Klasa 4.
 *
 * Cel pedagogiczny: ułamki jako udziały, zamiana ułamka na procent,
 * obliczanie części z całości (a/b · całość). Spółka ma N akcji, ty
 * masz K — jaki masz % udziałów i ile zarobisz z dywidendy?
 */

interface Round {
  totalShares: number;
  myShares: number;
  /** Dywidenda w zł — całkowita do podziału między wszystkich. */
  dividend: number;
  /** "percent" lub "payout" — jakiego pytamy wyniku. */
  ask: "percent" | "payout";
}

const ROUNDS: Round[] = [
  { totalShares: 10, myShares: 3,  dividend: 1000, ask: "percent" },
  { totalShares: 4,  myShares: 1,  dividend: 800,  ask: "payout" },
  { totalShares: 20, myShares: 5,  dividend: 2000, ask: "percent" },
  { totalShares: 8,  myShares: 3,  dividend: 1600, ask: "payout" },
  { totalShares: 25, myShares: 10, dividend: 5000, ask: "payout" },
];

export const FractionSharesLesson = ({ onExit }: { onExit: () => void }) => (
  <ExerciseContainer
    lessonId="g4-fractions"
    title="FRAC.SHARES"
    subtitle="Klasa 4 · Ułamki jako udziały w spółce"
    baseReward={25}
    steps={ROUNDS.length}
    onExit={onExit}
    renderStep={(i, props) => <FracStep key={i} round={ROUNDS[i]} {...props} />}
  />
);

const FracStep = ({ round, submit }: { round: Round } & ExerciseStepProps) => {
  const [value, setValue] = useState("");

  const fraction = round.myShares / round.totalShares;
  const expected = round.ask === "percent"
    ? Math.round(fraction * 100)            // %
    : Math.round(fraction * round.dividend); // zł

  const handleSubmit = () => {
    const parsed = parseFloat(value.replace(",", "."));
    if (Number.isNaN(parsed)) {
      submit(false, "Wpisz liczbę.");
      return;
    }
    const ok = Math.abs(parsed - expected) < 0.5;
    const explain = round.ask === "percent"
      ? `${round.myShares}/${round.totalShares} = ${expected}%.`
      : `${round.myShares}/${round.totalShares} · ${round.dividend} zł = ${expected} zł.`;
    submit(ok, ok ? undefined : `Poprawnie: ${explain}`);
  };

  // Pie chart segments
  const angle = fraction * 360;

  return (
    <div className="rounded-md border border-primary/30 bg-card p-6 shadow-bouncy">
      <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-primary">
        <span>&gt; SHARES.LEDGER // GRADE_4</span>
        <span className="flex items-center gap-1 text-success">
          <PieChart className="h-3 w-3" /> SYNC
        </span>
      </div>

      <div className="grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_1fr]">
        {/* Pie chart */}
        <div className="mx-auto">
          <svg width="160" height="160" viewBox="-90 -90 180 180">
            <circle r="80" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" />
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              d={describeArc(80, angle)}
              fill="hsl(var(--primary))"
              stroke="hsl(var(--primary-foreground))"
              strokeWidth="1.5"
            />
            <text textAnchor="middle" dy="0.35em" className="fill-foreground font-display font-black" fontSize="20">
              {round.myShares}/{round.totalShares}
            </text>
          </svg>
        </div>

        <div className="space-y-2 font-mono text-sm">
          <Stat label="WSZYSTKIE AKCJE" value={`${round.totalShares}`} />
          <Stat label="TWOJE AKCJE" value={`${round.myShares}`} highlight />
          <Stat label="DYWIDENDA TOTAL" value={`${round.dividend} PLN`} />
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-sm text-muted-foreground">
          {round.ask === "percent" ? (
            <>&gt; Jaki <strong className="text-foreground">% udziałów</strong> posiadasz?</>
          ) : (
            <>&gt; Ile <strong className="text-foreground">PLN dywidendy</strong> Ci przypadnie?</>
          )}
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Input
            inputMode="decimal"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-12 font-mono text-lg"
            autoFocus
          />
          <span className="font-display text-sm font-bold text-primary">
            {round.ask === "percent" ? "%" : "PLN"}
          </span>
        </div>

        <div className="mt-2 font-mono text-[11px] text-muted-foreground">
          &gt; podpowiedź: {round.ask === "percent"
            ? `${round.myShares} ÷ ${round.totalShares} × 100`
            : `${round.myShares} ÷ ${round.totalShares} × ${round.dividend}`}
        </div>
      </div>

      <Button
        disabled={!value}
        onClick={handleSubmit}
        className="mt-5 h-12 w-full rounded-md bg-primary font-display text-sm font-black uppercase tracking-widest text-primary-foreground disabled:opacity-40"
      >
        EXEC ▸ Zatwierdź wyliczenie
      </Button>
    </div>
  );
};

/** Buduje SVG path pie-slice od godziny 12 zgodnie ze wskazówkami zegara. */
function describeArc(r: number, angleDeg: number): string {
  if (angleDeg <= 0) return "";
  if (angleDeg >= 360) return `M 0 -${r} A ${r} ${r} 0 1 1 -0.01 -${r} Z`;
  const rad = (angleDeg - 90) * (Math.PI / 180);
  const x = r * Math.cos(rad);
  const y = r * Math.sin(rad);
  const large = angleDeg > 180 ? 1 : 0;
  return `M 0 0 L 0 -${r} A ${r} ${r} 0 ${large} 1 ${x.toFixed(3)} ${y.toFixed(3)} Z`;
}

const Stat = ({
  label, value, highlight,
}: { label: string; value: string; highlight?: boolean }) => (
  <div className={[
    "rounded-sm border px-3 py-2",
    highlight ? "border-primary/60 bg-primary/10" : "border-primary/15 bg-card/40",
  ].join(" ")}>
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className={`mt-0.5 ${highlight ? "text-primary text-glow" : "text-foreground"}`}>{value}</div>
  </div>
);
