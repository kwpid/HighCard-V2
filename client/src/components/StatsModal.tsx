import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { X, TrendingUp, Trophy, Zap, Star } from "lucide-react";
import XPProgress from "./XPProgress";

const StatsModal = () => {
  const { modalsOpen, setModalsOpen } = useGameStore();
  const { playerStats, getXPProgress } = usePlayerStore();

  if (!modalsOpen.stats) return null;

  const getRankColor = (rank: string) => {
    return `rank-${rank.toLowerCase().replace(' ', '-')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <TrendingUp size={24} className="text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Player Statistics</h2>
          </div>
          <button
            onClick={() => setModalsOpen('stats', false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Overall Stats */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Overall Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-emerald-400">
                  {playerStats.casualStats['1v1'].wins + playerStats.casualStats['2v2'].wins + 
                   playerStats.rankedStats['1v1'].wins + playerStats.rankedStats['2v2'].wins}
                </div>
                <div className="text-sm text-gray-400">Total Wins</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">
                  {playerStats.casualStats['1v1'].losses + playerStats.casualStats['2v2'].losses + 
                   playerStats.rankedStats['1v1'].losses + playerStats.rankedStats['2v2'].losses}
                </div>
                <div className="text-sm text-gray-400">Total Losses</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400">
                  {playerStats.casualStats['1v1'].gamesPlayed + playerStats.casualStats['2v2'].gamesPlayed + 
                   playerStats.rankedStats['1v1'].gamesPlayed + playerStats.rankedStats['2v2'].gamesPlayed}
                </div>
                <div className="text-sm text-gray-400">Games Played</div>
              </div>
            </div>
          </div>

          {/* XP and Leveling */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Star size={24} className="text-yellow-400" />
              Experience & Leveling
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* XP Progress */}
              <div className="bg-gray-700 rounded-lg p-4">
                <XPProgress xpProgress={getXPProgress()} showDetails={true} />
              </div>
              
              {/* XP Details */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">XP Information</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Level:</span>
                    <span className="text-white font-medium">{playerStats.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total XP:</span>
                    <span className="text-emerald-400 font-medium">{playerStats.xp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP from Casual:</span>
                    <span className="text-blue-400 font-medium">
                      {playerStats.casualStats['1v1'].gamesPlayed + playerStats.casualStats['2v2'].gamesPlayed} * 5 XP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP from Ranked:</span>
                    <span className="text-emerald-400 font-medium">
                      {playerStats.rankedStats['1v1'].gamesPlayed + playerStats.rankedStats['2v2'].gamesPlayed} * 10 XP
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">XP from Wins:</span>
                    <span className="text-yellow-400 font-medium">
                      {(playerStats.casualStats['1v1'].wins + playerStats.casualStats['2v2'].wins + 
                        playerStats.rankedStats['1v1'].wins + playerStats.rankedStats['2v2'].wins) * 15} XP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Casual Stats */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Casual Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1v1 Casual */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-400 mb-3">1v1 Casual</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wins:</span>
                    <span className="text-emerald-400 font-medium">
                      {playerStats.casualStats['1v1'].wins}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Losses:</span>
                    <span className="text-red-400 font-medium">
                      {playerStats.casualStats['1v1'].losses}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-white font-medium">
                      {playerStats.casualStats['1v1'].gamesPlayed > 0 
                        ? `${Math.round((playerStats.casualStats['1v1'].wins / playerStats.casualStats['1v1'].gamesPlayed) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* 2v2 Casual */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-blue-400 mb-3">2v2 Casual</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wins:</span>
                    <span className="text-emerald-400 font-medium">
                      {playerStats.casualStats['2v2'].wins}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Losses:</span>
                    <span className="text-red-400 font-medium">
                      {playerStats.casualStats['2v2'].losses}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-white font-medium">
                      {playerStats.casualStats['2v2'].gamesPlayed > 0 
                        ? `${Math.round((playerStats.casualStats['2v2'].wins / playerStats.casualStats['2v2'].gamesPlayed) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ranked Stats */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Ranked Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1v1 Ranked */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <Trophy size={20} />
                  1v1 Ranked
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Rank:</span>
                    <span className={`font-medium ${getRankColor(playerStats.rankedStats['1v1'].currentRank || 'Unranked')}`}>
                      {playerStats.rankedStats['1v1'].currentRank || 'Unranked'} {playerStats.rankedStats['1v1'].division || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MMR:</span>
                    <span className="text-white font-medium">
                      {playerStats.rankedStats['1v1'].mmr}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Placement Matches:</span>
                    <span className="text-yellow-400 font-medium">
                      {playerStats.rankedStats['1v1'].placementMatches}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Season Wins:</span>
                    <span className="text-emerald-400 font-medium">
                      {playerStats.totalSeasonWins}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-white font-medium">
                      {playerStats.rankedStats['1v1'].gamesPlayed > 0 
                        ? `${Math.round((playerStats.rankedStats['1v1'].wins / playerStats.rankedStats['1v1'].gamesPlayed) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* 2v2 Ranked */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                  <Trophy size={20} />
                  2v2 Ranked
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Rank:</span>
                    <span className={`font-medium ${getRankColor(playerStats.rankedStats['2v2'].currentRank || 'Unranked')}`}>
                      {playerStats.rankedStats['2v2'].currentRank || 'Unranked'} {playerStats.rankedStats['2v2'].division || ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">MMR:</span>
                    <span className="text-white font-medium">
                      {playerStats.rankedStats['2v2'].mmr}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Placement Matches:</span>
                    <span className="text-yellow-400 font-medium">
                      {playerStats.rankedStats['2v2'].placementMatches}/5
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Season Wins:</span>
                    <span className="text-emerald-400 font-medium">
                      {playerStats.totalSeasonWins}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-white font-medium">
                      {playerStats.rankedStats['2v2'].gamesPlayed > 0 
                        ? `${Math.round((playerStats.rankedStats['2v2'].wins / playerStats.rankedStats['2v2'].gamesPlayed) * 100)}%`
                        : '0%'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Season Rewards Progress */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Zap size={24} className="text-yellow-400" />
              Season Rewards Progress
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1v1 Rewards */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">1v1 Season Rewards</h4>
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    Current Progress: {playerStats.totalSeasonWins} wins
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((playerStats.totalSeasonWins % 10) * 10, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {playerStats.totalSeasonWins % 10 === 0 ? 10 : 10 - (playerStats.totalSeasonWins % 10)} wins until next reward
                  </div>
                </div>
              </div>

              {/* Combined Season Rewards */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-yellow-400 mb-3">Combined Season Rewards</h4>
                <div className="space-y-3">
                  <div className="text-sm text-gray-400">
                    All ranked wins count toward season rewards
                  </div>
                  <div className="text-xs text-gray-400">
                    Progress is shown above (1v1 + 2v2 combined)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
