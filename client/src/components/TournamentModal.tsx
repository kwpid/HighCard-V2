import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { useTournamentStore } from "../lib/stores/useTournamentStore";
import { X, Calendar, Clock, Trophy, Users, User, Lock, Crown, Star } from "lucide-react";
import { useEffect, useState } from "react";
import RankImage from "./RankImage";

const TournamentModal = () => {
  const { modalsOpen, setModalsOpen } = useGameStore();
  const { playerStats, currentSeason } = usePlayerStore();
  const { 
    tournaments, 
    generateTournaments, 
    getCurrentTournament, 
    getNextTournaments, 
    getPlayerTournamentRank,
    joinTournament,
    forceStartTournament
  } = useTournamentStore();

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    if (modalsOpen.tournament) {
      generateTournaments();
      const interval = setInterval(() => {
        setCurrentTime(Date.now());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [modalsOpen.tournament, generateTournaments]);

  if (!modalsOpen.tournament) return null;

  const currentTournament = getCurrentTournament();
  const nextTournaments = getNextTournaments();
  const playerTournamentRank = getPlayerTournamentRank();
  const isUnlocked = playerStats.level >= 7;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeUntil = (timestamp: number) => {
    const diff = timestamp - currentTime;
    if (diff <= 0) return "Now";
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getRankColor = (rank: string) => {
    const colors: Record<string, string> = {
      'Bronze': 'text-orange-400',
      'Silver': 'text-gray-300',
      'Gold': 'text-yellow-400',
      'Platinum': 'text-blue-300',
      'Diamond': 'text-cyan-400',
      'Champion': 'text-purple-400',
      'Grand Champion': 'text-pink-400',
      'Card Legend': 'text-white'
    };
    return colors[rank] || 'text-gray-400';
  };

  const handleJoinTournament = (tournamentId: string) => {
    if (!isUnlocked) {
      alert('Reach Level 7 to unlock Tournaments!');
      return;
    }

    console.log('Attempting to join tournament:', tournamentId);
    const success = joinTournament(tournamentId);
    console.log('Join tournament result:', success);
    
    if (success) {
      setModalsOpen('tournament', false);
      alert('Successfully joined tournament! You will see a purple banner when the tournament starts.');
    } else {
      alert('Failed to join tournament. Make sure the tournament is available and you meet the requirements.');
    }
  };

  const handleForceStart = () => {
    const success = forceStartTournament();
    if (success) {
      alert('Tournament started successfully!');
      generateTournaments(); // Refresh tournament list
    } else {
      alert('No upcoming tournaments to start.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Trophy size={24} className="text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">Tournaments</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleForceStart}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
              title="Force start next tournament (for testing)"
            >
              Force Start
            </button>
            <button
              onClick={() => setModalsOpen('tournament', false)}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isUnlocked ? (
            <div className="text-center py-12">
              <Lock size={64} className="mx-auto text-gray-600 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Tournaments Locked</h3>
              <p className="text-gray-400 mb-4">
                Reach Level 7 to unlock competitive tournaments!
              </p>
              <p className="text-sm text-gray-500">
                Current Level: {playerStats.level} / 7
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tournament Rank Info */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Crown size={20} className="text-yellow-400" />
                  Your Tournament Rank
                </h3>
                <div className="flex items-center gap-4">
                  <RankImage 
                    rankName={playerTournamentRank.rank} 
                    division={playerTournamentRank.division}
                    size="md"
                  />
                  <div>
                    <div className={`text-lg font-bold ${getRankColor(playerTournamentRank.rank)}`}>
                      {playerTournamentRank.rank} {playerTournamentRank.division || ''}
                    </div>
                    <div className="text-sm text-gray-400">
                      Based on your highest ranked MMR
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-300">
                  <p>• Tournaments happen every 10 minutes</p>
                  <p>• Semi-finals and finals are best of 3</p>
                  <p>• Tournament games don't affect ranked MMR</p>
                  <p>• Win tournaments to earn special titles!</p>
                </div>
              </div>

              {/* Current Tournament */}
              {currentTournament ? (
                <div className="bg-gradient-to-r from-green-900 to-green-800 rounded-lg p-4 border border-green-600">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Calendar size={20} className="text-green-400" />
                    Current Tournament
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {currentTournament.type === '1v1' ? <User size={16} /> : <Users size={16} />}
                        <span className="font-medium">{currentTournament.type} Tournament</span>
                      </div>
                      <div className="text-sm text-green-200">
                        <div>Started: {formatTime(currentTournament.startTime)}</div>
                        <div>Ends: {formatTime(currentTournament.endTime)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end">
                      <button
                        onClick={() => handleJoinTournament(currentTournament.id)}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Trophy size={16} />
                        Join Tournament
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <Clock size={32} className="mx-auto text-gray-500 mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-1">No Active Tournament</h3>
                  <p className="text-gray-400">Next tournament starts soon!</p>
                </div>
              )}

              {/* Upcoming Tournaments */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-blue-400" />
                  Upcoming Tournaments
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {nextTournaments.slice(0, 4).map((tournament, index) => (
                    <div key={tournament.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {tournament.type === '1v1' ? 
                            <User size={16} className="text-blue-400" /> : 
                            <Users size={16} className="text-purple-400" />
                          }
                          <span className="font-medium text-white">{tournament.type}</span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {index === 0 ? 'Next' : index === 1 ? 'After Next' : `+${index}`}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-300 space-y-1">
                        <div>Starts: {formatTime(tournament.startTime)}</div>
                        <div className="text-yellow-400 font-medium">
                          Starts in: {formatTimeUntil(tournament.startTime)}
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinTournament(tournament.id)}
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded transition-colors text-sm"
                        disabled={tournament.startTime - currentTime > 2 * 60 * 1000} // Can only join 2 minutes before
                      >
                        {tournament.startTime - currentTime > 2 * 60 * 1000 ? 
                          'Opens 2min before' : 
                          'Queue for Tournament'
                        }
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tournament Stats */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Star size={20} className="text-yellow-400" />
                  Tournament Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      {playerStats.tournamentStats['1v1'].wins + playerStats.tournamentStats['2v2'].wins}
                    </div>
                    <div className="text-sm text-gray-400">Total Wins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">
                      {playerStats.tournamentStats['1v1'].losses + playerStats.tournamentStats['2v2'].losses}
                    </div>
                    <div className="text-sm text-gray-400">Total Losses</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {playerStats.tournamentWins.currentSeason}
                    </div>
                    <div className="text-sm text-gray-400">Tournament Wins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">
                      {playerStats.tournamentStats['1v1'].gamesPlayed + playerStats.tournamentStats['2v2'].gamesPlayed}
                    </div>
                    <div className="text-sm text-gray-400">Games Played</div>
                  </div>
                </div>
              </div>

              {/* Tournament Titles Info */}
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Tournament Titles</h3>
                <div className="text-sm text-gray-300 space-y-2">
                  <p>🏆 <strong>Win a tournament</strong> to earn: "S{currentSeason} {playerTournamentRank.rank.toUpperCase()} TOURNAMENT WINNER"</p>
                  <p>⭐ <strong>Win 3 tournaments in a season</strong> to unlock a special variant title!</p>
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-400">Title Colors:</p>
                    <p className="text-xs">• Standard ranks: <span className="text-white">White</span> → <span className="text-green-400">Green</span> (3 wins)</p>
                    <p className="text-xs">• Grand Champion: <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">White Glow</span> → <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">Golden Glow</span></p>
                    <p className="text-xs">• Card Legend: <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">White Glow</span> → <span className="text-pink-400 drop-shadow-[0_0_8px_rgba(255,192,203,0.8)]">Pink Glow</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentModal;