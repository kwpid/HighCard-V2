import { useState, useEffect } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { Play, Trophy, Package, HelpCircle, Settings, BarChart3, Star, Users, Lock } from "lucide-react";
import { getRankFromMMR } from "../lib/gameLogic";
import XPProgress from "./XPProgress";

const Menu = () => {
  const { setCurrentScreen, setSelectedMode, setModalsOpen } = useGameStore();
  const { playerStats, currentSeason, getXPProgress } = usePlayerStore();
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

  const handleModeSelect = (mode: 'casual' | 'ranked') => {
    if (mode === 'ranked' && playerStats.level < 5) {
      alert('Reach Level 5 to unlock Ranked. Keep playing Casual to level up!');
      return;
    }
    setSelectedMode(mode);
    setCurrentScreen('mode-select');
  };

  const getHighestRank = () => {
    const rank1v1 = playerStats.rankedStats['1v1'];
    const rank2v2 = playerStats.rankedStats['2v2'];
    
    if (rank1v1.mmr >= rank2v2.mmr) {
      return { rank: rank1v1.currentRank, division: rank1v1.division, mmr: rank1v1.mmr };
    } else {
      return { rank: rank2v2.currentRank, division: rank2v2.division, mmr: rank2v2.mmr };
    }
  };

  const getRankColor = (rank: string | null) => {
    if (!rank) return 'text-gray-400';
    return `rank-${rank.toLowerCase().replace(' ', '-')}`;
  };

  const highestRank = getHighestRank();
  const maxPeakMMR = Math.max(
    playerStats.rankedStats['1v1'].peakMMR || 0,
    playerStats.rankedStats['2v2'].peakMMR || 0
  );
  const peakOverall = getRankFromMMR(maxPeakMMR);

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

      {/* XP Progress */}
      <div className="w-full max-w-2xl mb-6">
        <XPProgress xpProgress={getXPProgress()} showDetails={true} />
      </div>

      {/* Season Rewards Progress */}
      <div className="w-full max-w-2xl mb-8 bg-gray-800 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Star size={24} className="text-yellow-400" />
          <h3 className="text-lg font-semibold text-white">Season Rewards Progress</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-400 mb-2">
              Total Season Wins: {playerStats.totalSeasonWins}
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((playerStats.totalSeasonWins % 10) * 10, 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {playerStats.totalSeasonWins % 10 === 0 ? 10 : 10 - (playerStats.totalSeasonWins % 10)} wins until next reward
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-1">Highest Rank</div>
            <div className={`text-lg font-bold ${getRankColor(highestRank.rank)}`}>
              {highestRank.rank || 'Unranked'} {highestRank.division || ''}
            </div>
            <div className="text-sm text-gray-400">
              {highestRank.mmr} MMR
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Peak: {maxPeakMMR} MMR · {peakOverall.rank}
            </div>
          </div>
        </div>
      </div>

      {/* Main Menu Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 w-full max-w-2xl">
        {/* Casual Button */}
        <button
          onClick={() => handleModeSelect('casual')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 
                   text-white font-semibold py-6 px-8 rounded-lg transition-all duration-300 
                   hover:scale-105 hover:shadow-xl"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <Play size={32} />
            <span className="text-2xl">Casual</span>
          </div>
          <div className="text-sm opacity-80">
            Practice and have fun
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="bg-black bg-opacity-30 rounded p-2">
              <div>1v1: {playerStats.casualStats['1v1'].wins}W/{playerStats.casualStats['1v1'].losses}L</div>
            </div>
            <div className="bg-black bg-opacity-30 rounded p-2">
              <div>2v2: {playerStats.casualStats['2v2'].wins}W/{playerStats.casualStats['2v2'].losses}L</div>
            </div>
          </div>
        </button>

        {/* Ranked Button */}
        <button
          onClick={() => handleModeSelect('ranked')}
          disabled={playerStats.level < 5}
          className={`relative bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold py-6 px-8 rounded-lg transition-all duration-300 
                   ${playerStats.level < 5 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:from-emerald-500 hover:to-emerald-600 hover:scale-105 hover:shadow-xl neon-glow'}`}
        >
          {playerStats.level < 5 && (
            <div className="absolute -top-3 -right-3 bg-gray-800 border border-gray-600 text-gray-200 text-xs px-2 py-1 rounded flex items-center gap-1 shadow">
              <Lock size={14} /> Reach Lv 5
            </div>
          )}
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy size={32} />
            <span className="text-2xl">Ranked</span>
          </div>
          <div className="text-sm opacity-80">
            Competitive play with rankings
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="bg-black bg-opacity-30 rounded p-2">
              <div className={`${getRankColor(playerStats.rankedStats['1v1'].currentRank)}`}>
                1v1: {playerStats.rankedStats['1v1'].currentRank || 'Unranked'}
              </div>
              <div>{playerStats.rankedStats['1v1'].mmr} MMR</div>
            </div>
            <div className="bg-black bg-opacity-30 rounded p-2">
              <div className={`${getRankColor(playerStats.rankedStats['2v2'].currentRank)}`}>
                2v2: {playerStats.rankedStats['2v2'].currentRank || 'Unranked'}
              </div>
              <div>{playerStats.rankedStats['2v2'].mmr} MMR</div>
            </div>
          </div>
        </button>
      </div>

      {/* Secondary Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 w-full max-w-2xl">
        <button
          onClick={() => setModalsOpen('inventory', true)}
          className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg 
                   transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
        >
          <Package size={20} />
          Inventory
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

    </div>
  );
};

export default Menu;
