import { useEffect } from "react";
import { useGamificationStore } from "@/store/useGamificationStore";
import { TopBar } from "./TopBar";
import { JuniorDashboard } from "./JuniorDashboard";
import { CyberDashboard } from "./CyberDashboard";

/**
 * Top-level shell. Renders the right paradigm based on store mode and
 * registers a "daily activity" ping so the streak counter stays honest.
 */
export const Dashboard = ({
  onStartLesson,
  onOpenShop,
}: {
  onStartLesson: (id: string) => void;
  onOpenShop?: () => void;
}) => {
  const mode = useGamificationStore((s) => s.mode);
  const registerActivity = useGamificationStore((s) => s.registerActivity);

  useEffect(() => {
    registerActivity();
  }, [registerActivity]);

  return (
    <div className="min-h-screen">
      <TopBar onOpenShop={onOpenShop} />
      {mode === "junior"
        ? <JuniorDashboard onStartLesson={onStartLesson} />
        : <CyberDashboard onStartLesson={onStartLesson} />}
    </div>
  );
};
