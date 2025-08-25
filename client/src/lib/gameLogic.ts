// Game logic and utility functions

export interface GameCard {
  id: string;
  value: number;
  isPowerUp: boolean;
  used: boolean;
}

export interface Player {
  name: string;
  cards: GameCard[];
  score: number;
  isAI: boolean;
  team?: number;
}

// Rank system constants
export const RANKS = [
  'Bronze',
  'Silver', 
  'Gold',
  'Platinum',
  'Diamond',
  'Champion',
  'Grand Champion'
];

export const DIVISIONS = ['III', 'II', 'I'];

export const RANK_THRESHOLDS = {
  'Bronze': { min: 0, max: 199 },
  'Silver': { min: 200, max: 399 },
  'Gold': { min: 400, max: 599 },
  'Platinum': { min: 600, max: 799 },
  'Diamond': { min: 800, max: 999 },
  'Champion': { min: 1000, max: 1199 },
  'Grand Champion': { min: 1200, max: Infinity }
};

// Calculate rank and division from MMR
export const getRankFromMMR = (mmr: number): { rank: string; division: string | null } => {
  for (const [rank, threshold] of Object.entries(RANK_THRESHOLDS)) {
    if (mmr >= threshold.min && mmr <= threshold.max) {
      if (rank === 'Grand Champion') {
        return { rank, division: null };
      }
      
      // Calculate division within the rank
      const rangeSize = threshold.max - threshold.min;
      const divisionSize = rangeSize / 3;
      const positionInRank = mmr - threshold.min;
      
      let divisionIndex;
      if (positionInRank < divisionSize) {
        divisionIndex = 0; // III
      } else if (positionInRank < divisionSize * 2) {
        divisionIndex = 1; // II
      } else {
        divisionIndex = 2; // I
      }
      
      return { rank, division: DIVISIONS[divisionIndex] };
    }
  }
  
  return { rank: 'Bronze', division: 'III' };
};

// Calculate MMR change after a match
export const calculateMMRChange = (won: boolean, currentMMR: number): number => {
  const baseChange = 25;
  let change = baseChange;
  
  // Larger changes for lower MMR players
  if (currentMMR < 200) {
    change = 35;
  } else if (currentMMR < 400) {
    change = 30;
  }
  
  // Smaller changes for very high MMR players
  if (currentMMR > 1000) {
    change = 15;
  } else if (currentMMR > 800) {
    change = 20;
  }
  
  return won ? change : -Math.floor(change * 0.8);
};

// Generate random cards for a player
export const generatePlayerCards = (): GameCard[] => {
  const cards: GameCard[] = [];
  
  // Generate 8 regular cards (values 2-14, where 14 = Ace)
  const usedValues = new Set<number>();
  while (cards.length < 8) {
    const value = Math.floor(Math.random() * 13) + 2;
    if (!usedValues.has(value)) {
      usedValues.add(value);
      cards.push({
        id: `regular-${cards.length}`,
        value,
        isPowerUp: false,
        used: false
      });
    }
  }
  
  // Add 2 power-up cards (values 16-18)
  cards.push({
    id: 'power-1',
    value: Math.floor(Math.random() * 3) + 16,
    isPowerUp: true,
    used: false
  });
  cards.push({
    id: 'power-2',
    value: Math.floor(Math.random() * 3) + 16,
    isPowerUp: true,
    used: false
  });
  
  return cards.sort((a, b) => b.value - a.value);
};

// Simulate a complete game between players
export const playGame = (players: Player[], gameType: '1v1' | '2v2'): Player[] => {
  const gameResults = [...players];
  
  for (let round = 1; round <= 10; round++) {
    // Each player plays their highest available card (simple AI)
    const roundCards: { [playerId: number]: GameCard } = {};
    
    gameResults.forEach((player, index) => {
      const availableCards = player.cards.filter(c => !c.used);
      if (availableCards.length > 0) {
        // Simple AI: play highest card
        const cardToPlay = availableCards[0];
        roundCards[index] = cardToPlay;
        
        // Mark card as used
        const cardIndex = player.cards.findIndex(c => c.id === cardToPlay.id);
        if (cardIndex !== -1) {
          player.cards[cardIndex].used = true;
        }
      }
    });
    
    // Determine round winner and update scores
    if (gameType === '1v1') {
      const p1Value = roundCards[0]?.value || 0;
      const p2Value = roundCards[1]?.value || 0;
      
      if (p1Value > p2Value) {
        gameResults[0].score += 2;
        gameResults[1].score -= 1;
      } else if (p2Value > p1Value) {
        gameResults[1].score += 2;
        gameResults[0].score -= 1;
      }
      // Tie = no score change
    } else {
      // 2v2 team logic
      const team1Total = (roundCards[0]?.value || 0) + (roundCards[1]?.value || 0);
      const team2Total = (roundCards[2]?.value || 0) + (roundCards[3]?.value || 0);
      
      if (team1Total > team2Total) {
        gameResults[0].score += 2;
        gameResults[1].score += 2;
        gameResults[2].score -= 1;
        gameResults[3].score -= 1;
      } else if (team2Total > team1Total) {
        gameResults[2].score += 2;
        gameResults[3].score += 2;
        gameResults[0].score -= 1;
        gameResults[1].score -= 1;
      }
      // Tie = no score change
    }
  }
  
  return gameResults;
};

// Get display value for cards
export const getCardValueDisplay = (value: number): string => {
  if (value >= 16) return 'PWR';
  if (value === 14) return 'A';
  if (value === 13) return 'K';
  if (value === 12) return 'Q';
  if (value === 11) return 'J';
  return value.toString();
};

// Generate AI opponent name
export const generateAIName = (isHighRanked = false): string => {
  const regularNames = [
    'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage',
    'Phoenix', 'River', 'Skylar', 'Rowan', 'Ember', 'Nova', 'Zephyr', 'Orion',
    'Blake', 'Cameron', 'Drew', 'Finley', 'Harper', 'Hayden', 'Jamie', 'Kai'
  ];
  
  const highRankedNames = [
    'Phantom', 'Shadow', 'Blaze', 'Storm', 'Viper', 'Titan', 'Nexus', 'Apex',
    'Eclipse', 'Quantum', 'Vertex', 'Matrix', 'Cipher', 'Vector', 'Prism', 'Flux',
    'Zenith', 'Crimson', 'Raven', 'Frost', 'Thunder', 'Void', 'Neon', 'Chrome'
  ];
  
  const names = isHighRanked ? [...regularNames, ...highRankedNames] : regularNames;
  return names[Math.floor(Math.random() * names.length)];
};
