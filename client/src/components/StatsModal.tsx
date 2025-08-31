import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { X, TrendingUp, Trophy, Zap, Star, BarChart3 } from "lucide-react";
import XPProgress from "./XPProgress";
import RankImage from "./RankImage";
import MMRHistoryGraph from "./MMRHistoryGraph";
import React, { useState, useEffect } from "react";

interface MMRDataPoint {
  date: string;
  mmr: number;
  rank: string;
  division?: string;
}

interface SeasonalPeak {
  season: number;
  peakMMR: number;
  peakRank?: string;
  peakDivision?: string;
  achievedAt: string;
}

const StatsModal = () => {
  const { modalsOpen, setModalsOpen } = useGameStore();
  const { playerStats, getXPProgress, currentSeason } = usePlayerStore();
  const [mmrHistory1v1, setMmrHistory1v1] = useState<MMRDataPoint[]>([]);
  const [mmrHistory2v2, setMmrHistory2v2] = useState<MMRDataPoint[]>([]);
  const [seasonalPeaks, setSeasonalPeaks] = useState<SeasonalPeak[]>([]);
  const [showGraphs, setShowGraphs] = useState(false);

  useEffect(() => {
    if (modalsOpen.stats) {
      // For now, generate sample data since we're using local storage
      // In a real implementation, this would fetch from the API
      generateSampleMMRData();
    }
  }, [modalsOpen.stats]);

  const generateSampleMMRData = () => {
    const generateDataForMode = (mode: '1v1' | '2v2', startMMR: number): MMRDataPoint[] => {
      const data: MMRDataPoint[] = [];
      const currentMMR = playerStats.rankedStats[mode].mmr;
      const games = playerStats.rankedStats[mode].gamesPlayed;
      
      if (games === 0) return [];
      
      // Generate sample history based on current stats
      const numPoints = Math.min(games, 20);
      for (let i = 0; i < numPoints; i++) {
        const progress = i / (numPoints - 1);
        const mmr = Math.round(startMMR + (currentMMR - startMMR) * progress + (Math.random() - 0.5) * 100);
        const date = new Date();
        date.setDate(date.getDate() - (numPoints - i) * 2);
        
        data.push({
          date: date.toISOString(),
          mmr: Math.max(0, mmr),
          rank: playerStats.rankedStats[mode].currentRank || 'Bronze',
          division: playerStats.rankedStats[mode].division || 'I'
        });
      }
      return data;
    };

    setMmrHistory1v1(generateDataForMode('1v1', 450));
    setMmrHistory2v2(generateDataForMode('2v2', 450));
    
    // Generate sample seasonal peaks
    const peaks: SeasonalPeak[] = [];
    if (playerStats.rankedStats['1v1'].peakMMR && playerStats.rankedStats['1v1'].peakMMR > 450) {
      peaks.push({
        season: currentSeason,
        peakMMR: playerStats.rankedStats['1v1'].peakMMR,
        peakRank: playerStats.rankedStats['1v1'].highestRank || undefined,
        peakDivision: playerStats.rankedStats['1v1'].highestDivision || undefined,
        achievedAt: new Date().toISOString()
      });
    }
    if (playerStats.rankedStats['2v2'].peakMMR && playerStats.rankedStats['2v2'].peakMMR > 450) {
      peaks.push({
        season: currentSeason,
        peakMMR: playerStats.rankedStats['2v2'].peakMMR,
        peakRank: playerStats.rankedStats['2v2'].highestRank || undefined,
        peakDivision: playerStats.rankedStats['2v2'].highestDivision || undefined,
        achievedAt: new Date().toISOString()
      });
    }
    setSeasonalPeaks(peaks);
  };

  const getSeasonalPeakDisplay = (mode: '1v1' | '2v2') => {
    const peak = seasonalPeaks.find(p => 
      p.peakMMR === playerStats.rankedStats[mode].peakMMR
    );
    
    if (peak && peak.season !== undefined) {
      return `${peak.peakMMR} (Season ${peak.season})`;
    }
    
    return `${playerStats.rankedStats[mode].peakMMR || playerStats.rankedStats[mode].mmr} (Current Season)`;
  };

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
                <div className="text-2xl font-bold text-yellow-400">
                  Peak MMR: {Math.max(playerStats.rankedStats['1v1'].peakMMR || 0, playerStats.rankedStats['2v2'].peakMMR || 0)}
                </div>
                <div className="text-sm text-gray-400">
                  Highest Rank: {(playerStats.rankedStats['1v1'].highestRank || playerStats.rankedStats['2v2'].highestRank) || '—'}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Season {currentSeason} • {Math.max(playerStats.rankedStats['1v1'].peakMMR || 0, playerStats.rankedStats['2v2'].peakMMR || 0) > 450 ? 'Current Peak' : 'Starting MMR'}
                </div>
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
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Rank:</span>
                    {playerStats.rankedStats['1v1'].currentRank ? (
                      <div className="flex items-center gap-2">
                        <RankImage 
                          rankName={playerStats.rankedStats['1v1'].currentRank} 
                          division={playerStats.rankedStats['1v1'].division}
                          size="sm"
                        />
                        <span className={`font-medium ${getRankColor(playerStats.rankedStats['1v1'].currentRank)}`}>
                          {playerStats.rankedStats['1v1'].currentRank} {playerStats.rankedStats['1v1'].division || ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unranked</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Peak MMR:</span>
                    <span className="text-white font-medium">{getSeasonalPeakDisplay('1v1')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Highest Rank:</span>
                    {playerStats.rankedStats['1v1'].highestRank ? (
                      <div className="flex items-center gap-2">
                        <RankImage 
                          rankName={playerStats.rankedStats['1v1'].highestRank} 
                          division={playerStats.rankedStats['1v1'].highestDivision}
                          size="sm"
                        />
                        <span className={`font-medium ${getRankColor(playerStats.rankedStats['1v1'].highestRank)}`}>
                          {playerStats.rankedStats['1v1'].highestRank} {playerStats.rankedStats['1v1'].highestDivision || ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unranked</span>
                    )}
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
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Current Rank:</span>
                    {playerStats.rankedStats['2v2'].currentRank ? (
                      <div className="flex items-center gap-2">
                        <RankImage 
                          rankName={playerStats.rankedStats['2v2'].currentRank} 
                          division={playerStats.rankedStats['2v2'].division}
                          size="sm"
                        />
                        <span className={`font-medium ${getRankColor(playerStats.rankedStats['2v2'].currentRank)}`}>
                          {playerStats.rankedStats['2v2'].currentRank} {playerStats.rankedStats['2v2'].division || ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unranked</span>
                    )}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Peak MMR:</span>
                    <span className="text-white font-medium">{getSeasonalPeakDisplay('2v2')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Highest Rank:</span>
                    {playerStats.rankedStats['2v2'].highestRank ? (
                      <div className="flex items-center gap-2">
                        <RankImage 
                          rankName={playerStats.rankedStats['2v2'].highestRank} 
                          division={playerStats.rankedStats['2v2'].highestDivision}
                          size="sm"
                        />
                        <span className={`font-medium ${getRankColor(playerStats.rankedStats['2v2'].highestRank)}`}>
                          {playerStats.rankedStats['2v2'].highestRank} {playerStats.rankedStats['2v2'].highestDivision || ''}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">Unranked</span>
                    )}
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

          {/* MMR History Graphs */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <BarChart3 size={24} className="text-blue-400" />
                MMR History
              </h3>
              <button
                onClick={() => setShowGraphs(!showGraphs)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm transition-colors"
              >
                {showGraphs ? 'Hide Graphs' : 'Show Graphs'}
              </button>
            </div>
            
            {showGraphs && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MMRHistoryGraph data={mmrHistory1v1} gameMode="1v1" />
                <MMRHistoryGraph data={mmrHistory2v2} gameMode="2v2" />
              </div>
            )}
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
                  <div className="text-sm text-gray-300">
                    Current Reward Tier: {playerStats.rankedStats['1v1'].currentRank || 'Unranked'}
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
                    Current Reward Tier: {(playerStats.rankedStats['1v1'].currentRank || playerStats.rankedStats['2v2'].currentRank) || 'Unranked'}
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
