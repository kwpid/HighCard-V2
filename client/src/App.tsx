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
import { useLeaderboardStore } from "./lib/stores/useLeaderboardStore";
import "@fontsource/inter";

function App() {
  const { currentScreen, initializeGame } = useGameStore();
  const { initializePlayer } = usePlayerStore();
  const { initializeLeaderboards } = useLeaderboardStore();

  useEffect(() => {
    // Initialize game and player data from localStorage
    initializeGame();
    initializePlayer();
    initializeLeaderboards();
  }, [initializeGame, initializePlayer, initializeLeaderboards]);

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
      <LeaderboardModal />
    </div>
  );
}

export default App;
