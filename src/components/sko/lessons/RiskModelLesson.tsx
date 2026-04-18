import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert } from "lucide-react";

/**
 * RISK.MODEL — Cyber Banker, Klasa 8.
 *
 * Cel pedagogiczny: prawdopodobieństwo (P = sprzyjające/wszystkie) +
 * wartość oczekiwana strat (P · L). Klasycznie: portfel kredytów,
 * historyczna częstość defaultów → przewidywana strata roczna.
 */

interface Round {
  /** Łączna liczba kredytów w portfelu. */
  loans: number;
  /** Historyczna liczba defaultów (sprzyjające zdarzenia). */
  defaults: number;
  /** Średnia kwota straty na default (PLN). */
  avgLoss: number;
  /** "prob" – pytamy o prawdopodobieństwo w %; "expected" – wartość oczekiwana. */
  ask: "prob" | "expected";
}

const ROUNDS: Round[] = [
  { loans: 100, defaults: 5,  avgLoss: 2000,  ask: "prob" },
  { loans: 200, defaults: 10, avgLoss: 5000,  ask: "expected" },
  { loans: 50,  defaults: 4,  avgLoss: 8000,  ask: "prob" },
  { loans: 500, defaults: 25, avgLoss: 4000,  ask: "expected" },
];

export const RiskModelLesson = ({ onExit }: { onExit: () => void }) => (
  <ExerciseContainer
    lessonId="g8-risk"
    title="RISK.MODEL"
    subtitle="Klasa 8 · Prawdopodobieństwo i wartość oczekiwana"
    baseReward={60}
    steps={ROUNDS.length}
    onExit={onExit}
    renderStep={(i, props) => <RiskStep key={i} round={ROUNDS[i]} {...props} />}
  />
);

const RiskStep = ({ round, submit }: { round: Round } & ExerciseStepProps) => {
  const [value, setValue] = useState("");

  const probability = round.defaults / round.loans;            // ułamek 0..1
  const expectedLoss = probability * round.avgLoss * round.loans; // EL portfela

  const expected = round.ask === "prob"
    ? Math.round(probability * 1000) / 10   // % z 1 miejscem po przecinku
    : Math.round(expectedLoss);

  const handleSubmit = () => {
    const parsed = parseFloat(value.replace(",", "."));
    if (Number.isNaN(parsed)) {
      submit(false, "Wpisz liczbę.");
      return;
    }
    const tol = round.ask === "prob" ? 0.2 : Math.max(50, expected * 0.01);
    const ok = Math.abs(parsed - expected) <= tol;
    const explain = round.ask === "prob"
      ? `P = ${round.defaults}/${round.loans} = ${expected}%.`
      : `EL = ${round.defaults}/${round.loans} · ${round.avgLoss} · ${round.loans} = ${expected.toLocaleString("pl-PL")} PLN.`;
    submit(ok, ok ? undefined : `Poprawnie: ${explain}`);
  };

  // Wizualizacja: 100 kropek, część "default" świeci czerwono.
  const dots = useMemo(() => {
    const n = 100;
    const def = Math.round(probability * n);
    return Array.from({ length: n }, (_, i) => i < def);
  }, [probability]);

  return (
    <div className="rounded-md border border-primary/30 bg-card p-6 shadow-bouncy">
      <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-primary">
        <span>&gt; RISK.ENGINE // PORTFOLIO_SCAN</span>
        <span className="flex items-center gap-1 text-destructive">
          <ShieldAlert className="h-3 w-3" /> EXPOSURE
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-xs">
        <Readout label="LOANS"     value={`${round.loans}`} />
        <Readout label="DEFAULTS"  value={`${round.defaults}`} accent="destructive" />
        <Readout label="AVG LOSS"  value={`${round.avgLoss.toLocaleString("pl-PL")} PLN`} />
      </div>

      {/* Risk dot matrix — 10×10 */}
      <div className="mt-4 rounded-sm border border-primary/20 bg-background/40 p-3">
        <div className="mb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          // wizualizacja na próbce 100 klientów
        </div>
        <div className="grid grid-cols-10 gap-1">
          {dots.map((isDef, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.005 }}
              className={[
                "aspect-square rounded-[2px]",
                isDef ? "bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.6)]" : "bg-primary/30",
              ].join(" ")}
            />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-sm text-muted-foreground">
          {round.ask === "prob" ? (
            <>&gt; Jakie jest <strong className="text-foreground">prawdopodobieństwo defaultu</strong> (%)?</>
          ) : (
            <>&gt; Ile wynosi <strong className="text-foreground">oczekiwana strata portfela</strong> (PLN)?</>
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
            {round.ask === "prob" ? "%" : "PLN"}
          </span>
        </div>

        <div className="mt-2 font-mono text-[11px] text-muted-foreground">
          &gt; wzór: {round.ask === "prob"
            ? "P = defaulty / wszystkie · 100%"
            : "EL = P · średnia_strata · liczba_kredytów"}
        </div>
      </div>

      <Button
        disabled={!value}
        onClick={handleSubmit}
        className="mt-5 h-12 w-full rounded-md bg-primary font-display text-sm font-black uppercase tracking-widest text-primary-foreground disabled:opacity-40"
      >
        EXEC ▸ Zatwierdź ocenę ryzyka
      </Button>
    </div>
  );
};

const Readout = ({
  label, value, accent,
}: { label: string; value: string; accent?: "destructive" }) => (
  <div className={[
    "rounded-sm border px-3 py-2",
    accent === "destructive" ? "border-destructive/40 bg-destructive/5" : "border-primary/15 bg-background/40",
  ].join(" ")}>
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className={[
      "mt-0.5 font-mono",
      accent === "destructive" ? "text-destructive" : "text-primary",
    ].join(" ")}>
      {value}
    </div>
  </div>
);
