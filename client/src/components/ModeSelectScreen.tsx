import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { ArrowLeft, Users, User, Trophy, Star, Lock } from "lucide-react";
import { RANKS } from "../lib/constants";
import XPProgress from "./XPProgress";

const ModeSelectScreen = () => {
  const { selectedMode, setCurrentScreen, setGameMode } = useGameStore();
  const { playerStats, getXPProgress } = usePlayerStore();

  const handleModeSelect = (gameType: '1v1' | '2v2') => {
    if (selectedMode === 'ranked' && playerStats.level < 5) {
      alert('Reach Level 5 to unlock Ranked. Keep playing Casual to level up!');
      return;
    }
    if (selectedMode) {
      setGameMode(selectedMode, gameType);
      setCurrentScreen('queue');
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
      {/* Back Button */}
      <button
        onClick={() => setCurrentScreen('menu')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Menu
      </button>

      {/* XP Progress */}
      <div className="absolute top-6 right-6 w-48">
        <XPProgress xpProgress={getXPProgress()} showDetails={false} />
      </div>

      {/* Rank Ladder (ranked only, before queue) */}
      {selectedMode === 'ranked' && (
        <div className="w-full max-w-3xl mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy size={24} className="text-emerald-400" />
              <h3 className="text-xl font-semibold text-white">Rank Ladder</h3>
            </div>
            <div className="space-y-2">
              {RANKS.map((rank) => {
                const isTiered = rank.divisions.length > 0;
                const mmrLabel = `${rank.mmrRange.min} - ${rank.mmrRange.max === Infinity ? '∞' : rank.mmrRange.max}`;
                const current1v1 = playerStats.rankedStats['1v1'];
                const current2v2 = playerStats.rankedStats['2v2'];
                const isCurrent1v1 = current1v1.currentRank === rank.name;
                const isCurrent2v2 = current2v2.currentRank === rank.name;
                return (
                  <div key={rank.name} className="bg-gray-750 rounded p-3 border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-6 rounded" style={{ backgroundColor: rank.color }} />
                        <div className={`font-bold ${getRankColor(rank.name)}`}>{rank.name}</div>
                        <div className="text-xs text-gray-400">MMR {mmrLabel}</div>
                      </div>
                      {isTiered && (
                        <div className="flex gap-2 text-xs text-gray-400">
                          {rank.divisions.map((d) => (
                            <span key={d} className="bg-gray-700 px-2 py-0.5 rounded">{d}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    {(isCurrent1v1 || isCurrent2v2) && (
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {isCurrent1v1 && (
                          <div className="bg-gray-700 rounded p-2">
                            <div className="text-gray-400">Your 1v1</div>
                            <div className="text-white font-medium">
                              {current1v1.currentRank} {current1v1.division} · {current1v1.mmr} MMR
                            </div>
                          </div>
                        )}
                        {isCurrent2v2 && (
                          <div className="bg-gray-700 rounded p-2">
                            <div className="text-gray-400">Your 2v2</div>
                            <div className="text-white font-medium">
                              {current2v2.currentRank} {current2v2.division} · {current2v2.mmr} MMR
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Season Rewards Progress (for ranked only) */}
      {selectedMode === 'ranked' && (
        <div className="w-full max-w-2xl mb-8">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Star size={24} className="text-yellow-400" />
              <h3 className="text-xl font-semibold text-white">Season Rewards Progress</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-gray-400 mb-2">
                  Current Progress: {playerStats.totalSeasonWins} wins
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
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          Choose Game Mode
        </h1>
        <div className="text-xl text-gray-300 relative inline-flex items-center">
          {selectedMode?.charAt(0).toUpperCase()}{selectedMode?.slice(1)} Play
          {selectedMode === 'ranked' && playerStats.level < 5 && (
            <span className="ml-2 inline-flex items-center gap-1 text-sm text-gray-400">
              <Lock size={14} /> Reach Lv 5
            </span>
          )}
        </div>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* 1v1 Mode */}
        <div 
          onClick={() => handleModeSelect('1v1')}
          className="bg-gray-800 rounded-lg p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-gray-750 border-2 border-transparent hover:border-blue-500"
        >
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <User size={48} className="text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">1v1</h3>
            <p className="text-gray-300 mb-4">
              Face off against a single AI opponent in strategic card battles
            </p>
            
            {selectedMode === 'ranked' && (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-400 mb-2">Current 1v1 Rank</div>
                <div className={`text-lg font-bold ${getRankColor(playerStats.rankedStats['1v1'].currentRank)}`}>
                  {playerStats.rankedStats['1v1'].currentRank || 'Unranked'} {playerStats.rankedStats['1v1'].division || ''}
                </div>
                <div className="text-sm text-gray-400">
                  {playerStats.rankedStats['1v1'].mmr} MMR
                </div>
                {playerStats.rankedStats['1v1'].placementMatches < 5 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    Placement: {playerStats.rankedStats['1v1'].placementMatches}/5
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-700 rounded p-2">
                <div className="text-emerald-400 font-bold">
                  {playerStats[selectedMode === 'casual' ? 'casualStats' : 'rankedStats']['1v1'].wins}
                </div>
                <div className="text-gray-400">Wins</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-red-400 font-bold">
                  {playerStats[selectedMode === 'casual' ? 'casualStats' : 'rankedStats']['1v1'].losses}
                </div>
                <div className="text-gray-400">Losses</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2v2 Mode */}
        <div 
          onClick={() => handleModeSelect('2v2')}
          className="bg-gray-800 rounded-lg p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-gray-750 border-2 border-transparent hover:border-purple-500"
        >
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <Users size={48} className="text-white" />
            </div>
            
            <h3 className="text-2xl font-bold text-white mb-3">2v2</h3>
            <p className="text-gray-300 mb-4">
              Team up with an AI partner against two opponents
            </p>
            
            {selectedMode === 'ranked' && (
              <div className="bg-gray-700 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-400 mb-2">Current 2v2 Rank</div>
                <div className={`text-lg font-bold ${getRankColor(playerStats.rankedStats['2v2'].currentRank)}`}>
                  {playerStats.rankedStats['2v2'].currentRank || 'Unranked'} {playerStats.rankedStats['2v2'].division || ''}
                </div>
                <div className="text-sm text-gray-400">
                  {playerStats.rankedStats['2v2'].mmr} MMR
                </div>
                {playerStats.rankedStats['2v2'].placementMatches < 5 && (
                  <div className="text-xs text-yellow-400 mt-1">
                    Placement: {playerStats.rankedStats['2v2'].placementMatches}/5
                  </div>
                )}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-700 rounded p-2">
                <div className="text-emerald-400 font-bold">
                  {playerStats[selectedMode === 'casual' ? 'casualStats' : 'rankedStats']['2v2'].wins}
                </div>
                <div className="text-gray-400">Wins</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-red-400 font-bold">
                  {playerStats[selectedMode === 'casual' ? 'casualStats' : 'rankedStats']['2v2'].losses}
                </div>
                <div className="text-gray-400">Losses</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 text-center max-w-2xl">
        <div className="text-sm text-gray-400">
          {selectedMode === 'casual' 
            ? "Practice your skills and have fun! Casual games don't affect your rank." 
            : "Ranked games affect your MMR and season rewards. Choose your mode wisely!"
          }
        </div>
      </div>
    </div>
  );
};

export default ModeSelectScreen;