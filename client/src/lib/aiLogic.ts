// AI logic for different difficulty levels and playing styles

import { GameCard, Player } from './gameLogic';

export type AIPersonality = 'aggressive' | 'conservative' | 'adaptive' | 'random';

export interface AIOpponent {
  name: string;
  personality: AIPersonality;
  difficulty: number; // 1-10 scale
  mmr?: number;
  isLeaderboardAI?: boolean;
}

export interface AIConfig {
  personality: AIPersonality;
  difficulty: number; // 1-10 scale
  powerUpThreshold: number; // Round threshold for using power-ups
  bluffChance: number; // Chance to play suboptimally to confuse opponent
}

// Generate AI opponent with leaderboard integration
export const generateAIOpponent = (playerMMR: number, gameMode: '1v1' | '2v2'): AIOpponent => {
  // Try to get leaderboard opponent first (if player is high MMR)
  if (typeof window !== 'undefined') {
    try {
      const { getOpponentByMMR } = require('./stores/useLeaderboardStore').useLeaderboardStore.getState();
      const leaderboardOpponent = getOpponentByMMR(playerMMR, gameMode);
      
      if (leaderboardOpponent) {
        return {
          name: leaderboardOpponent.name,
          personality: leaderboardOpponent.aiPersonality || 'adaptive',
          difficulty: Math.min(10, Math.floor((leaderboardOpponent.mmr || 1200) / 120)),
          mmr: leaderboardOpponent.mmr,
          isLeaderboardAI: true
        };
      }
    } catch (error) {
      console.error('Error getting leaderboard opponent:', error);
    }
  }
  
  // Generate regular AI opponent
  const personalities: AIPersonality[] = ['aggressive', 'conservative', 'adaptive', 'random'];
  const personality = personalities[Math.floor(Math.random() * personalities.length)];
  const difficulty = Math.max(1, Math.min(10, Math.floor(playerMMR / 100) + Math.floor(Math.random() * 3) - 1));
  const aiMMR = playerMMR + Math.floor(Math.random() * 200) - 100; // ±100 MMR
  
  const aiNames = [
    "CardBot", "ChampAI", "ProPlayer", "EliteBot", "SkillfulAI", 
    "MasterBot", "TacticalAI", "StrategicBot", "CompetitiveAI", "VictoryBot"
  ];
  
  return {
    name: aiNames[Math.floor(Math.random() * aiNames.length)],
    personality,
    difficulty,
    mmr: Math.max(0, aiMMR),
    isLeaderboardAI: false
  };
};

// Generate AI configuration based on MMR or difficulty
export const generateAIConfig = (difficulty: number = 5, mmr: number = 400): AIConfig => {
  const personalities: AIPersonality[] = ['aggressive', 'conservative', 'adaptive', 'random'];
  const personality = personalities[Math.floor(Math.random() * personalities.length)];
  
  // Higher MMR opponents get better configurations
  const adjustedDifficulty = mmr > 800 ? Math.min(difficulty + 2, 10) : difficulty;
  
  return {
    personality,
    difficulty: adjustedDifficulty,
    powerUpThreshold: personality === 'aggressive' ? 5 : 7,
    bluffChance: Math.max(0, (10 - adjustedDifficulty) * 0.05), // Lower difficulty = more random plays
  };
};

// AI decision making for card selection
export const selectAICard = (
  availableCards: GameCard[],
  config: AIConfig,
  currentRound: number,
  playerScore: number,
  opponentScore: number,
  gameType: '1v1' | '2v2'
): GameCard => {
  
  // Apply bluff chance for lower difficulty AIs
  if (Math.random() < config.bluffChance) {
    return availableCards[Math.floor(Math.random() * availableCards.length)];
  }

  // Separate power-ups from regular cards
  const powerUps = availableCards.filter(c => c.isPowerUp);
  const regularCards = availableCards.filter(c => !c.isPowerUp);
  
  // Decide whether to use a power-up
  const shouldUsePowerUp = decidePowerUpUsage(
    config,
    currentRound,
    playerScore,
    opponentScore,
    powerUps.length,
    regularCards.length
  );

  if (shouldUsePowerUp && powerUps.length > 0) {
    return selectBestPowerUp(powerUps, config);
  }

  return selectRegularCard(regularCards, config, currentRound);
};

// Determine if AI should use a power-up this round
const decidePowerUpUsage = (
  config: AIConfig,
  currentRound: number,
  playerScore: number,
  opponentScore: number,
  powerUpCount: number,
  regularCardCount: number
): boolean => {
  
  // No power-ups available
  if (powerUpCount === 0) return false;
  
  // Force power-up usage in final rounds
  if (currentRound >= 9 && powerUpCount > 0) return true;
  if (currentRound === 10) return true;
  
  // Personality-based decisions
  switch (config.personality) {
    case 'aggressive':
      // Use power-ups early and when behind
      return currentRound >= config.powerUpThreshold || 
             playerScore < opponentScore - 3;
    
    case 'conservative':
      // Save power-ups for crucial moments
      return currentRound >= config.powerUpThreshold + 2 && 
             (playerScore <= opponentScore || currentRound >= 8);
    
    case 'adaptive':
      // Use based on game state
      const scoreDiff = playerScore - opponentScore;
      if (scoreDiff <= -4) return true; // Desperate situation
      if (scoreDiff >= 4 && currentRound >= 8) return true; // Secure the win
      return currentRound >= config.powerUpThreshold + 1;
    
    case 'random':
      return Math.random() < 0.3; // 30% chance each round
    
    default:
      return currentRound >= config.powerUpThreshold;
  }
};

// Select the best power-up to play
const selectBestPowerUp = (powerUps: GameCard[], config: AIConfig): GameCard => {
  // Generally play the highest power-up
  powerUps.sort((a, b) => b.value - a.value);
  
  if (config.personality === 'conservative' && powerUps.length > 1) {
    // Conservative AI might save the highest power-up
    return powerUps[1] || powerUps[0];
  }
  
  return powerUps[0];
};

// Select regular card based on strategy
const selectRegularCard = (regularCards: GameCard[], config: AIConfig, currentRound: number): GameCard => {
  if (regularCards.length === 0) {
    // This shouldn't happen, but return the first available card as fallback
    return regularCards[0];
  }

  // Sort cards by value (descending)
  regularCards.sort((a, b) => b.value - a.value);
  
  switch (config.personality) {
    case 'aggressive':
      // Always play high cards early
      if (currentRound <= 3) {
        return regularCards[0]; // Highest card
      }
      // Play medium-high cards mid-game
      const aggressiveIndex = Math.min(Math.floor(regularCards.length * 0.3), regularCards.length - 1);
      return regularCards[aggressiveIndex];
    
    case 'conservative':
      // Save high cards for later
      if (currentRound <= 5 && regularCards.length > 3) {
        const conservativeIndex = Math.min(Math.floor(regularCards.length * 0.6), regularCards.length - 1);
        return regularCards[conservativeIndex];
      }
      // Play higher cards in later rounds
      const lateGameIndex = Math.min(Math.floor(regularCards.length * 0.2), regularCards.length - 1);
      return regularCards[lateGameIndex];
    
    case 'adaptive':
      // Balanced approach based on round
      let adaptiveIndex;
      if (currentRound <= 3) {
        adaptiveIndex = Math.min(Math.floor(regularCards.length * 0.4), regularCards.length - 1);
      } else if (currentRound <= 7) {
        adaptiveIndex = Math.min(Math.floor(regularCards.length * 0.3), regularCards.length - 1);
      } else {
        adaptiveIndex = Math.min(Math.floor(regularCards.length * 0.1), regularCards.length - 1);
      }
      return regularCards[adaptiveIndex];
    
    case 'random':
      return regularCards[Math.floor(Math.random() * regularCards.length)];
    
    default:
      // Default to balanced play
      const defaultIndex = Math.min(Math.floor(regularCards.length * 0.3), regularCards.length - 1);
      return regularCards[defaultIndex];
  }
};

// Generate AI behavior description for UI
export const getAIDescription = (config: AIConfig): string => {
  const descriptions = {
    aggressive: "Plays high-value cards early and takes risks",
    conservative: "Saves powerful cards for crucial moments",
    adaptive: "Adjusts strategy based on game situation",
    random: "Unpredictable playing style"
  };
  
  return descriptions[config.personality];
};

// Calculate AI "thinking" time for realism
export const calculateAIThinkingTime = (config: AIConfig, availableCards: GameCard[]): number => {
  const baseTime = 1000; // 1 second base
  const difficultyMultiplier = config.difficulty * 0.1; // Higher difficulty = longer thinking
  const cardCountMultiplier = availableCards.length * 0.05; // More cards = more thinking
  
  const totalTime = baseTime + (difficultyMultiplier * 1000) + (cardCountMultiplier * 1000);
  
  // Add some randomness ±300ms
  const randomness = (Math.random() - 0.5) * 600;
  
  return Math.max(500, Math.min(totalTime + randomness, 3000)); // Between 0.5-3 seconds
};
