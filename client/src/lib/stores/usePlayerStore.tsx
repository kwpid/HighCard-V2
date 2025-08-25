import { create } from "zustand";
import { getRankFromMMR, calculateMMRChange } from "../gameLogic";

type GameMode = 'casual' | 'ranked';
type GameType = '1v1' | '2v2';

interface GameStats {
  wins: number;
  losses: number;
  gamesPlayed: number;
}

interface RankedStats extends GameStats {
  mmr: number;
  currentRank: string | null;
  division: string | null;
  placementMatches: number;
}

interface PlayerStats {
  casualStats: {
    '1v1': GameStats;
    '2v2': GameStats;
  };
  rankedStats: {
    '1v1': RankedStats;
    '2v2': RankedStats;
  };
  totalSeasonWins: number;
}

interface PlayerState {
  playerStats: PlayerStats;
  currentSeason: number;
  username: string;
  
  // Actions
  updateStats: (gameMode: GameMode, gameType: GameType, won: boolean, opponentMMR?: number) => void;
  initializePlayer: () => void;
  resetSeasonStats: () => void;
  setUsername: (username: string) => void;
}

const defaultStats: PlayerStats = {
  casualStats: {
    '1v1': { wins: 0, losses: 0, gamesPlayed: 0 },
    '2v2': { wins: 0, losses: 0, gamesPlayed: 0 },
  },
  rankedStats: {
    '1v1': { 
      wins: 0, losses: 0, gamesPlayed: 0, mmr: 450, 
      currentRank: null, division: null, placementMatches: 0 
    },
    '2v2': { 
      wins: 0, losses: 0, gamesPlayed: 0, mmr: 450, 
      currentRank: null, division: null, placementMatches: 0 
    },
  },
  totalSeasonWins: 0,
};

export const usePlayerStore = create<PlayerState>((set, get) => ({
  playerStats: defaultStats,
  currentSeason: 0, // Pre-season
  username: "Player",

  updateStats: (gameMode, gameType, won, opponentMMR) => {
    set((state) => {
      const newStats = { ...state.playerStats };
      
      if (gameMode === 'casual') {
        const casualStats = newStats.casualStats[gameType];
        casualStats.gamesPlayed += 1;
        if (won) {
          casualStats.wins += 1;
        } else {
          casualStats.losses += 1;
        }
      } else {
        const rankedStats = newStats.rankedStats[gameType];
        rankedStats.gamesPlayed += 1;
        
        if (won) {
          rankedStats.wins += 1;
          newStats.totalSeasonWins += 1;
        } else {
          rankedStats.losses += 1;
        }

        // Handle MMR changes
        if (rankedStats.placementMatches < 5) {
          // Placement match
          rankedStats.placementMatches += 1;
          if (won) {
            rankedStats.mmr += 50; // Larger MMR gains during placements
          } else {
            rankedStats.mmr += 10; // Small gain even for losses during placements
          }
          
          // Set initial rank after 5 placement matches
          if (rankedStats.placementMatches === 5) {
            const { rank, division } = getRankFromMMR(rankedStats.mmr);
            rankedStats.currentRank = rank;
            rankedStats.division = division;
          }
        } else {
          // Regular ranked match
          const mmrChange = calculateMMRChange(won, rankedStats.mmr, opponentMMR || rankedStats.mmr);
          rankedStats.mmr = Math.max(0, rankedStats.mmr + mmrChange);
          
          // Update rank based on new MMR
          const { rank, division } = getRankFromMMR(rankedStats.mmr);
          rankedStats.currentRank = rank;
          rankedStats.division = division;
        }
      }

      // Save to localStorage
      localStorage.setItem('highcard-player-stats', JSON.stringify(newStats));
      
      // Update leaderboards if in browser environment
      if (typeof window !== 'undefined') {
        const { updatePlayerOnLeaderboards } = require('./useLeaderboardStore').useLeaderboardStore.getState();
        updatePlayerOnLeaderboards(get().username, newStats);
      }
      
      return { playerStats: newStats };
    });
  },

  setUsername: (username) => {
    set({ username });
    localStorage.setItem('highcard-username', username);
  },

  initializePlayer: () => {
    const savedStats = localStorage.getItem('highcard-player-stats');
    const savedUsername = localStorage.getItem('highcard-username');
    
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        set({ playerStats: parsedStats });
      } catch (error) {
        console.error('Error parsing saved player stats:', error);
        set({ playerStats: defaultStats });
      }
    } else {
      set({ playerStats: defaultStats });
    }

    if (savedUsername) {
      set({ username: savedUsername });
    }

    // Calculate current season (Pre-season until September 1, 2025)
    const now = new Date();
    const seasonStart = new Date('2025-09-01T00:00:00Z');
    
    if (now < seasonStart) {
      set({ currentSeason: 0 }); // Pre-season
    } else {
      const monthsSinceStart = (now.getFullYear() - seasonStart.getFullYear()) * 12 + 
                              (now.getMonth() - seasonStart.getMonth());
      set({ currentSeason: Math.max(1, monthsSinceStart + 1) });
    }
  },

  resetSeasonStats: () => {
    set((state) => {
      const newStats = { ...state.playerStats };
      
      // Soft reset MMR (like Rocket League)
      newStats.rankedStats['1v1'].mmr = Math.floor(newStats.rankedStats['1v1'].mmr * 0.7);
      newStats.rankedStats['2v2'].mmr = Math.floor(newStats.rankedStats['2v2'].mmr * 0.7);
      
      // Reset placement matches and season wins
      newStats.rankedStats['1v1'].placementMatches = 0;
      newStats.rankedStats['1v1'].currentRank = null;
      newStats.rankedStats['1v1'].division = null;
      
      newStats.rankedStats['2v2'].placementMatches = 0;
      newStats.rankedStats['2v2'].currentRank = null;
      newStats.rankedStats['2v2'].division = null;
      
      newStats.totalSeasonWins = 0;

      // Save to localStorage
      localStorage.setItem('highcard-player-stats', JSON.stringify(newStats));
      
      return { playerStats: newStats };
    });
  },
}));
