import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightLeft, TrendingUp, TrendingDown } from "lucide-react";

/**
 * FX.KANTOR — Cyber grade 5. Ułamki dziesiętne × mnożenie.
 *
 * Kursy losowane w realistycznych przedziałach (±10% wokół bazy), kwoty
 * dobierane tak, by wynik miał ≤ 2 miejsca po przecinku — bez floating-point
 * traum dla ucznia. Tolerancja 0.011 (1 grosz/cent) zostaje.
 */

interface FxRound {
  pair: string;
  rate: number;
  amount: number;
  source: string;
  target: string;
  trend: "up" | "down";
}

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]) => arr[rand(0, arr.length - 1)];

/**
 * Bazowe kursy ~ rynek 2024/2025. Losujemy ±10% i zaokrąglamy do 2 miejsc.
 * Kwoty dobieramy z listy "ładnych" liczb żeby wynik wyszedł czysty.
 */
const PAIRS = [
  { source: "PLN", target: "EUR", base: 0.23, amounts: [50, 100, 200, 150] },
  { source: "EUR", target: "PLN", base: 4.32, amounts: [10, 20, 25, 50] },
  { source: "USD", target: "PLN", base: 4.05, amounts: [10, 20, 40, 50] },
  { source: "PLN", target: "USD", base: 0.25, amounts: [100, 200, 400, 80] },
  { source: "EUR", target: "USD", base: 1.08, amounts: [25, 50, 100, 75] },
  { source: "GBP", target: "PLN", base: 5.10, amounts: [10, 20, 30, 50] },
  { source: "PLN", target: "CZK", base: 5.80, amounts: [10, 20, 50, 100] },
] as const;

const buildRounds = (): FxRound[] => {
  // 5 unikalnych par.
  const shuffled = [...PAIRS].sort(() => Math.random() - 0.5).slice(0, 5);
  return shuffled.map((p) => {
    // ±10% szumu wokół kursu bazowego, 2 miejsca po przecinku.
    const noise = 1 + (Math.random() * 0.2 - 0.1);
    const rate = Math.round(p.base * noise * 100) / 100;
    return {
      pair: `${p.source} → ${p.target}`,
      rate,
      amount: pick(p.amounts),
      source: p.source,
      target: p.target,
      trend: noise >= 1 ? "up" : "down",
    };
  });
};

export const FxKantorLesson = ({ onExit }: { onExit: () => void }) => {
  const rounds = useMemo(() => buildRounds(), []);
  return (
    <ExerciseContainer
      lessonId="g5-fx-kantor"
      title="FX.KANTOR"
      subtitle="Wymiana walut · ułamki dziesiętne"
      baseReward={30}
      steps={rounds.length}
      onExit={onExit}
      renderStep={(i, props) => <FxStep key={i} round={rounds[i]} {...props} />}
    />
  );
};

const FxStep = ({ round, submit }: { round: FxRound } & ExerciseStepProps) => {
  const [value, setValue] = useState("");
  const expected = useMemo(
    () => Math.round(round.amount * round.rate * 100) / 100,
    [round]
  );

  const handleSubmit = () => {
    const parsed = parseFloat(value.replace(",", "."));
    if (Number.isNaN(parsed)) {
      submit(false, "Wpisz liczbę — użyj kropki lub przecinka.");
      return;
    }
    const ok = Math.abs(parsed - expected) < 0.011;
    submit(
      ok,
      ok ? undefined : `Poprawnie: ${expected.toFixed(2)} ${round.target}. Wzór: ${round.amount} × ${round.rate}.`
    );
  };

  const TrendIcon = round.trend === "up" ? TrendingUp : TrendingDown;
  const trendCls  = round.trend === "up" ? "text-success" : "text-destructive";

  return (
    <div className="rounded-md border border-primary/30 bg-card p-6 shadow-bouncy">
      <div className="mb-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-primary">
        <span>&gt; KANTOR.EXE // SESSION_OPEN</span>
        <span className={`flex items-center gap-1 ${trendCls}`}>
          <TrendIcon className="h-3 w-3" /> LIVE
        </span>
      </div>

      <div className="rounded-md border border-primary/20 bg-background/40 p-5">
        <div className="font-mono text-xs text-muted-foreground">PARA WALUTOWA</div>
        <div className="mt-1 flex items-center gap-3 font-display text-2xl font-bold sm:text-3xl">
          <span>{round.source}</span>
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          <span>{round.target}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 font-mono text-sm">
          <Stat label="KURS" value={`1 ${round.source} = ${round.rate} ${round.target}`} />
          <Stat label="KWOTA KLIENTA" value={`${round.amount} ${round.source}`} />
        </div>
      </div>

      <div className="mt-5">
        <p className="font-mono text-sm text-muted-foreground">
          &gt; Klient wymienia <strong className="text-foreground">{round.amount} {round.source}</strong>.
          Ile dostanie w <strong className="text-primary">{round.target}</strong>?
        </p>

        <div className="mt-3 flex items-center gap-2">
          <Input
            inputMode="decimal"
            placeholder="0.00"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="h-12 font-mono text-lg"
            autoFocus
          />
          <span className="font-display text-sm font-bold text-primary">{round.target}</span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: value ? 1 : 0 }}
          className="mt-2 font-mono text-[11px] text-muted-foreground"
        >
          &gt; podpowiedź: pomnóż kwotę × kurs i zaokrąglij do 2 miejsc.
        </motion.div>
      </div>

      <Button
        disabled={!value}
        onClick={handleSubmit}
        className="mt-5 h-12 w-full rounded-md bg-primary font-display text-sm font-black uppercase tracking-widest text-primary-foreground disabled:opacity-40"
      >
        EXEC ▸ Zatwierdź transakcję
      </Button>
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-sm border border-primary/15 bg-card/40 px-3 py-2">
    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="mt-0.5 text-primary">{value}</div>
  </div>
);
