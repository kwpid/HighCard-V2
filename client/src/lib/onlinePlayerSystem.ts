// Online Player Count System - Simulates realistic daily traffic patterns
export interface OnlinePlayerData {
  totalOnline: number;
  casualPlayers: number;
  rankedPlayers: number;
  byGameType: {
    '1v1': number;
    '2v2': number;
  };
}

// Simulate realistic daily online player patterns
export const getCurrentOnlinePlayerCount = (): OnlinePlayerData => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Base player count (minimum 30, maximum 300)
  let baseCount = 30;
  
  // Peak hours: 6-9 PM (18-21) and weekends have higher traffic
  const isPeakHours = hour >= 18 && hour <= 21;
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isAfternoon = hour >= 12 && hour <= 17;
  const isMorning = hour >= 7 && hour <= 11;
  const isLateNight = hour >= 22 || hour <= 6;
  
  // Calculate multipliers
  if (isPeakHours) {
    baseCount += isWeekend ? 200 : 150; // Peak weekend vs weekday
  } else if (isAfternoon) {
    baseCount += isWeekend ? 120 : 80;
  } else if (isMorning) {
    baseCount += 50;
  } else if (isLateNight) {
    baseCount += 20; // Late night has fewer players
  }
  
  // Add some randomness to make it feel more realistic
  const randomVariation = Math.floor(Math.random() * 40) - 20; // ±20 players
  const totalOnline = Math.max(30, Math.min(300, baseCount + randomVariation));
  
  // Distribute players between casual and ranked (60% casual, 40% ranked)
  const casualPlayers = Math.floor(totalOnline * 0.6);
  const rankedPlayers = totalOnline - casualPlayers;
  
  // Distribute between 1v1 and 2v2 (70% prefer 1v1, 30% prefer 2v2)
  const onev1Players = Math.floor(totalOnline * 0.7);
  const twov2Players = totalOnline - onev1Players;
  
  return {
    totalOnline,
    casualPlayers,
    rankedPlayers,
    byGameType: {
      '1v1': onev1Players,
      '2v2': twov2Players
    }
  };
};

// Calculate dynamic queue time based on online players and MMR
export const calculateDynamicQueueTime = (
  gameMode: 'casual' | 'ranked',
  gameType: '1v1' | '2v2',
  playerMMR: number
): number => {
  const onlineData = getCurrentOnlinePlayerCount();
  
  // Get relevant player pool
  const relevantPool = gameMode === 'casual' ? onlineData.casualPlayers : onlineData.rankedPlayers;
  const gameTypePool = onlineData.byGameType[gameType];
  
  // Base time calculation
  let baseTime = 10; // Start with 10 seconds base
  
  // Player pool impact: more players = shorter wait times
  if (relevantPool > 200) {
    baseTime -= 6; // Lots of players online
  } else if (relevantPool > 100) {
    baseTime -= 3; // Decent amount online
  } else if (relevantPool < 50) {
    baseTime += 8; // Few players online
  }
  
  // Game type impact: 1v1 is more popular, so shorter wait
  if (gameType === '2v2') {
    baseTime += 5; // 2v2 has smaller pool
  }
  
  // MMR impact for ranked games: higher MMR = longer wait
  if (gameMode === 'ranked') {
    const mmrMultiplier = Math.floor(playerMMR / 200); // Every 200 MMR adds time
    baseTime += mmrMultiplier * 3;
    
    // Card Legend and Grand Champion players wait longer due to small pool
    if (playerMMR >= 1400) { // Grand Champion+
      baseTime += 15;
    } else if (playerMMR >= 1200) { // Champion
      baseTime += 8;
    }
  }
  
  // Minimum 2 seconds, maximum 180 seconds (3 minutes)
  return Math.max(2, Math.min(180, baseTime));
};

// Format time for display (mm:ss or just ss)
export const formatQueueTime = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds.toString().padStart(2, '0')}s`;
};