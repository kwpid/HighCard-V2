import { useEffect } from "react";
import { useGameStore } from "./lib/stores/useGameStore";
import { usePlayerStore } from "./lib/stores/usePlayerStore";
import Menu from "./components/Menu";
import ModeSelectScreen from "./components/ModeSelectScreen";
import GameBoard from "./components/GameBoard";
import QueueScreen from "./components/QueueScreen";
import StatsModal from "./components/StatsModal";
import SettingsModal from "./components/SettingsModal";
import TutorialModal from "./components/TutorialModal";
import LeaderboardModal from "./components/LeaderboardModal";
import InventoryModal from "./components/InventoryModal";
import RewardModal from "./components/RewardModal";
import { useLeaderboardStore } from "./lib/stores/useLeaderboardStore";
import "@fontsource/inter";

function App() {
  const { currentScreen, initializeGame, setCurrentScreen } = useGameStore();
  const { initializePlayer, updateStats } = usePlayerStore() as any;
  const { initializeLeaderboards } = useLeaderboardStore();

  useEffect(() => {
    // Initialize game and player data from localStorage
    initializeGame();
    initializePlayer();
    initializeLeaderboards();

    // Auto-forfeit if a ranked game was in progress (refresh detection)
    try {
      const inProgressRaw = localStorage.getItem('highcard-game-in-progress');
      if (inProgressRaw) {
        const inProgress = JSON.parse(inProgressRaw) as { mode: 'casual' | 'ranked'; type: '1v1' | '2v2'; opponentMMR: number };
        if (inProgress.mode === 'ranked') {
          updateStats('ranked', inProgress.type, false, inProgress.opponentMMR || undefined);
        }
        localStorage.removeItem('highcard-game-in-progress');
        setCurrentScreen('menu');
      }
    } catch {
      // ignore parse errors
    }
  }, [initializeGame, initializePlayer, initializeLeaderboards, updateStats, setCurrentScreen]);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-inter">
      {currentScreen === 'menu' && <Menu />}
      {currentScreen === 'mode-select' && <ModeSelectScreen />}
      {currentScreen === 'queue' && <QueueScreen />}
      {currentScreen === 'game' && <GameBoard />}
      
      {/* Modals */}
      <StatsModal />
      <SettingsModal />
      <TutorialModal />
      {/* Leaderboards temporarily disabled */}
      {/* <LeaderboardModal /> */}
      <InventoryModal />
      <RewardModal />
    </div>
  );
}

export default App;
