import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Settings2, GraduationCap, Check, RotateCcw } from "lucide-react";
import { useGamificationStore, type Grade } from "@/store/useGamificationStore";
import { SkoCoin } from "./SkoCoin";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import skoLaLogo from "@/assets/sko-la-logo.png";

/**
 * Persistent header. Two visual moods via mode-conditional classes,
 * but information density stays identical so kids learn one layout.
 *
 * Includes a class switcher: child can jump between grades 1–8 without
 * resetting progress (coins/streak/badges persist via the store).
 */
export const TopBar = ({
  onOpenSettings,
  onOpenShop,
}: {
  onOpenSettings?: () => void;
  onOpenShop?: () => void;
}) => {
  const { coins, streak, level, username, mode } = useGamificationStore();

  return (
    <header
      className={
        mode === "cyber"
          ? "sticky top-0 z-40 border-b border-primary/30 bg-background/80 backdrop-blur-xl"
          : "sticky top-0 z-40 border-b-4 border-primary/20 bg-card/90 backdrop-blur-xl"
      }
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <img
            src={skoLaLogo}
            alt="SKO-LA — PKO Bank Polski"
            className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-soft"
          />
          <div className="leading-tight">
            <div className="font-display text-lg font-black tracking-tight">
              SKO<span className="text-destructive">·</span>LA
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
              PKO BP · {mode === "cyber" ? "Cyber Banker" : "Junior Saver"}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Stat
            icon={<Flame className="h-4 w-4 text-destructive" />}
            value={streak}
            label="dni"
            mode={mode}
          />
          <Stat
            icon={<Trophy className="h-4 w-4 text-primary" />}
            value={`Lv ${level}`}
            label={username ?? "gracz"}
            mode={mode}
          />
          <CoinPill coins={coins} onClick={onOpenShop} />

          <GradeSwitcher />
          <ResetButton />

          {onOpenSettings && (
            <Button size="icon" variant="ghost" onClick={onOpenSettings} aria-label="Ustawienia">
              <Settings2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

const GRADES: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Compact popover with a 4×2 grid of grade chips. Junior (1–3) and Cyber
 * (4–8) get distinct visual cues so the child sees what world they jump to.
 */
const GradeSwitcher = () => {
  const grade = useGamificationStore((s) => s.grade);
  const setGrade = useGamificationStore((s) => s.setGrade);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-full font-display text-xs font-black"
          aria-label="Zmień klasę"
        >
          <GraduationCap className="h-4 w-4" />
          <span>Klasa {grade ?? "?"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3">
        <div className="mb-2 font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Wybierz klasę
        </div>
        <div className="grid grid-cols-4 gap-2">
          {GRADES.map((g) => {
            const active = grade === g;
            const isJunior = g <= 3;
            return (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={[
                  "relative flex h-12 items-center justify-center rounded-xl border-2 font-display text-lg font-black transition-all",
                  active
                    ? "border-primary bg-primary text-primary-foreground scale-95"
                    : isJunior
                    ? "border-border bg-secondary/40 hover:bg-secondary"
                    : "border-primary/20 bg-card hover:border-primary/40",
                ].join(" ")}
                aria-label={`Klasa ${g}`}
              >
                {g}
                {active && (
                  <Check className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-success p-0.5 text-success-foreground" />
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-wider">
          <div className="rounded-md bg-secondary/40 px-2 py-1 text-center text-muted-foreground">
            1–3 · Junior 🐷
          </div>
          <div className="rounded-md bg-primary/10 px-2 py-1 text-center text-primary">
            4–8 · Cyber 💻
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/**
 * Reset całej aplikacji — wraca do onboardingu (wybór imienia + klasy),
 * czyści monety, streak, badge'y i ukończone lekcje. Z confirm dialogiem
 * żeby dziecko nie wyzerowało progresu jednym przypadkowym tapnięciem.
 */
const ResetButton = () => {
  const reset = useGamificationStore((s) => s.reset);
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Zacznij od nowa"
          title="Zacznij od nowa"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Zacząć aplikację od nowa?</AlertDialogTitle>
          <AlertDialogDescription>
            Wyzerujemy <strong>wszystkie monety SKO</strong>, postęp lekcji,
            streak i odznaki. Wrócisz do ekranu wyboru imienia i klasy.
            Tej operacji nie da się cofnąć.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={reset}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Tak, zacznij od nowa
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const Stat = ({
  icon, value, label, mode,
}: { icon: React.ReactNode; value: React.ReactNode; label: string; mode: "junior" | "cyber" }) => (
  <div
    className={
      mode === "cyber"
        ? "hidden sm:flex items-center gap-2 rounded-md border border-primary/30 bg-card px-3 py-1.5"
        : "hidden sm:flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 shadow-soft"
    }
  >
    {icon}
    <div className="leading-tight">
      <div className="font-display text-sm font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  </div>
);

const CoinPill = ({ coins, onClick }: { coins: number; onClick?: () => void }) => {
  const inner = (
    <>
      <SkoCoin size={22} />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={coins}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          className="font-display text-base font-black tabular-nums"
        >
          {coins.toLocaleString("pl-PL")}
        </motion.span>
      </AnimatePresence>
    </>
  );
  if (!onClick) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-coin/15 px-3 py-1.5 ring-1 ring-coin/40">
        {inner}
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      aria-label="Otwórz sklep nagród"
      title="Wymień monety na nagrody"
      className="flex items-center gap-2 rounded-full bg-coin/15 px-3 py-1.5 ring-1 ring-coin/40 transition-all hover:scale-105 hover:bg-coin/25 hover:ring-coin/60 active:scale-95"
    >
      {inner}
    </button>
  );
};
