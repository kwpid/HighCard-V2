import { create } from "zustand";
import { getRankFromMMR, calculateMMRChange, RANKS } from "../gameLogic";
import { useLeaderboardStore } from "./useLeaderboardStore";
import { calculateXPGain, checkLevelUp, calculateXPProgress } from "../xpSystem";
import { levelTitles } from "../titles";

type GameMode = 'casual' | 'ranked' | 'tournament';
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
  peakMMR?: number;
  highestRank?: string | null;
  highestDivision?: string | null;
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
  tournamentStats: {
    '1v1': GameStats;
    '2v2': GameStats;
  };
  tournamentWins: {
    currentSeason: number;
  };
  totalSeasonWins: number;
  level: number;
  xp: number;
  ownedTitles?: { id: string; name: string; type: 'regular' | 'ranked' | 'tournament'; season?: number; rankColor?: string; glow?: boolean }[];
  equippedTitleId?: string | null;
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
  getXPProgress: () => ReturnType<typeof calculateXPProgress>;
  resetAllStats: () => void;
  equipTitle: (id: string | null) => void;
  addTitleIfNotOwned: (title: { id: string; name: string; type: 'regular' | 'ranked' | 'tournament'; season?: number; rankColor?: string; glow?: boolean }) => boolean;
  getSeasonRewardStatus: () => { currentTier: string; nextTier: string | null; winsInTier: number; winsNeeded: number };
  awardSeasonRewards: (previousSeason: number, playerStats: PlayerStats) => void;
  forceSeasonReset: () => void;
}

const defaultStats: PlayerStats = {
  casualStats: {
    '1v1': { wins: 0, losses: 0, gamesPlayed: 0 },
    '2v2': { wins: 0, losses: 0, gamesPlayed: 0 },
  },
  rankedStats: {
    '1v1': { 
      wins: 0, losses: 0, gamesPlayed: 0, mmr: 450, 
      currentRank: null, division: null, placementMatches: 0, peakMMR: 450, highestRank: null, highestDivision: null 
    },
    '2v2': { 
      wins: 0, losses: 0, gamesPlayed: 0, mmr: 450, 
      currentRank: null, division: null, placementMatches: 0, peakMMR: 450, highestRank: null, highestDivision: null 
    },
  },
  tournamentStats: {
    '1v1': { wins: 0, losses: 0, gamesPlayed: 0 },
    '2v2': { wins: 0, losses: 0, gamesPlayed: 0 },
  },
  tournamentWins: {
    currentSeason: 0,
  },
  totalSeasonWins: 0,
  level: 1,
  xp: 0,
  ownedTitles: [],
  equippedTitleId: null,
};

export const usePlayerStore = create<PlayerState>((set: any, get: any) => ({
  playerStats: defaultStats,
  currentSeason: 0, // Pre-season
  username: "Player",

  updateStats: (gameMode: GameMode, gameType: GameType, won: boolean, opponentMMR?: number) => {
    set((state: PlayerState) => {
      const newStats = { ...state.playerStats };
      
      // Calculate and add XP (tournament games give same XP as casual)
      const xpGameMode = gameMode === 'tournament' ? 'casual' : gameMode;
      const xpGained = calculateXPGain(won, xpGameMode as 'casual' | 'ranked', gameType);
      newStats.xp += xpGained;
      
      // Check for level up
      const newLevel = checkLevelUp(newStats.xp, newStats.level);
      if (newLevel) {
        newStats.level = newLevel;
        // Award all configured level titles up to this level
        const toAward = levelTitles.filter(t => t.level <= newStats.level);
        toAward.forEach(t => {
          const has = (newStats.ownedTitles || []).some(x => x.id === t.id);
          if (!has) {
            newStats.ownedTitles = [...(newStats.ownedTitles || []), { id: t.id, name: t.name, type: 'regular' }];
            import('./useGameStore').then(mod => {
              const { enqueueRewards } = mod.useGameStore.getState();
              enqueueRewards([{ id: t.id, type: 'title', name: t.name }]);
            }).catch(() => {});
          }
        });
      }
      
      if (gameMode === 'casual') {
        const casualStats = newStats.casualStats[gameType];
        casualStats.gamesPlayed += 1;
        if (won) {
          casualStats.wins += 1;
        } else {
          casualStats.losses += 1;
        }
      } else if (gameMode === 'tournament') {
        const tournamentStats = newStats.tournamentStats[gameType];
        tournamentStats.gamesPlayed += 1;
        if (won) {
          tournamentStats.wins += 1;
        } else {
          tournamentStats.losses += 1;
        }
        // Tournament games don't affect MMR but do count towards wins/losses
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
            // Track peaks
            rankedStats.peakMMR = Math.max(rankedStats.peakMMR || rankedStats.mmr, rankedStats.mmr);
            rankedStats.highestRank = rankedStats.highestRank || rank;
            rankedStats.highestDivision = rankedStats.highestDivision || division;
          }
        } else {
          // Regular ranked match
          const mmrChange = calculateMMRChange(won, rankedStats.mmr, opponentMMR || rankedStats.mmr);
          rankedStats.mmr = Math.max(0, rankedStats.mmr + mmrChange);
          
          // Update rank based on new MMR
          const { rank, division } = getRankFromMMR(rankedStats.mmr);
          rankedStats.currentRank = rank;
          rankedStats.division = division;
          // Update peak MMR and highest rank
          rankedStats.peakMMR = Math.max(rankedStats.peakMMR || rankedStats.mmr, rankedStats.mmr);
          if (!rankedStats.highestRank) {
            rankedStats.highestRank = rank;
            rankedStats.highestDivision = division;
          } else {
            // Promote highestRank if this rank is higher in the ladder
            const ladder = ['Bronze','Silver','Gold','Platinum','Diamond','Champion','Grand Champion','Card Legend'];
            const currentIdx = ladder.indexOf(rankedStats.highestRank);
            const newIdx = ladder.indexOf(rank);
            if (newIdx > currentIdx) {
              rankedStats.highestRank = rank;
              rankedStats.highestDivision = division;
            } else if (newIdx === currentIdx && rank !== 'Card Legend') {
              // Same rank but potentially higher division
              const currentDivision = rankedStats.highestDivision;
              const divisionOrder = ['I', 'II', 'III'];
              if (division && currentDivision && divisionOrder.indexOf(division) > divisionOrder.indexOf(currentDivision)) {
                rankedStats.highestDivision = division;
              }
            }
          }
        }
      }

      // Save to localStorage
      localStorage.setItem('highcard-player-stats', JSON.stringify(newStats));
      
      // Update leaderboards if in browser environment
      if (typeof window !== 'undefined') {
        const { updatePlayerOnLeaderboards } = useLeaderboardStore.getState();
        updatePlayerOnLeaderboards(get().username, newStats);
      }
      
      return { playerStats: newStats };
    });
  },

  setUsername: (username: string) => {
    set({ username });
    localStorage.setItem('highcard-username', username);
  },

  initializePlayer: () => {
    const savedStats = localStorage.getItem('highcard-player-stats');
    const savedUsername = localStorage.getItem('highcard-username');
    
    if (savedStats) {
      try {
        const parsedStats = JSON.parse(savedStats);
        // Ensure level and xp exist for backward compatibility
        if (parsedStats.level === undefined) parsedStats.level = 1;
        if (parsedStats.xp === undefined) parsedStats.xp = 0;
        
        // Initialize tournament stats if missing
        if (!parsedStats.tournamentStats) {
          parsedStats.tournamentStats = {
            '1v1': { wins: 0, losses: 0, gamesPlayed: 0 },
            '2v2': { wins: 0, losses: 0, gamesPlayed: 0 },
          };
        }
        if (!parsedStats.tournamentWins) {
          parsedStats.tournamentWins = { currentSeason: 0 };
        }
        if (!parsedStats.ownedTitles) {
          parsedStats.ownedTitles = [];
        }
        
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
    
    const previousSeason = get().currentSeason;
    let newSeason = 0;
    
    if (now < seasonStart) {
      newSeason = 0; // Pre-season
    } else {
      const monthsSinceStart = (now.getFullYear() - seasonStart.getFullYear()) * 12 + 
                              (now.getMonth() - seasonStart.getMonth());
      newSeason = Math.max(1, monthsSinceStart + 1);
    }
    
    set({ currentSeason: newSeason });
    
    // If season has advanced, handle season reset and rewards
    if (newSeason > previousSeason && previousSeason > 0) {
      console.log(`Season ended! Previous: ${previousSeason}, New: ${newSeason}`);
      
      // Award season-end rewards and titles before reset
      const { playerStats } = get();
      get().awardSeasonRewards(previousSeason, playerStats);
      
      // Then reset the season stats
      get().resetSeasonStats();
      
      // Update AI leaderboard stats
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          try {
            const leaderboardStore = (window as any).__leaderboardStore;
            if (leaderboardStore) {
              const { progressAIStats } = leaderboardStore.getState();
              progressAIStats(newSeason);
            }
          } catch (error) {
            console.error('Error updating AI stats for new season:', error);
          }
        }, 100);
      }
    }
  },

  awardSeasonRewards: (previousSeason: number, playerStats: PlayerStats) => {
    const rewards: any[] = [];
    const newTitles: any[] = [];
    
    // Award titles based on highest rank achieved in each mode
    const modes: ('1v1' | '2v2')[] = ['1v1', '2v2'];
    
    modes.forEach(mode => {
      const highestRank = playerStats.rankedStats[mode].highestRank;
      const highestDivision = playerStats.rankedStats[mode].highestDivision;
      
      if (highestRank) {
        const titleId = `season_${previousSeason}_${mode}_${highestRank.toLowerCase().replace(' ', '_')}`;
        const titleName = `S${previousSeason} ${highestRank}${highestDivision ? ` ${highestDivision}` : ''} (${mode.toUpperCase()})`;
        
        // Get rank color for the title
        const rankColors: { [key: string]: string } = {
          'bronze': '#cd7f32',
          'silver': '#c0c0c0',
          'gold': '#ffd700',
          'platinum': '#e5e4e2',
          'diamond': '#b9f2ff',
          'champion': '#9d4edd',
          'grand champion': '#ff006e',
          'card legend': '#ffffff'
        };
        
        const title = {
          id: titleId,
          name: titleName,
          type: 'ranked' as const,
          season: previousSeason,
          rankColor: rankColors[highestRank.toLowerCase()] || '#ffffff',
          glow: ['Champion', 'Grand Champion', 'Card Legend'].includes(highestRank)
        };
        
        const wasAdded = get().addTitleIfNotOwned(title);
        if (wasAdded) {
          newTitles.push(title);
          rewards.push({ id: titleId, type: 'title', name: titleName });
        }
      }
    });
    
    // Award season win-based rewards (XP, titles)
    const seasonWins = playerStats.totalSeasonWins;
    if (seasonWins >= 10) {
      const winTitleId = `season_${previousSeason}_warrior`;
      const winTitle = {
        id: winTitleId,
        name: `S${previousSeason} Warrior`,
        type: 'ranked' as const,
        season: previousSeason,
        rankColor: '#10b981',
        glow: false
      };
      
      const wasAdded = get().addTitleIfNotOwned(winTitle);
      if (wasAdded) {
        newTitles.push(winTitle);
        rewards.push({ id: winTitleId, type: 'title', name: winTitle.name });
      }
    }
    
    if (seasonWins >= 50) {
      const veteranTitleId = `season_${previousSeason}_veteran`;
      const veteranTitle = {
        id: veteranTitleId,
        name: `S${previousSeason} Veteran`,
        type: 'ranked' as const,
        season: previousSeason,
        rankColor: '#f59e0b',
        glow: true
      };
      
      const wasAdded = get().addTitleIfNotOwned(veteranTitle);
      if (wasAdded) {
        newTitles.push(veteranTitle);
        rewards.push({ id: veteranTitleId, type: 'title', name: veteranTitle.name });
      }
    }
    
    // Award bonus XP based on season performance
    const bonusXP = Math.min(seasonWins * 25 + (playerStats.rankedStats['1v1'].wins + playerStats.rankedStats['2v2'].wins) * 10, 1000);
    if (bonusXP > 0) {
      rewards.push({ id: 'season_xp', type: 'xp', amount: bonusXP });
      
      // Apply the XP bonus
      set((state: PlayerState) => {
        const newStats = { ...state.playerStats };
        newStats.xp += bonusXP;
        
        // Check for level up
        const newLevel = checkLevelUp(newStats.xp, newStats.level);
        if (newLevel) {
          newStats.level = newLevel;
        }
        
        localStorage.setItem('highcard-player-stats', JSON.stringify(newStats));
        return { playerStats: newStats };
      });
    }
    
    // Show rewards modal if there are any rewards
    if (rewards.length > 0) {
      console.log('Season rewards awarded:', rewards);
      
      // Queue rewards for display
      import('./useGameStore').then(mod => {
        const { enqueueRewards } = mod.useGameStore.getState();
        enqueueRewards(rewards);
      }).catch(() => {});
    }
  },
  
  resetSeasonStats: () => {
    set((state: PlayerState) => {
      const newStats = { ...state.playerStats };
      
      // Soft reset MMR (reduce by 30%, keep 70%)
      newStats.rankedStats['1v1'].mmr = Math.max(450, Math.floor(newStats.rankedStats['1v1'].mmr * 0.7));
      newStats.rankedStats['2v2'].mmr = Math.max(450, Math.floor(newStats.rankedStats['2v2'].mmr * 0.7));
      
      // Reset peak MMR to current MMR since it's a new season
      newStats.rankedStats['1v1'].peakMMR = newStats.rankedStats['1v1'].mmr;
      newStats.rankedStats['2v2'].peakMMR = newStats.rankedStats['2v2'].mmr;
      
      // Keep highest rank and division achieved (lifetime achievement)
      // but reset current rank to null so players need to do placements
      
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

  resetAllStats: () => {
    set(() => {
      const fresh = JSON.parse(JSON.stringify(defaultStats)) as PlayerStats;
      localStorage.setItem('highcard-player-stats', JSON.stringify(fresh));
      return { playerStats: fresh };
    });
  },

  equipTitle: (id: string | null) => {
    set((state: PlayerState) => {
      const newStats = { ...state.playerStats, equippedTitleId: id } as PlayerStats;
      localStorage.setItem('highcard-player-stats', JSON.stringify(newStats));
      return { playerStats: newStats };
    });
  },

  addTitleIfNotOwned: (title: { id: string; name: string; type: 'regular' | 'ranked' | 'tournament'; season?: number; rankColor?: string; glow?: boolean }) => {
    const current = get().playerStats;
    const exists = (current.ownedTitles || []).some((t: any) => t.id === title.id);
    if (exists) return false;
    const updated = { ...current, ownedTitles: [...(current.ownedTitles || []), title] } as PlayerStats;
    set({ playerStats: updated });
    localStorage.setItem('highcard-player-stats', JSON.stringify(updated));
    return true;
  },

  getSeasonRewardStatus: () => {
    const { playerStats } = get();
    const totalWins = playerStats.totalSeasonWins;
    const rankIdx = (rank: string | null) => Math.max(0, RANKS.indexOf(rank || 'Bronze'));
    const capIndex = Math.max(
      rankIdx(playerStats.rankedStats['1v1'].currentRank),
      rankIdx(playerStats.rankedStats['2v2'].currentRank)
    );
    const tiersEarned = Math.min(capIndex, Math.floor(totalWins / 10));
    const currentTier = RANKS[Math.max(0, tiersEarned)] || 'Bronze';
    const nextTierIndex = Math.min(capIndex, tiersEarned + 1);
    const nextTier = nextTierIndex > tiersEarned ? RANKS[nextTierIndex] : null;
    const winsInTier = totalWins % 10;
    const winsNeeded = nextTier ? Math.max(0, 10 - winsInTier) : 0;
    return { currentTier, nextTier, winsInTier, winsNeeded };
  },

  getXPProgress: () => {
    const { playerStats } = get();
    return calculateXPProgress(playerStats.xp, playerStats.level);
  },
  
  forceSeasonReset: () => {
    const { playerStats, currentSeason } = get();
    console.log('Forcing season reset for testing...');
    
    // Award rewards for current season
    get().awardSeasonRewards(currentSeason, playerStats);
    
    // Reset stats
    get().resetSeasonStats();
    
    // Increment season for testing
    set({ currentSeason: currentSeason + 1 });
    localStorage.setItem('highcard-current-season', (currentSeason + 1).toString());
  }
}));
