import { create } from "zustand";

export interface LeaderboardPlayer {
  id: string;
  name: string;
  mmr?: number;
  totalWins?: number;
  isAI: boolean;
  gameMode: '1v1' | '2v2';
  aiPersonality?: 'aggressive' | 'conservative' | 'adaptive' | 'random';
}

interface LeaderboardState {
  statsLeaderboard: LeaderboardPlayer[];
  competitiveLeaderboard1v1: LeaderboardPlayer[];
  competitiveLeaderboard2v2: LeaderboardPlayer[];
  
  // Actions
  initializeLeaderboards: () => void;
  updatePlayerOnLeaderboards: (playerName: string, stats: any) => void;
  getOpponentByMMR: (playerMMR: number, gameMode: '1v1' | '2v2') => LeaderboardPlayer | null;
}

// Generate AI names for leaderboards
const generateAINames = (): string[] => [
  "CardMaster_AI", "BluffKing_Bot", "AceHunter_AI", "PokerFace_Bot", "HighCard_AI",
  "WinStreak_Bot", "PowerPlay_AI", "CardShark_Bot", "Victory_AI", "TopDeck_Bot",
  "Strategic_AI", "ProCard_Bot", "Ultimate_AI", "Champion_Bot", "Legend_AI",
  "Elite_Bot", "Supreme_AI", "Master_Bot", "Grand_AI", "Apex_Bot",
  "Titan_AI", "Premier_Bot", "Royal_AI", "Divine_Bot", "Immortal_AI"
];

// Generate competitive AI opponents (Grand Champion level)
const generateCompetitiveAI = (gameMode: '1v1' | '2v2'): LeaderboardPlayer[] => {
  const names = generateAINames();
  const minMMR = 1200; // Grand Champion minimum
  const maxMMR = 2200;
  const personalities: ('aggressive' | 'conservative' | 'adaptive' | 'random')[] = 
    ['aggressive', 'conservative', 'adaptive', 'random'];
  
  return names.map((name, index) => ({
    id: `competitive-${gameMode}-${index}`,
    name: `${name}_${gameMode}`,
    mmr: Math.floor(Math.random() * (maxMMR - minMMR) + minMMR),
    isAI: true,
    gameMode,
    aiPersonality: personalities[index % personalities.length]
  })).sort((a, b) => (b.mmr || 0) - (a.mmr || 0)).slice(0, 25);
};

// Generate casual AI for stats leaderboard
const generateCasualAI = (): LeaderboardPlayer[] => {
  const names = generateAINames().slice(0, 50);
  const personalities: ('aggressive' | 'conservative' | 'adaptive' | 'random')[] = 
    ['aggressive', 'conservative', 'adaptive', 'random'];
  
  return names.map((name, index) => ({
    id: `casual-${index}`,
    name: `${name}_Casual`,
    totalWins: Math.floor(Math.random() * 1000) + 50,
    isAI: true,
    gameMode: (Math.random() > 0.5 ? '1v1' : '2v2') as '1v1' | '2v2',
    aiPersonality: personalities[index % personalities.length]
  })).sort((a, b) => (b.totalWins || 0) - (a.totalWins || 0));
};

export const useLeaderboardStore = create<LeaderboardState>((set, get) => ({
  statsLeaderboard: [],
  competitiveLeaderboard1v1: [],
  competitiveLeaderboard2v2: [],

  initializeLeaderboards: () => {
    // Try to load from localStorage first
    const savedStats = localStorage.getItem('highcard-stats-leaderboard');
    const savedComp1v1 = localStorage.getItem('highcard-competitive-1v1-leaderboard');
    const savedComp2v2 = localStorage.getItem('highcard-competitive-2v2-leaderboard');

    let statsLeaderboard: LeaderboardPlayer[];
    let competitiveLeaderboard1v1: LeaderboardPlayer[];
    let competitiveLeaderboard2v2: LeaderboardPlayer[];

    if (savedStats && savedComp1v1 && savedComp2v2) {
      // Load existing leaderboards
      statsLeaderboard = JSON.parse(savedStats);
      competitiveLeaderboard1v1 = JSON.parse(savedComp1v1);
      competitiveLeaderboard2v2 = JSON.parse(savedComp2v2);
    } else {
      // Generate new leaderboards
      statsLeaderboard = generateCasualAI();
      competitiveLeaderboard1v1 = generateCompetitiveAI('1v1');
      competitiveLeaderboard2v2 = generateCompetitiveAI('2v2');

      // Save to localStorage
      localStorage.setItem('highcard-stats-leaderboard', JSON.stringify(statsLeaderboard));
      localStorage.setItem('highcard-competitive-1v1-leaderboard', JSON.stringify(competitiveLeaderboard1v1));
      localStorage.setItem('highcard-competitive-2v2-leaderboard', JSON.stringify(competitiveLeaderboard2v2));
    }

    set({
      statsLeaderboard,
      competitiveLeaderboard1v1,
      competitiveLeaderboard2v2
    });
  },

  updatePlayerOnLeaderboards: (playerName, stats) => {
    set((state) => {
      // Update stats leaderboard
      let newStatsLeaderboard = [...state.statsLeaderboard];
      const existingPlayerIndex = newStatsLeaderboard.findIndex(p => p.name === playerName && !p.isAI);
      
      const playerTotalWins = stats.casualStats['1v1'].wins + stats.casualStats['2v2'].wins + 
                              stats.rankedStats['1v1'].wins + stats.rankedStats['2v2'].wins;

      if (existingPlayerIndex >= 0) {
        newStatsLeaderboard[existingPlayerIndex].totalWins = playerTotalWins;
      } else {
        newStatsLeaderboard.push({
          id: `player-${playerName}`,
          name: playerName,
          totalWins: playerTotalWins,
          isAI: false,
          gameMode: '1v1' // Default, doesn't matter for stats leaderboard
        });
      }
      
      newStatsLeaderboard = newStatsLeaderboard.sort((a, b) => (b.totalWins || 0) - (a.totalWins || 0));

      // Update competitive leaderboards if player is Grand Champion
      let newComp1v1 = [...state.competitiveLeaderboard1v1];
      let newComp2v2 = [...state.competitiveLeaderboard2v2];

      if (stats.rankedStats['1v1'].mmr >= 1200) {
        const existing1v1Index = newComp1v1.findIndex(p => p.name === playerName && !p.isAI);
        if (existing1v1Index >= 0) {
          newComp1v1[existing1v1Index].mmr = stats.rankedStats['1v1'].mmr;
        } else {
          newComp1v1.push({
            id: `player-1v1-${playerName}`,
            name: playerName,
            mmr: stats.rankedStats['1v1'].mmr,
            isAI: false,
            gameMode: '1v1'
          });
        }
        newComp1v1 = newComp1v1.sort((a, b) => (b.mmr || 0) - (a.mmr || 0));
      }

      if (stats.rankedStats['2v2'].mmr >= 1200) {
        const existing2v2Index = newComp2v2.findIndex(p => p.name === playerName && !p.isAI);
        if (existing2v2Index >= 0) {
          newComp2v2[existing2v2Index].mmr = stats.rankedStats['2v2'].mmr;
        } else {
          newComp2v2.push({
            id: `player-2v2-${playerName}`,
            name: playerName,
            mmr: stats.rankedStats['2v2'].mmr,
            isAI: false,
            gameMode: '2v2'
          });
        }
        newComp2v2 = newComp2v2.sort((a, b) => (b.mmr || 0) - (a.mmr || 0));
      }

      return {
        statsLeaderboard: newStatsLeaderboard,
        competitiveLeaderboard1v1: newComp1v1,
        competitiveLeaderboard2v2: newComp2v2
      };
    });
  },

  getOpponentByMMR: (playerMMR, gameMode) => {
    const { competitiveLeaderboard1v1, competitiveLeaderboard2v2 } = get();
    const leaderboard = gameMode === '1v1' ? competitiveLeaderboard1v1 : competitiveLeaderboard2v2;
    
    // If player is high enough MMR, find a close opponent from leaderboards
    if (playerMMR >= 1000) { // Champion+ can face leaderboard AI
      const suitableOpponents = leaderboard.filter(player => 
        player.isAI && Math.abs((player.mmr || 0) - playerMMR) <= 200
      );
      
      if (suitableOpponents.length > 0) {
        return suitableOpponents[Math.floor(Math.random() * suitableOpponents.length)];
      }
    }
    
    return null;
  }
}));