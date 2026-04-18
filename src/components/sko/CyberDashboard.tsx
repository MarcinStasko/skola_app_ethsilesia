import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { TrendingUp, Lock, Cpu, Zap } from "lucide-react";

/**
 * Cyber Banker dashboard — terminal / trading desk.
 * Animated tickers, "modules" (mini-games) presented as terminal cards,
 * and a faux market chart give the gaming vibe required by the brief.
 */
const MODULES = [
  { id: "g4-fractions",  grade: 4, code: "FRAC.SHARES",   title: "UDZIAŁY W SPÓŁCE",     desc: "Ułamki jako % udziałów",        reward: 25 },
  { id: "g5-fx",         grade: 5, code: "FX.KANTOR",     title: "WYMIANA WALUT",         desc: "Ułamki dziesiętne, kursy",      reward: 30 },
  { id: "g6-vault",      grade: 6, code: "VAULT.VOL",     title: "OBJĘTOŚĆ SEJFU",        desc: "Ile banknotów się zmieści?",    reward: 35 },
  { id: "g7-interest",   grade: 7, code: "VAULT.HACK",    title: "KALKULATOR ODSETEK",    desc: "Procent składany — zhackuj",    reward: 50, hot: true },
  { id: "g8-risk",       grade: 8, code: "RISK.MODEL",    title: "OCENA RYZYKA",          desc: "Prawdopodobieństwo defaultu",   reward: 60 },
];

export const CyberDashboard = ({ onStartLesson }: { onStartLesson: (id: string) => void }) => {
  const { username, grade, level, xp } = useGamificationStore();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-vault">
      <div className="container max-w-6xl py-8">
        {/* Greeting / status bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="font-display text-xs uppercase tracking-[0.3em] text-primary text-glow">
              &gt; HOLO-BROKER ONLINE
            </div>
            <h1 className="mt-1 font-body text-3xl font-bold sm:text-4xl">
              Witaj, <span className="text-primary text-glow">{username}</span>
              <span className="ml-2 text-muted-foreground">// klasa {grade}</span>
            </h1>
          </div>
          <Ticker tick={tick} />
        </motion.div>

        {/* Stats strip */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile icon={<Zap />}        label="LEVEL"     value={`${level}`} />
          <StatTile icon={<TrendingUp />} label="XP"        value={xp.toString()} />
          <StatTile icon={<Cpu />}        label="MODULES"   value={`${MODULES.length}`} />
          <StatTile icon={<Lock />}       label="VAULT.SEC" value="AES-256" small />
        </div>

        {/* Modules grid */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-sm uppercase tracking-[0.3em] text-muted-foreground">
            // dostępne moduły
          </h2>
          <span className="font-mono text-xs text-primary">{`> select_target.exe`}</span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => {
            const unlocked = true;
            return (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={unlocked ? { y: -4 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                disabled={!unlocked}
                onClick={() => {
                  if (!unlocked) return;
                  const route =
                    m.id === "g4-fractions" ? "g4-fractions"  :
                    m.id === "g5-fx"        ? "g5-fx-kantor"  :
                    m.id === "g6-vault"     ? "g6-vault-vol"  :
                    m.id === "g7-interest"  ? "g7-vault-hack" :
                    m.id === "g8-risk"      ? "g8-risk"       :
                    "demo-quiz";
                  onStartLesson(route);
                }}
                className={[
                  "group relative overflow-hidden rounded-md border bg-card p-5 text-left transition-all",
                  unlocked
                    ? "border-primary/30 hover:border-primary hover:shadow-bouncy"
                    : "border-border opacity-50",
                  m.hot && "ring-1 ring-destructive/60",
                ].join(" ")}
              >
                {m.hot && (
                  <span className="absolute right-3 top-3 animate-pulse-glow rounded-sm bg-destructive px-1.5 py-0.5 font-mono text-[10px] font-bold text-destructive-foreground">
                    HOT
                  </span>
                )}
                <div className="font-mono text-[11px] uppercase tracking-widest text-primary">
                  [{m.code}] · KL.{m.grade}
                </div>
                <h3 className="mt-2 font-display text-base leading-tight">{m.title}</h3>
                <p className="mt-2 font-mono text-xs text-muted-foreground">&gt; {m.desc}</p>

                <div className="mt-4 flex items-center justify-between font-mono text-xs">
                  <span className="text-coin">+{m.reward} SKO</span>
                  <span className="text-primary">
                    {unlocked ? "EXEC ▸" : "LOCKED ✕"}
                  </span>
                </div>

                {/* terminal scanline overlay */}
                <span className="scanlines pointer-events-none absolute inset-0" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StatTile = ({
  icon, label, value, small,
}: { icon: React.ReactNode; label: string; value: string; small?: boolean }) => (
  <div className="relative overflow-hidden rounded-md border border-primary/20 bg-card/60 p-3">
    <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
      <span className="text-primary [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>
      {label}
    </div>
    <div className={small ? "mt-1 font-mono text-sm text-primary" : "mt-1 font-display text-2xl text-primary text-glow"}>
      {value}
    </div>
  </div>
);

/** Faux market ticker — randomized, deterministic per tick. */
const Ticker = ({ tick }: { tick: number }) => {
  const symbols = ["PKO", "EUR", "USD", "BTC", "GLD"];
  const seed = (i: number) => Math.sin(tick * 0.7 + i * 1.3);
  return (
    <div className="flex flex-wrap gap-2 font-mono text-xs">
      {symbols.map((sym, i) => {
        const delta = seed(i) * 2.4;
        const up = delta >= 0;
        return (
          <div
            key={sym}
            className={[
              "rounded-sm border px-2 py-1",
              up ? "border-success/40 text-success" : "border-destructive/40 text-destructive",
            ].join(" ")}
          >
            {sym} {up ? "▲" : "▼"} {Math.abs(delta).toFixed(2)}%
          </div>
        );
      })}
    </div>
  );
};
