import { useState, useEffect } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useTournamentStore } from "../lib/stores/useTournamentStore";
import { Play, Trophy, Package, HelpCircle, Settings, BarChart3, Star, Users, Lock, Newspaper } from "lucide-react";
import { getRankFromMMR } from "../lib/gameLogic";
import XPProgress from "./XPProgress";
import { getFeaturedNews } from "../lib/news";

const Menu = () => {
  const { setCurrentScreen, setSelectedMode, setModalsOpen } = useGameStore();
  const { playerStats, currentSeason, getXPProgress, username } = usePlayerStore();
  const { getNextTournaments, getCurrentTournament } = useTournamentStore();
  const [timeToNextSeason, setTimeToNextSeason] = useState("");
  const [currentTime, setCurrentTime] = useState(Date.now());
  const featuredNews = getFeaturedNews();

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
      setCurrentTime(Date.now());
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000); // Update every second for tournament timer

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

  const getTournamentStatus = () => {
    const currentTournament = getCurrentTournament();
    const nextTournaments = getNextTournaments();
    
    if (currentTournament) {
      return { status: 'open', text: 'OPEN NOW!', timer: null };
    }
    
    if (nextTournaments.length > 0) {
      const nextTournament = nextTournaments[0];
      const timeUntil = nextTournament.startTime - currentTime;
      
      if (timeUntil <= 0) {
        return { status: 'open', text: 'OPEN NOW!', timer: null };
      }
      
      const minutes = Math.floor(timeUntil / 60000);
      const seconds = Math.floor((timeUntil % 60000) / 1000);
      
      if (minutes > 0) {
        return { status: 'waiting', text: 'Tournaments', timer: `${minutes}m ${seconds}s` };
      } else {
        return { status: 'waiting', text: 'Tournaments', timer: `${seconds}s` };
      }
    }
    
    return { status: 'waiting', text: 'Tournaments', timer: 'Loading...' };
  };

  const getRankColor = (rank: string | null) => {
    if (!rank) return 'text-gray-400';
    return `rank-${rank.toLowerCase().replace(' ', '-')}`;
  };

  const getTitleDisplay = (titleId?: string | null) => {
    if (!titleId) return null;
    const { playerStats } = usePlayerStore.getState();
    const title = playerStats.ownedTitles?.find(t => t.id === titleId);
    if (!title) return null;
    
    return (
      <span className={`text-xs ${title.rankColor || 'text-gray-200'} ${title.glow ? 'animate-pulse' : ''}`}>
        {title.name}
      </span>
    );
  };

  const highestRank = getHighestRank();
  const maxPeakMMR = Math.max(
    playerStats.rankedStats['1v1'].peakMMR || 0,
    playerStats.rankedStats['2v2'].peakMMR || 0
  );
  const peakOverall = getRankFromMMR(maxPeakMMR);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
      {/* Player Card - Top Left */}
      <div className="absolute top-6 left-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-white font-semibold">{username}</div>
            {getTitleDisplay(playerStats.equippedTitleId)}
          </div>
        </div>
      </div>

      {/* XP Progress - Top Right */}
      <div className="absolute top-6 right-6 w-48">
        <XPProgress xpProgress={getXPProgress()} showDetails={false} />
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-4">
          HighCard
        </h1>
        <div className="text-lg text-gray-400">
          Season {currentSeason} • Next season in: <span className="text-emerald-400 font-semibold">{timeToNextSeason}</span>
        </div>
      </div>

      {/* News Section */}
      {featuredNews.length > 0 && (
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Newspaper size={24} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Latest News</h3>
              </div>
              <button
                onClick={() => setModalsOpen('news', true)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View All →
              </button>
            </div>
            
            <div className="space-y-3">
              {featuredNews.slice(0, 2).map((news) => (
                <div
                  key={news.id}
                  onClick={() => setModalsOpen('news', true)}
                  className="bg-gray-750 rounded-lg p-3 cursor-pointer transition-all duration-300 hover:bg-gray-700 border border-gray-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-gray-400 text-lg">📰</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-600 text-yellow-100">
                          FEATURED
                        </span>
                        <span className="text-gray-400 text-xs">
                          {new Date(news.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-white font-medium text-sm line-clamp-1">
                        {news.title}
                      </h4>
                      <p className="text-gray-300 text-xs line-clamp-1">
                        {news.summary}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Menu Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full max-w-4xl">
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

        {/* Tournament Button */}
        <button
          onClick={() => setModalsOpen('tournament', true)}
          disabled={playerStats.level < 7}
          className={`relative bg-gradient-to-r ${getTournamentStatus().status === 'open' ? 'from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 animate-pulse' : 'from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600'} text-white font-semibold py-6 px-8 rounded-lg transition-all duration-300 
                   ${playerStats.level < 7 ? 'opacity-60 grayscale cursor-not-allowed' : 'hover:scale-105 hover:shadow-xl neon-glow'}`}
        >
          {playerStats.level < 7 && (
            <div className="absolute -top-3 -right-3 bg-gray-800 border border-gray-600 text-gray-200 text-xs px-2 py-1 rounded flex items-center gap-1 shadow">
              <Lock size={14} /> Reach Lv 7
            </div>
          )}
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy size={32} />
            <span className="text-2xl">{getTournamentStatus().text}</span>
          </div>
          <div className="text-sm opacity-80">
            {getTournamentStatus().timer ? (
              <div className="flex flex-col items-center gap-1">
                <div>Next tournament in:</div>
                <div className="font-bold text-lg">{getTournamentStatus().timer}</div>
              </div>
            ) : (
              'Competitive brackets every 10 minutes'
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
            <div className="bg-black bg-opacity-30 rounded p-2">
              <div>1v1: {playerStats.tournamentStats?.['1v1']?.wins || 0}W/{playerStats.tournamentStats?.['1v1']?.losses || 0}L</div>
            </div>
            <div className="bg-black bg-opacity-30 rounded p-2">
              <div>2v2: {playerStats.tournamentStats?.['2v2']?.wins || 0}W/{playerStats.tournamentStats?.['2v2']?.losses || 0}L</div>
            </div>
          </div>
        </button>
      </div>

      {/* Secondary Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full max-w-2xl">
        <button
          onClick={() => setModalsOpen('inventory', true)}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 
                   text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3"
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

      {/* Detailed Level Progress (moved here) */}
      <div className="w-full max-w-2xl mb-8">
        <XPProgress xpProgress={getXPProgress()} showDetails={true} />
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
          onClick={() => setModalsOpen('news', true)}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg 
                   transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <Newspaper size={18} />
          News
        </button>

        <button
          onClick={() => setModalsOpen('leaderboards', true)}
          className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg 
                   transition-all duration-300 hover:scale-105 flex items-center gap-2"
        >
          <Trophy size={18} />
          Leaderboards
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
