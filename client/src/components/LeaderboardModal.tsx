import { useState, useEffect } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useLeaderboardStore } from "../lib/stores/useLeaderboardStore";
import { X, Trophy, BarChart3, Crown, Star } from "lucide-react";

const LeaderboardModal = () => {
  const { modalsOpen, setModalsOpen } = useGameStore();
  const { username, playerStats } = usePlayerStore();
  const { statsLeaderboard, competitiveLeaderboard1v1, competitiveLeaderboard2v2 } = useLeaderboardStore();
  const [activeTab, setActiveTab] = useState<'stats' | 'competitive'>('stats');

  if (!modalsOpen.leaderboards) return null;

  const getRankColor = (rank: string | null) => {
    if (!rank) return 'text-gray-400';
    return `rank-${rank.toLowerCase().replace(' ', '-')}`;
  };

  const renderStatsLeaderboard = () => (
    <div className="space-y-3">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Total Wins Leaderboard</h3>
        <p className="text-gray-400 text-sm">Ranked by total wins across all game modes</p>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {statsLeaderboard.slice(0, 50).map((player, index) => {
          const isCurrentPlayer = player.name === username && !player.isAI;
          return (
            <div 
              key={player.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isCurrentPlayer ? 'bg-emerald-900 border border-emerald-600' : 'bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index === 0 ? 'bg-yellow-500 text-black' :
                  index === 1 ? 'bg-gray-400 text-black' :
                  index === 2 ? 'bg-orange-500 text-black' :
                  'bg-gray-600 text-white'
                }`}>
                  {index < 3 ? <Crown size={16} /> : index + 1}
                </div>
                <div>
                  <div className={`font-semibold ${isCurrentPlayer ? 'text-emerald-400' : 'text-white'}`}>
                    {player.name} {player.isAI && <span className="text-xs text-gray-400">(AI)</span>}
                  </div>
                  {isCurrentPlayer && (
                    <div className="text-xs text-emerald-400">You</div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-yellow-400 font-bold">{player.totalWins} wins</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderCompetitiveLeaderboard = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Competitive Leaderboard</h3>
        <p className="text-gray-400 text-sm">Diamond+ players only</p>
      </div>

      {/* Tab selector for 1v1 vs 2v2 */}
      <div className="flex bg-gray-700 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('competitive')}
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors bg-blue-600 text-white"
        >
          1v1 Rankings
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className="flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors text-gray-300 hover:text-white"
        >
          2v2 Rankings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1v1 Leaderboard */}
        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
            <Trophy size={20} />
            1v1 Champions
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {competitiveLeaderboard1v1.slice(0, 25).map((player, index) => {
              const isCurrentPlayer = player.name === username && !player.isAI;
              return (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    isCurrentPlayer ? 'bg-emerald-900 border border-emerald-600' : 'bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-500 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index < 3 ? <Crown size={12} /> : index + 1}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isCurrentPlayer ? 'text-emerald-400' : 'text-white'}`}>
                        {player.name} {player.isAI && <span className="text-xs text-gray-400">(AI)</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-sm">{player.mmr} MMR</div>
                    <div className="text-xs text-gray-400">Grand Champion</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2v2 Leaderboard */}
        <div>
          <h4 className="text-lg font-semibold text-purple-400 mb-3 flex items-center gap-2">
            <Trophy size={20} />
            2v2 Champions
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {competitiveLeaderboard2v2.slice(0, 25).map((player, index) => {
              const isCurrentPlayer = player.name === username && !player.isAI;
              return (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    isCurrentPlayer ? 'bg-emerald-900 border border-emerald-600' : 'bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-500 text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-orange-500 text-black' :
                      'bg-gray-600 text-white'
                    }`}>
                      {index < 3 ? <Crown size={12} /> : index + 1}
                    </div>
                    <div>
                      <div className={`text-sm font-medium ${isCurrentPlayer ? 'text-emerald-400' : 'text-white'}`}>
                        {player.name} {player.isAI && <span className="text-xs text-gray-400">(AI)</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold text-sm">{player.mmr} MMR</div>
                    <div className="text-xs text-gray-400">Grand Champion</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Leaderboards</h2>
          </div>
          <button
            onClick={() => setModalsOpen('leaderboards', false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-700 mx-6 mt-6 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'stats' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <BarChart3 size={16} />
            Stats
          </button>
          <button
            onClick={() => setActiveTab('competitive')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'competitive' 
                ? 'bg-emerald-600 text-white' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            <Star size={16} />
            Competitive
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === 'stats' ? renderStatsLeaderboard() : renderCompetitiveLeaderboard()}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;