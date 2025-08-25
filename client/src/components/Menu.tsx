import { useState, useEffect } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { Play, Trophy, Package, HelpCircle, Settings, BarChart3, Users } from "lucide-react";

const Menu = () => {
  const { setCurrentScreen, setGameMode, setModalsOpen } = useGameStore();
  const { playerStats, currentSeason } = usePlayerStore();
  const [timeToNextSeason, setTimeToNextSeason] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const nextSeason = new Date('2025-09-01T00:00:00Z');
      
      if (now >= nextSeason) {
        // Calculate next month's first day
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = nextMonth === 0 ? currentYear + 1 : currentYear;
        nextSeason.setFullYear(nextYear, nextMonth, 1);
      }

      const timeDiff = nextSeason.getTime() - now.getTime();
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeToNextSeason(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleGameMode = (mode: 'casual' | 'ranked', gameType: '1v1' | '2v2') => {
    setGameMode(mode, gameType);
    setCurrentScreen('queue');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-4">
          HighCard
        </h1>
        <div className="text-lg text-gray-400">
          Season {currentSeason} • Next season in: <span className="text-emerald-400 font-semibold">{timeToNextSeason}</span>
        </div>
      </div>

      {/* Main Menu Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-2xl">
        {/* Casual Button */}
        <div className="space-y-2">
          <button
            onClick={() => handleGameMode('casual', '1v1')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 
                     text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 
                     hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Play size={24} />
            Casual 1v1
          </button>
          <button
            onClick={() => handleGameMode('casual', '2v2')}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 
                     text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 
                     hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 text-sm"
          >
            <Users size={20} />
            Casual 2v2
          </button>
        </div>

        {/* Ranked Button */}
        <div className="space-y-2">
          <button
            onClick={() => handleGameMode('ranked', '1v1')}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 
                     text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 
                     hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 neon-glow"
          >
            <Trophy size={24} />
            Ranked 1v1
          </button>
          <button
            onClick={() => handleGameMode('ranked', '2v2')}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 
                     text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 
                     hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 text-sm neon-glow"
          >
            <Users size={20} />
            Ranked 2v2
          </button>
        </div>
      </div>

      {/* Secondary Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-2xl">
        <button
          onClick={() => setModalsOpen('inventory', true)}
          disabled
          className="w-full bg-gray-700 text-gray-400 font-semibold py-3 px-6 rounded-lg 
                   cursor-not-allowed flex items-center justify-center gap-3"
        >
          <Package size={20} />
          Inventory (Coming Soon)
        </button>

        <button
          onClick={() => setModalsOpen('tutorial', true)}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 
                   text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 
                   hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3"
        >
          <HelpCircle size={20} />
          Tutorial
        </button>
      </div>

      {/* Smaller Buttons */}
      <div className="flex flex-wrap justify-center gap-4 w-full max-w-2xl">
        <button
          onClick={() => setModalsOpen('settings', true)}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg 
                   transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <Settings size={18} />
          Settings
        </button>

        <button
          onClick={() => setModalsOpen('leaderboards', true)}
          disabled
          className="bg-gray-700 text-gray-400 font-medium py-2 px-4 rounded-lg 
                   cursor-not-allowed flex items-center gap-2"
        >
          <Trophy size={18} />
          Leaderboards (Coming Soon)
        </button>

        <button
          onClick={() => setModalsOpen('stats', true)}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg 
                   transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <BarChart3 size={18} />
          Stats
        </button>
      </div>

      {/* Current Rank Display */}
      {playerStats.rankedStats['1v1'].currentRank && (
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-400 mb-1">Current 1v1 Rank</div>
          <div className={`text-xl font-bold rank-${playerStats.rankedStats['1v1'].currentRank.toLowerCase()}`}>
            {playerStats.rankedStats['1v1'].currentRank} {playerStats.rankedStats['1v1'].division && 
            playerStats.rankedStats['1v1'].division !== 'I' ? playerStats.rankedStats['1v1'].division : ''}
          </div>
          <div className="text-sm text-gray-400">
            {playerStats.rankedStats['1v1'].mmr} MMR
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
