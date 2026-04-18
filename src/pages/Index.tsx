import { useState } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { ThemeModeProvider } from "@/providers/ThemeModeProvider";
import { Onboarding } from "@/components/sko/Onboarding";
import { Dashboard } from "@/components/sko/Dashboard";
import { RewardsShop } from "@/components/sko/RewardsShop";
import { DemoQuizLesson } from "@/components/sko/lessons/DemoQuizLesson";
import { PiggyBankLesson } from "@/components/sko/lessons/PiggyBankLesson";
import { PocketMoneyLesson } from "@/components/sko/lessons/PocketMoneyLesson";
import { CoinExchangeLesson } from "@/components/sko/lessons/CoinExchangeLesson";
import { GoldBarsLesson } from "@/components/sko/lessons/GoldBarsLesson";
import { TripBudgetLesson } from "@/components/sko/lessons/TripBudgetLesson";
import { ChangeATMLesson } from "@/components/sko/lessons/ChangeATMLesson";
import { FractionSharesLesson } from "@/components/sko/lessons/FractionSharesLesson";
import { FxKantorLesson } from "@/components/sko/lessons/FxKantorLesson";
import { VaultVolLesson } from "@/components/sko/lessons/VaultVolLesson";
import { VaultHackLesson } from "@/components/sko/lessons/VaultHackLesson";
import { RiskModelLesson } from "@/components/sko/lessons/RiskModelLesson";

/**
 * Centralny router lekcji. Każde id ↔ jeden komponent dopasowany pedagogicznie.
 * Dzięki temu mapa na dashboardzie i materiał są zawsze spójne.
 */
const LESSONS: Record<string, React.ComponentType<{ onExit: () => void }>> = {
  // Junior
  "g1-piggy-bank":    PiggyBankLesson,
  "g1-pocket-money":  PocketMoneyLesson,
  "g2-coin-exchange": CoinExchangeLesson,
  "g2-gold-bars":     GoldBarsLesson,
  "g3-trip-budget":   TripBudgetLesson,
  "g3-change-atm":    ChangeATMLesson,
  // Cyber
  "g4-fractions":     FractionSharesLesson,
  "g5-fx-kantor":     FxKantorLesson,
  "g6-vault-vol":     VaultVolLesson,
  "g7-vault-hack":    VaultHackLesson,
  "g8-risk":          RiskModelLesson,
  // Fallback / dev
  "demo-quiz":        DemoQuizLesson,
};

const Index = () => {
  const onboarded = useGamificationStore((s) => s.onboarded);
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [shopOpen, setShopOpen] = useState(false);

  const exit = () => setActiveLesson(null);

  if (!onboarded) {
    return (
      <ThemeModeProvider>
        <Onboarding />
      </ThemeModeProvider>
    );
  }

  const LessonComponent = activeLesson ? LESSONS[activeLesson] : null;

  return (
    <ThemeModeProvider>
      {shopOpen ? (
        <RewardsShop onExit={() => setShopOpen(false)} />
      ) : LessonComponent ? (
        <LessonComponent onExit={exit} />
      ) : (
        <Dashboard
          onStartLesson={setActiveLesson}
          onOpenShop={() => setShopOpen(true)}
        />
      )}
    </ThemeModeProvider>
  );
};

export default Index;
