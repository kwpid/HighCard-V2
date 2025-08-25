// XP and Leveling System

export interface XPProgress {
  currentXP: number;
  xpToNextLevel: number;
  progressPercentage: number;
  level: number;
}

// Calculate XP required for next level
export const calculateXPForLevel = (level: number): number => {
  if (level === 1) return 10;
  return Math.floor(10 * Math.pow(1.25, level - 1));
};

// Calculate total XP needed to reach a specific level
export const calculateTotalXPForLevel = (level: number): number => {
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += calculateXPForLevel(i);
  }
  return totalXP;
};

// Calculate XP progress for current level
export const calculateXPProgress = (currentXP: number, currentLevel: number): XPProgress => {
  const xpForCurrentLevel = calculateXPForLevel(currentLevel);
  const totalXPForCurrentLevel = calculateTotalXPForLevel(currentLevel);
  const xpInCurrentLevel = currentXP - totalXPForCurrentLevel;
  const progressPercentage = Math.min(100, (xpInCurrentLevel / xpForCurrentLevel) * 100);
  
  return {
    currentXP: xpInCurrentLevel,
    xpToNextLevel: xpForCurrentLevel,
    progressPercentage,
    level: currentLevel
  };
};

// Calculate XP gained from a game
export const calculateXPGain = (won: boolean, gameMode: 'casual' | 'ranked', gameType: '1v1' | '2v2'): number => {
  let baseXP = 5; // Base XP for playing
  
  if (won) {
    baseXP += 15; // Bonus for winning
  }
  
  // Bonus for ranked games
  if (gameMode === 'ranked') {
    baseXP += 5;
  }
  
  // Bonus for team games (more complex)
  if (gameType === '2v2') {
    baseXP += 3;
  }
  
  return baseXP;
};

// Check if player leveled up and return new level
export const checkLevelUp = (currentXP: number, currentLevel: number): number | null => {
  const totalXPForNextLevel = calculateTotalXPForLevel(currentLevel + 1);
  
  if (currentXP >= totalXPForNextLevel) {
    return currentLevel + 1;
  }
  
  return null;
};
