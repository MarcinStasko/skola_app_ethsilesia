import { motion } from "framer-motion";
import { ArrowLeft, Lock, Sparkles, Truck } from "lucide-react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { SkoCoin } from "./SkoCoin";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import lokatka from "@/assets/lokatka-giraffe.png";

/**
 * Rewards Shop — DEMO ONLY.
 *
 * Wymiana monet SKO na fizyczne nagrody PKO (np. maskotka Żyrafka Lokatka).
 * Świadomie nie implementujemy realnego flow zamówienia — to placeholder UX
 * pokazujący docelowe doświadczenie. "Wymień" tylko triggeruje fake confirm.
 */

interface Reward {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image?: string;
  emoji?: string;
  badge?: string;
}

const REWARDS: Reward[] = [
  {
    id: "lokatka-plush",
    name: "Maskotka Żyrafka Lokatka",
    tagline: "Oryginalna pluszowa maskotka PKO BP — 32 cm",
    price: 200,
    image: lokatka,
    badge: "BESTSELLER",
  },
  { id: "piggy-bank",   name: "Skarbonka SKO",        tagline: "Ceramiczna świnka z logo PKO",      price: 350, emoji: "🐷" },
  { id: "notebook",     name: "Notes Lokatki",        tagline: "A5, 96 stron, twarda oprawa",       price: 120, emoji: "📓" },
  { id: "backpack",     name: "Plecak SKO·LA",        tagline: "Z odblaskami i kieszenią na laptop", price: 800, emoji: "🎒" },
  { id: "headphones",   name: "Słuchawki Cyber",      tagline: "Bezprzewodowe, edycja Cyber Banker", price: 1500, emoji: "🎧" },
  { id: "gift-card",    name: "Bon do księgarni",     tagline: "50 zł na książki w Empiku",         price: 600, emoji: "🎁" },
];

export const RewardsShop = ({ onExit }: { onExit: () => void }) => {
  const coins = useGamificationStore((s) => s.coins);
  const [picked, setPicked] = useState<Reward | null>(null);

  return (
    <div className="min-h-screen bg-gradient-sky">
      <div className="container max-w-5xl py-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            onClick={onExit}
            className="gap-2 font-display font-bold"
          >
            <ArrowLeft className="h-4 w-4" /> Wróć
          </Button>
          <div className="flex items-center gap-2 rounded-full bg-coin/15 px-4 py-2 ring-1 ring-coin/40">
            <SkoCoin size={24} />
            <span className="font-display text-lg font-black tabular-nums">
              {coins.toLocaleString("pl-PL")}
            </span>
            <span className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground">
              SKO
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-primary">
            <Sparkles className="h-3 w-3" /> Sklep nagród PKO BP
          </div>
          <h1 className="font-display text-3xl font-black text-primary sm:text-4xl">
            Wymień monety na nagrody
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Każda wpłata buduje Twój kapitał. Tu wymieniasz go na coś prawdziwego.
          </p>
        </motion.div>

        {/* Featured */}
        <FeaturedCard
          reward={REWARDS[0]}
          coins={coins}
          onPick={() => setPicked(REWARDS[0])}
        />

        {/* Grid pozostałych nagród */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REWARDS.slice(1).map((r, i) => (
            <RewardCard
              key={r.id}
              reward={r}
              coins={coins}
              index={i}
              onPick={() => setPicked(r)}
            />
          ))}
        </div>

        {/* CTA powrotu — żeby dziecko nie utknęło w sklepie i wiedziało,
            że trzeba zarobić więcej monet w lekcjach. */}
        <div className="mt-10 rounded-3xl bg-card p-6 text-center shadow-soft sm:p-8">
          <div className="text-4xl">💪</div>
          <h3 className="mt-2 font-display text-xl font-black text-foreground">
            Brakuje monet na nagrodę?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Wróć do ćwiczeń i zarobij więcej SKO w lekcjach.
          </p>
          <Button
            onClick={onExit}
            className="mt-4 h-14 rounded-2xl bg-gradient-primary px-8 font-display text-base font-black shadow-bouncy"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Wróć do ćwiczeń
          </Button>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          DEMO · realna wymiana nagród niedostępna w prototypie
        </p>
      </div>

      {picked && (
        <ExchangeModal
          reward={picked}
          coins={coins}
          onClose={() => setPicked(null)}
        />
      )}
    </div>
  );
};

const FeaturedCard = ({
  reward, coins, onPick,
}: { reward: Reward; coins: number; onPick: () => void }) => {
  const affordable = coins >= reward.price;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 22 }}
      className="relative overflow-hidden rounded-3xl bg-card p-6 shadow-bouncy sm:p-8"
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-coin/20 blur-3xl" />
      <div className="relative grid gap-6 sm:grid-cols-[1fr_1.2fr] sm:items-center">
        <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100">
          {reward.image && (
            <motion.img
              src={reward.image}
              alt={reward.name}
              className="h-full w-full object-contain p-4"
              animate={{ y: [0, -8, 0], rotate: [-1, 2, -1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          {reward.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-destructive px-2.5 py-1 font-display text-[10px] font-black uppercase tracking-widest text-destructive-foreground">
              {reward.badge}
            </span>
          )}
        </div>

        <div>
          <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">
            {reward.name}
          </h2>
          <p className="mt-1 text-muted-foreground">{reward.tagline}</p>

          <ul className="mt-4 space-y-1.5 font-mono text-xs text-muted-foreground">
            <li className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-primary" />
              Wysyłka kurierem 3–5 dni roboczych
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Oryginalny gadżet PKO Bank Polski
            </li>
          </ul>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-coin/15 px-4 py-2 ring-1 ring-coin/40">
              <SkoCoin size={22} />
              <span className="font-display text-xl font-black tabular-nums">
                {reward.price}
              </span>
            </div>
            <Button
              disabled={!affordable}
              onClick={onPick}
              className="h-12 flex-1 rounded-2xl bg-gradient-primary font-display text-base font-black shadow-bouncy disabled:opacity-50 sm:flex-none sm:px-8"
            >
              {affordable ? "Wymień nagrodę" : (
                <span className="flex items-center gap-1.5">
                  <Lock className="h-4 w-4" />
                  Brakuje {reward.price - coins} SKO
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RewardCard = ({
  reward, coins, index, onPick,
}: { reward: Reward; coins: number; index: number; onPick: () => void }) => {
  const affordable = coins >= reward.price;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={[
        "flex flex-col rounded-2xl bg-card p-5 shadow-soft transition-all",
        affordable ? "hover:-translate-y-1 hover:shadow-bouncy" : "opacity-75",
      ].join(" ")}
    >
      <div className="flex h-32 items-center justify-center rounded-xl bg-gradient-sky text-6xl">
        {reward.emoji}
      </div>
      <h3 className="mt-4 font-display text-lg font-black">{reward.name}</h3>
      <p className="text-xs text-muted-foreground">{reward.tagline}</p>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-display font-black text-coin-foreground">
          <SkoCoin size={18} />
          <span className="tabular-nums">{reward.price}</span>
        </div>
        <Button
          size="sm"
          variant={affordable ? "default" : "outline"}
          disabled={!affordable}
          onClick={onPick}
          className="rounded-full font-display text-xs font-black"
        >
          {affordable ? "Wymień" : <Lock className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </motion.div>
  );
};

const ExchangeModal = ({
  reward, coins, onClose,
}: { reward: Reward; coins: number; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm"
  >
    <motion.div
      onClick={(e) => e.stopPropagation()}
      initial={{ scale: 0.85, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="w-full max-w-md rounded-3xl bg-card p-6 text-center shadow-bouncy sm:p-8"
    >
      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>
      <h3 className="font-display text-xl font-black text-foreground">
        Wymiana — wersja DEMO
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        W prawdziwej aplikacji zostałby teraz uruchomiony proces zamówienia
        nagrody <strong className="text-foreground">{reward.name}</strong> za{" "}
        <strong className="text-coin-foreground">{reward.price} SKO</strong>.
      </p>
      <div className="mt-4 rounded-xl bg-secondary/40 p-3 text-left font-mono text-xs text-muted-foreground">
        <div>POST /api/rewards/exchange</div>
        <div className="text-foreground">  {`{ rewardId: "${reward.id}", price: ${reward.price} }`}</div>
        <div className="mt-1 text-success">→ 200 OK · order_id: SKO-DEMO-{Math.floor(Math.random() * 9999)}</div>
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Saldo po wymianie: {coins - reward.price} SKO
      </p>
      <Button
        onClick={onClose}
        className="mt-5 h-12 w-full rounded-2xl bg-gradient-primary font-display text-base font-black shadow-bouncy"
      >
        Rozumiem
      </Button>
    </motion.div>
  </motion.div>
);
