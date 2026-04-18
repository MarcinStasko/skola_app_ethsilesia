import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExerciseContainer, type ExerciseStepProps } from "../ExerciseContainer";
import { Button } from "@/components/ui/button";

/**
 * "Rozmieniarka" — Klasa 2. Mnożenie jako powtarzane dodawanie.
 * Wartości losowane: count 2–6, nominały ze zbioru {1,2,5}; ostatnie 2 rundy
 * to dwie paczki (a·k + b·m) — typowe zadanie z dwóch kroków mnożenia + suma.
 * Twardy limit: total ≤ 50 zł (klasa 2).
 */

type Coin = 1 | 2 | 5;
interface Bundle { count: number; coin: Coin }
interface Round { bundles: Bundle[]; prompt: string; }

const COINS: Coin[] = [1, 2, 5];
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]) => arr[rand(0, arr.length - 1)];

const singleBundle = (): Bundle => {
  // Dla pojedynczej paczki preferujemy nominał ≥ 2 (1×n to za prosto).
  const coin = pick([2, 2, 5] as const);
  const count = rand(3, coin === 5 ? 5 : 6);
  return { count, coin };
};

const twoBundles = (): Bundle[] => {
  // Dwie różne monety, sumy do ~25 zł.
  const c1 = pick([2, 5] as const);
  const c2 = pick(COINS.filter((x) => x !== c1));
  return [
    { count: rand(2, 4), coin: c1 },
    { count: rand(2, 5), coin: c2 as Coin },
  ];
};

const buildRounds = (): Round[] => {
  const r: Round[] = [];
  for (let i = 0; i < 3; i++) {
    const b = singleBundle();
    r.push({ bundles: [b], prompt: `${b.count} monety po ${b.coin} zł — ile razem?` });
  }
  for (let i = 0; i < 2; i++) {
    const bs = twoBundles();
    r.push({
      bundles: bs,
      prompt: `${bs[0].count} × ${bs[0].coin} zł + ${bs[1].count} × ${bs[1].coin} zł — ile razem?`,
    });
  }
  return r;
};

const COIN_COLOR: Record<Coin, string> = {
  1: "from-zinc-200 to-zinc-300 text-zinc-700 ring-zinc-400/60",
  2: "from-amber-300 to-amber-400 text-amber-900 ring-zinc-400/70",
  5: "from-zinc-100 to-zinc-200 text-zinc-700 ring-amber-400/80",
};

export const CoinExchangeLesson = ({ onExit }: { onExit: () => void }) => {
  const rounds = useMemo(() => buildRounds(), []);
  return (
    <ExerciseContainer
      lessonId="g2-coin-exchange"
      title="Rozmieniarka 💱"
      subtitle="Klasa 2 · Mnożenie monet (powtarzane dodawanie)"
      baseReward={20}
      steps={rounds.length}
      onExit={onExit}
      renderStep={(i, props) => <ExchangeStep key={i} round={rounds[i]} {...props} />}
    />
  );
};

const ExchangeStep = ({ round, submit }: { round: Round } & ExerciseStepProps) => {
  const [picked, setPicked] = useState<number | null>(null);
  const total = useMemo(
    () => round.bundles.reduce((s, b) => s + b.count * b.coin, 0),
    [round]
  );

  const options = useMemo(() => {
    const set = new Set<number>([total]);
    set.add(round.bundles.reduce((s, b) => s + b.count + b.coin, 0));
    set.add(Math.max(1, total - round.bundles[0].coin));
    set.add(total + round.bundles[0].coin);
    return Array.from(set).slice(0, 4).sort((a, b) => a - b);
  }, [total, round]);

  return (
    <div className="rounded-3xl bg-card p-6 shadow-bouncy sm:p-8">
      <div className="mb-2 text-center font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Policz razem 🧮
      </div>
      <h2 className="text-center font-display text-2xl font-black text-primary sm:text-3xl">
        {round.prompt}
      </h2>

      <div className="mt-6 space-y-4">
        {round.bundles.map((b, bi) => (
          <div key={bi} className="rounded-2xl bg-gradient-sky p-4">
            <div className="mb-2 text-center font-display text-sm font-bold text-primary">
              {b.count} × {b.coin} zł
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from({ length: b.count }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.4, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.05 + bi * 0.15, type: "spring", stiffness: 320 }}
                  className={[
                    "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ring-2 font-display font-black shadow-coin sm:h-14 sm:w-14",
                    COIN_COLOR[b.coin],
                  ].join(" ")}
                  aria-label={`Moneta ${b.coin} złotych`}
                >
                  <div className="text-center leading-none">
                    <div className="text-base sm:text-lg">{b.coin}</div>
                    <div className="text-[7px] font-bold uppercase opacity-70">zł</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const sel = picked === opt;
          return (
            <button
              key={opt}
              onClick={() => setPicked(opt)}
              className={[
                "h-14 rounded-2xl border-2 font-display text-xl font-black transition-all",
                sel
                  ? "border-primary bg-primary text-primary-foreground scale-95"
                  : "border-border bg-secondary/40 hover:bg-secondary",
              ].join(" ")}
            >
              {opt} zł
            </button>
          );
        })}
      </div>

      <Button
        disabled={picked === null}
        onClick={() => submit(
          picked === total,
          picked === total
            ? undefined
            : `Poprawnie: ${round.bundles.map((b) => `${b.count}×${b.coin}`).join(" + ")} = ${total} zł.`
        )}
        className="mt-6 h-14 w-full rounded-2xl bg-gradient-primary text-lg font-display font-black shadow-bouncy disabled:opacity-40"
      >
        Sprawdź
      </Button>
    </div>
  );
};
