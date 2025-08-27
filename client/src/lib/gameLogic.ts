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
  'Grand Champion',
  'Card Legend'
];

export const DIVISIONS = ['I', 'II', 'III'];

export const RANK_THRESHOLDS = {
  'Bronze': { min: 0, max: 399 },
  'Silver': { min: 400, max: 599 },
  'Gold': { min: 600, max: 799 },
  'Platinum': { min: 800, max: 999 },
  'Diamond': { min: 1000, max: 1199 },
  'Champion': { min: 1200, max: 1399 },
  'Grand Champion': { min: 1400, max: 1599 },
  'Card Legend': { min: 1600, max: Infinity }
};


// Calculate rank and division from MMR
export const getRankFromMMR = (mmr: number): { rank: string; division: string | null } => {
  for (const [rank, threshold] of Object.entries(RANK_THRESHOLDS)) {
    if (mmr >= threshold.min && mmr <= threshold.max) {
      if (rank === 'Card Legend') {
        return { rank, division: null };
      }
      
      // Calculate division within the rank
      const rangeSize = threshold.max - threshold.min;
      const divisionSize = rangeSize / 3;
      const positionInRank = mmr - threshold.min;
      
      let divisionIndex;
      if (positionInRank < divisionSize) {
        divisionIndex = 0; // I (lowest)
      } else if (positionInRank < divisionSize * 2) {
        divisionIndex = 1; // II
      } else {
        divisionIndex = 2; // III (highest)
      }
      
      return { rank, division: DIVISIONS[divisionIndex] };
    }
  }
  
  return { rank: 'Bronze', division: 'I' };
};

// Calculate MMR change after a match using proper ELO formula
export const calculateMMRChange = (won: boolean, playerMMR: number, opponentMMR: number = playerMMR): number => {
  const K_FACTOR_MAX = 45;
  const K_FACTOR_MIN = 17;
  
  // Calculate K-factor based on player's MMR (higher MMR = smaller changes)
  let kFactor = K_FACTOR_MAX;
  if (playerMMR >= 1600) { // Card Legend
    kFactor = K_FACTOR_MIN;
  } else if (playerMMR >= 1200) { // Grand Champion
    kFactor = 17;
  } else if (playerMMR >= 1000) { // Champion
    kFactor = 14;
  } else if (playerMMR >= 800) { // Diamond
    kFactor = 16;
  } else if (playerMMR >= 600) { // Platinum
    kFactor = 20;
  } else if (playerMMR >= 400) { // Gold
    kFactor = 20;
  }
  
  // Calculate expected score using ELO formula
  const expectedScore = 1 / (1 + Math.pow(10, (opponentMMR - playerMMR) / 400));
  
  // Actual score (1 for win, 0 for loss)
  const actualScore = won ? 1 : 0;
  
  // Calculate MMR change
  const mmrChange = Math.round(kFactor * (actualScore - expectedScore));
  
  // Ensure minimum change of 1 point (to prevent stagnation)
  if (mmrChange === 0) {
    return won ? 1 : -1;
  }
  
  return mmrChange;
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
    "zippersman","xxkirtoxx1","togoz","MyWorld_21","JuicyJamz","qozz","JuiceWrldMoonlight","boopsma1","UnstoppableAnarchy","smollost43432X","Xx_MilkShake17Xx","vibeless19","x23","flwr","powf","sinless","mattyboy784","xkirt0","BigHeavy00","JpingMagz","easilymossedkid20","unknown_magz","284962G7","juli23_zae","J_Y3E","easilymossedkid19","uqz","poofusure","QTW1NN","circuIator","grandsontoldmetoplay","RoboStud22","GlobalWRA893","gaslightying","ii_cantsackii","ItsMeDooDoos","Bxx_Duck","XxFrench_Fr1ezX","Revruics","rxd_deer","lqzt_sou1z","arrowstops","HeartlessTierra","thefabisasoXD","ii_cantrunnerii","roblox_user_78045342","unlocked1_2","jalenHurts_RB7","QzccMustDestroy","globalseller","RisingPhoenix","snagz","umppz2",
    "LilTycoon94","EpicGamer_072","xXBuildBroXx","AquaDude33","FlamezKnight","CookieNomNom","PixelSurge","HyperNova_99","TacoSlayer42","NinjaSocks","DankDestroyer","SlippyPenguin7","ToxicDriftX","CoolBanana_05","WolfStorm88","Jumpman_14","EliteSniper_RBLX","KrazyKoala123","CodeRedYT","MysticSlayer", "niko", "shadowfox91", "lexa_belle", "icebreaker7", "mikey.exe",
                            "serotonin.exe", "quietstorm", "eliott_", "kevn", "darko777",
                            "nova_prime", "jakefromstate", "finnski", "yukinochan", "draycoz",
                            "t0mmygun", "itsjustben", "koalatee", "zypherion", "oatsnbeans",
                            "noahb_", "ghostbyte", "sugarc0de", "tristan.x", "kyralight",
                            "sleeplessjoe", "mechamike", "flickzone", "toastymars", "caffeinex",
                            "lunarshift", "chromafox", "bleachbunni", "hextasyy", "neonharbor",
                            "viktorwave", "jackal.v2", "zeroiq_", "th3zookeeper", "halcyoncore",
                            "creepdaddy", "l33tcoder", "dyllbot", "gloomydan", "syrup.exe",
                            "vanta_rider", "ronintheory", "nocturnex", "rowboatjim", "yeehawdaddy",
                            "zippersman","xxkirtoxx1","togoz","MyWorld_21","JuicyJamz","qozz","JuiceWrldMoonlight","boopsma1","UnstoppableAnarchy","smollost43432X","Xx_MilkShake17Xx","vibeless19","x23","flwr","powf","sinless","mattyboy784","xkirt0","BigHeavy00","JpingMagz","easilymossedkid20","unknown_magz","284962G7","juli23_zae","J_Y3E","easilymossedkid19","uqz","poofusure","QTW1NN","circuIator","grandsontoldmetoplay","RoboStud22","GlobalWRA893","gaslightying","ii_cantsackii","ItsMeDooDoos","Bxx_Duck","XxFrench_Fr1ezX","Revruics","rxd_deer","lqzt_sou1z","arrowstops","HeartlessTierra","thefabisasoXD","ii_cantrunnerii","roblox_user_78045342","unlocked1_2","jalenHurts_RB7","QzccMustDestroy","globalseller","RisingPhoenix","snagz","umppz2",
                            "LilTycoon94","EpicGamer_072","xXBuildBroXx","AquaDude33","FlamezKnight","CookieNomNom","PixelSurge","HyperNova_99","TacoSlayer42","NinjaSocks","DankDestroyer","SlippyPenguin7","ToxicDriftX","CoolBanana_05","WolfStorm88","Jumpman_14","EliteSniper_RBLX","KrazyKoala123","CodeRedYT","MysticSlayer"
  ];
  
  const highRankedNames = [
    "zippersman","xxkirtoxx1","togoz","MyWorld_21","JuicyJamz","qozz","JuiceWrldMoonlight","boopsma1","UnstoppableAnarchy","smollost43432X","Xx_MilkShake17Xx","vibeless19","x23","flwr","powf","sinless","mattyboy784","xkirt0","BigHeavy00","JpingMagz","easilymossedkid20","unknown_magz","284962G7","juli23_zae","J_Y3E","easilymossedkid19","uqz","poofusure","QTW1NN","circuIator","grandsontoldmetoplay","RoboStud22","GlobalWRA893","gaslightying","ii_cantsackii","ItsMeDooDoos","Bxx_Duck","XxFrench_Fr1ezX","Revruics","rxd_deer","lqzt_sou1z","arrowstops","HeartlessTierra","thefabisasoXD","ii_cantrunnerii","roblox_user_78045342","unlocked1_2","jalenHurts_RB7","QzccMustDestroy","globalseller","RisingPhoenix","snagz","umppz2",
      "LilTycoon94","EpicGamer_072","xXBuildBroXx","AquaDude33","FlamezKnight","CookieNomNom","PixelSurge","HyperNova_99","TacoSlayer42","NinjaSocks","DankDestroyer","SlippyPenguin7","ToxicDriftX","CoolBanana_05","WolfStorm88","Jumpman_14","EliteSniper_RBLX","KrazyKoala123","CodeRedYT","MysticSlayer", "niko", "shadowfox91", "lexa_belle", "icebreaker7", "mikey.exe",
                              "serotonin.exe", "quietstorm", "eliott_", "kevn", "darko777",
                              "nova_prime", "jakefromstate", "finnski", "yukinochan", "draycoz",
                              "t0mmygun", "itsjustben", "koalatee", "zypherion", "oatsnbeans",
                              "noahb_", "ghostbyte", "sugarc0de", "tristan.x", "kyralight",
                              "sleeplessjoe", "mechamike", "flickzone", "toastymars", "caffeinex",
                              "lunarshift", "chromafox", "bleachbunni", "hextasyy", "neonharbor",
                              "viktorwave", "jackal.v2", "zeroiq_", "th3zookeeper", "halcyoncore",
                              "creepdaddy", "l33tcoder", "dyllbot", "gloomydan", "syrup.exe",
                              "vanta_rider", "ronintheory", "nocturnex", "rowboatjim", "yeehawdaddy",
                              "zippersman","xxkirtoxx1","togoz","MyWorld_21","JuicyJamz","qozz","JuiceWrldMoonlight","boopsma1","UnstoppableAnarchy","smollost43432X","Xx_MilkShake17Xx","vibeless19","x23","flwr","powf","sinless","mattyboy784","xkirt0","BigHeavy00","JpingMagz","easilymossedkid20","unknown_magz","284962G7","juli23_zae","J_Y3E","easilymossedkid19","uqz","poofusure","QTW1NN","circuIator","grandsontoldmetoplay","RoboStud22","GlobalWRA893","gaslightying","ii_cantsackii","ItsMeDooDoos","Bxx_Duck","XxFrench_Fr1ezX","Revruics","rxd_deer","lqzt_sou1z","arrowstops","HeartlessTierra","thefabisasoXD","ii_cantrunnerii","roblox_user_78045342","unlocked1_2","jalenHurts_RB7","QzccMustDestroy","globalseller","RisingPhoenix","snagz","umppz2",
                              "LilTycoon94","EpicGamer_072","xXBuildBroXx","AquaDude33","FlamezKnight","CookieNomNom","PixelSurge","HyperNova_99","TacoSlayer42","NinjaSocks","DankDestroyer","SlippyPenguin7","ToxicDriftX","CoolBanana_05","WolfStorm88","Jumpman_14","EliteSniper_RBLX","KrazyKoala123","CodeRedYT","MysticSlayer"
  ];
  
  const names = isHighRanked ? [...regularNames, ...highRankedNames] : regularNames;
  return names[Math.floor(Math.random() * names.length)];
};
