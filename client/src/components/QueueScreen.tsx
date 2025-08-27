import { useState, useEffect } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { ArrowLeft, Users, Zap, Star } from "lucide-react";
import XPProgress from "./XPProgress";
import { calculateDynamicQueueTime, formatQueueTime, getCurrentOnlinePlayerCount } from "../lib/onlinePlayerSystem";

const QueueScreen = () => {
  const { gameMode, gameType, setCurrentScreen } = useGameStore();
  const { playerStats, getXPProgress } = usePlayerStore();
  const [queueTime, setQueueTime] = useState(0);
  const [foundMatch, setFoundMatch] = useState(false);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(0);
  const [onlinePlayerData, setOnlinePlayerData] = useState(getCurrentOnlinePlayerCount());

  useEffect(() => {
    // Calculate dynamic queue time based on online players and MMR
    const mmr = gameMode === 'ranked' ? playerStats.rankedStats[gameType].mmr : 0;
    const totalTime = calculateDynamicQueueTime(gameMode, gameType, mmr);
    setEstimatedWaitTime(totalTime);
    
    // Update online player data every 30 seconds
    const playerUpdateInterval = setInterval(() => {
      setOnlinePlayerData(getCurrentOnlinePlayerCount());
    }, 30000);
    
    const interval = setInterval(() => {
      setQueueTime(prev => {
        if (prev >= totalTime) {
          setFoundMatch(true);
          setTimeout(() => {
            setCurrentScreen('game');
          }, 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(playerUpdateInterval);
    };
  }, [gameMode, gameType, playerStats, setCurrentScreen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex flex-col items-center justify-center p-8">
      {/* Back Button */}
      <button
        onClick={() => setCurrentScreen('menu')}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Cancel Queue
      </button>

      {/* XP Progress */}
      <div className="absolute top-6 right-6 w-48">
        <XPProgress xpProgress={getXPProgress()} showDetails={false} />
      </div>

      {/* Queue Status */}
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            {foundMatch ? 'Match Found!' : 'Searching for Match...'}
          </h1>
          <div className="text-xl text-gray-300">
            {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} {gameType}
          </div>
          {!foundMatch && (
            <div className="text-lg text-yellow-400 mt-2">
              ESTIMATED WAIT TIME: {formatQueueTime(estimatedWaitTime)}
            </div>
          )}
        </div>

        {/* Queue Animation */}
        <div className="mb-8">
          {foundMatch ? (
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
              <Zap size={48} className="text-white" />
            </div>
          ) : (
            <div className="queue-animation">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Users size={48} className="text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="mb-8">
          <div className="text-6xl font-bold text-emerald-400 mb-2">
            {Math.floor(queueTime / 60).toString().padStart(2, '0')}:
            {(queueTime % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-gray-400">
            {foundMatch ? 'Starting game...' : 'Time in queue'}
          </div>
        </div>

        {/* Game Info */}
        <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4">Game Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Mode:</span>
              <span className="text-white font-medium">{gameMode} {gameType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Players:</span>
              <span className="text-white font-medium">
                {gameType === '1v1' ? '2 players' : '4 players'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Rounds:</span>
              <span className="text-white font-medium">10 rounds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Cards per player:</span>
              <span className="text-white font-medium">8 + 2 power-ups</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Online players:</span>
              <span className="text-emerald-400 font-medium">{onlinePlayerData.totalOnline}</span>
            </div>
            {gameMode === 'ranked' && (
              <div className="flex justify-between">
                <span className="text-gray-400">Current MMR:</span>
                <span className="text-emerald-400 font-medium">
                  {playerStats.rankedStats[gameType].mmr}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Queue Tips */}
        {!foundMatch && (
          <div className="mt-8 text-center">
            <div className="text-sm text-gray-400 max-w-md mx-auto">
              {gameMode === 'ranked' 
                ? "Higher ranked players may experience longer queue times as we find suitable opponents."
                : "Casual matches typically have shorter queue times."
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueScreen;
