import { useState, useEffect } from "react";
import { useGameStore } from "../lib/stores/useGameStore";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { playGame, generateAIName, calculateMMRChange, getRankFromMMR } from "../lib/gameLogic";
import { calculateXPGain } from "../lib/xpSystem";
import Card from "./Card";
import XPGainDisplay from "./XPGainDisplay";
import { ArrowLeft, Crown, Zap, Star } from "lucide-react";

interface GameCard {
  id: string;
  value: number;
  isPowerUp: boolean;
  used: boolean;
}

interface Player {
  name: string;
  cards: GameCard[];
  score: number;
  isAI: boolean;
  team?: number;
  mmr?: number; // Added for AI MMR
  titleId?: string | null;
}

const GameBoard = () => {
  const { gameMode, gameType, setCurrentScreen } = useGameStore();
  const { updateStats, playerStats, getXPProgress, currentSeason } = usePlayerStore() as any;
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [roundCards, setRoundCards] = useState<{[playerId: string]: GameCard}>({});
  const [roundResult, setRoundResult] = useState<string | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showXPGain, setShowXPGain] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [previousXPProgress, setPreviousXPProgress] = useState(getXPProgress());

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newPlayers: Player[] = [];
    
    if (gameType === '1v1') {
      newPlayers.push({
        name: 'You',
        cards: generateCards(),
        score: 0,
        isAI: false,
        titleId: playerStats.equippedTitleId || null
      });
      const ai1MMR = gameMode === 'ranked' ? Math.max(0, playerStats.rankedStats[gameType].mmr + Math.floor(Math.random() * 200) - 100) : undefined;
      newPlayers.push({
        name: generateAIName(),
        cards: generateCards(),
        score: 0,
        isAI: true,
        mmr: ai1MMR,
        titleId: getRandomAITitleId(ai1MMR)
      });
    } else { // 2v2
      newPlayers.push({
        name: 'You',
        cards: generateCards(),
        score: 0,
        isAI: false,
        team: 1,
        titleId: playerStats.equippedTitleId || null
      });
      const allyMMR = gameMode === 'ranked' ? Math.max(0, playerStats.rankedStats[gameType].mmr + Math.floor(Math.random() * 200) - 100) : undefined;
      newPlayers.push({
        name: generateAIName(),
        cards: generateCards(),
        score: 0,
        isAI: true,
        team: 1,
        mmr: allyMMR,
        titleId: getRandomAITitleId(allyMMR)
      });
      const enemy1MMR = gameMode === 'ranked' ? Math.max(0, playerStats.rankedStats[gameType].mmr + Math.floor(Math.random() * 200) - 100) : undefined;
      newPlayers.push({
        name: generateAIName(),
        cards: generateCards(),
        score: 0,
        isAI: true,
        team: 2,
        mmr: enemy1MMR,
        titleId: getRandomAITitleId(enemy1MMR)
      });
      const enemy2MMR = gameMode === 'ranked' ? Math.max(0, playerStats.rankedStats[gameType].mmr + Math.floor(Math.random() * 200) - 100) : undefined;
      newPlayers.push({
        name: generateAIName(),
        cards: generateCards(),
        score: 0,
        isAI: true,
        team: 2,
        mmr: enemy2MMR,
        titleId: getRandomAITitleId(enemy2MMR)
      });
    }
    
    setPlayers(newPlayers);
  };

  const getRandomAITitleId = (mmr?: number): string | null => {
    // Do not assign titles during Pre-Season (season 0) or for casual
    if (!mmr || gameMode !== 'ranked' || currentSeason === 0) return null;
    const chance = 0.7; // high chance to show for ranked AIs
    if (Math.random() > chance) return null;
    const { rank } = getRankFromMMR(mmr);
    switch (rank) {
      case 'Card Legend': return 'ai_rank_clicker';
      case 'Grand Champion': return 'ai_rank_gc';
      case 'Champion': return 'ai_rank_champion';
      case 'Diamond': return 'ai_rank_diamond';
      case 'Platinum': return 'ai_rank_platinum';
      case 'Gold': return 'ai_rank_gold';
      case 'Silver': return 'ai_rank_silver';
      case 'Bronze':
      default:
        return 'ai_rank_bronze';
    }
  };

  const chooseAICard = (availableCards: GameCard[], mmr?: number): GameCard => {
    const pool = availableCards;
    if (pool.length === 0) return players[1].cards.find(c => !c.used) as GameCard;
    const sorted = [...pool].sort((a, b) => b.value - a.value);
    const rand = (arr: GameCard[]) => arr[Math.floor(Math.random() * arr.length)];
    const tier = mmr ?? 450;
    if (tier >= 1600) {
      // Card Legend: almost always play best
      return Math.random() < 0.95 ? sorted[0] : rand(sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.2))));
    } else if (tier >= 1200) {
      // GC: almost always play best
      return Math.random() < 0.9 ? sorted[0] : rand(sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.3))));
    } else if (tier >= 1000) {
      // Champion
      return Math.random() < 0.8 ? sorted[0] : rand(sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.4))));
    } else if (tier >= 800) {
      // Diamond
      return Math.random() < 0.7 ? sorted[0] : rand(sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.5))));
    } else if (tier >= 600) {
      // Platinum
      return Math.random() < 0.6 ? sorted[0] : rand(sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.6))));
    } else if (tier >= 400) {
      // Gold
      return Math.random() < 0.5 ? sorted[0] : rand(sorted);
    } else {
      // Bronze/Silver: mostly random
      return rand(sorted);
    }
  };

  const generateCards = (): GameCard[] => {
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

  const generateAIName = (): string => {
    const regularNames = [
      'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage',
      'Phoenix', 'River', 'Skylar', 'Rowan', 'Ember', 'Nova', 'Zephyr', 'Orion'
    ];
    const highRankedNames = [
      'Phantom', 'Shadow', 'Blaze', 'Storm', 'Viper', 'Titan', 'Nexus', 'Apex',
      'Eclipse', 'Quantum', 'Vertex', 'Matrix', 'Cipher', 'Vector', 'Prism', 'Flux'
    ];
    
    const names = gameMode === 'ranked' ? [...regularNames, ...highRankedNames] : regularNames;
    return names[Math.floor(Math.random() * names.length)];
  };

  const getCardValueDisplay = (value: number): string => {
    if (value >= 16) return 'PWR';
    if (value === 14) return 'A';
    if (value === 13) return 'K';
    if (value === 12) return 'Q';
    if (value === 11) return 'J';
    return value.toString();
  };

  const renderTitle = (titleId?: string | null) => {
    if (!titleId) return null;
    const { element } = getTitleDisplay(titleId);
    return (
      <div className="text-xs mb-2">
        {element}
      </div>
    );
  };

  const getTitleDisplay = (titleId: string): { element: JSX.Element } => {
    // Map known AI titles and player-owned titles to styled spans
    const map: Record<string, { text: string; className: string }> = {
      'title_rookie': { text: 'Rookie', className: 'text-gray-200' },
      'title_gamer': { text: 'GAMER', className: 'text-white' },
      // AI pre-season rank labels (not rewards)
      'ai_rank_bronze': { text: 'PRE-SEASON BRONZE', className: 'text-orange-400' },
      'ai_rank_silver': { text: 'PRE-SEASON SILVER', className: 'text-gray-200' },
      'ai_rank_gold': { text: 'PRE-SEASON GOLD', className: 'text-yellow-400' },
      'ai_rank_platinum': { text: 'PRE-SEASON PLATINUM', className: 'text-blue-300' },
      'ai_rank_diamond': { text: 'PRE-SEASON DIAMOND', className: 'text-cyan-300' },
      'ai_rank_champion': { text: 'PRE-SEASON CHAMPION', className: 'text-purple-300' },
      'ai_rank_gc': { text: 'PRE-SEASON GRAND CHAMPION', className: 'text-pink-300' },
      'ai_rank_clicker': { text: 'PRE-SEASON CLICKER LEGEND', className: 'text-white' },
    };
    const info = map[titleId] || { text: titleId, className: 'text-gray-200' };
    return { element: (<span className={`${info.className}`}>{info.text}</span>) };
  };

  const handleCardSelect = (cardId: string) => {
    if (isProcessing || gameEnded) return;
    
    const playerCards = players.find(p => !p.isAI)?.cards || [];
    const card = playerCards.find(c => c.id === cardId);
    
    if (card && !card.used) {
      setSelectedCard(cardId);
    }
  };

  const playRound = async () => {
    if (!selectedCard || isProcessing) return;
    
    setIsProcessing(true);
    
    // Get player's selected card
    const playerCard = players[0].cards.find(c => c.id === selectedCard);
    if (!playerCard) return;
    
    // AI makes decisions
    const newRoundCards: {[playerId: string]: GameCard} = {};
    newRoundCards['0'] = playerCard;
    
    for (let i = 1; i < players.length; i++) {
      const availableCards = players[i].cards.filter(c => !c.used);
      const aiChoice = chooseAICard(availableCards, players[i].mmr);
      newRoundCards[i.toString()] = aiChoice;
    }
    
    setRoundCards(newRoundCards);
    
    // Determine round winner
    let winner: string;
    let winningValue: number;
    
    if (gameType === '1v1') {
      const playerValue = newRoundCards['0'].value;
      const aiValue = newRoundCards['1'].value;
      
      if (playerValue > aiValue) {
        winner = 'You win this round!';
        winningValue = playerValue;
      } else if (aiValue > playerValue) {
        winner = `${players[1].name} wins this round!`;
        winningValue = aiValue;
      } else {
        winner = 'Round tied!';
        winningValue = playerValue;
      }
    } else {
      // 2v2 team logic
      const team1Total = newRoundCards['0'].value + newRoundCards['1'].value;
      const team2Total = newRoundCards['2'].value + newRoundCards['3'].value;
      
      if (team1Total > team2Total) {
        winner = 'Your team wins this round!';
        winningValue = team1Total;
      } else if (team2Total > team1Total) {
        winner = 'Enemy team wins this round!';
        winningValue = team2Total;
      } else {
        winner = 'Round tied!';
        winningValue = team1Total;
      }
    }
    
    setRoundResult(winner);
    
    // Update scores and mark cards as used
    setTimeout(() => {
      setPlayers(prevPlayers => {
        const newPlayers = [...prevPlayers];
        
        if (gameType === '1v1') {
          const playerValue = newRoundCards['0'].value;
          const aiValue = newRoundCards['1'].value;
          
          if (playerValue > aiValue) {
            newPlayers[0].score += 2;
            newPlayers[1].score -= 1;
          } else if (aiValue > playerValue) {
            newPlayers[1].score += 2;
            newPlayers[0].score -= 1;
          }
        } else {
          const team1Total = newRoundCards['0'].value + newRoundCards['1'].value;
          const team2Total = newRoundCards['2'].value + newRoundCards['3'].value;
          
          if (team1Total > team2Total) {
            newPlayers[0].score += 2;
            newPlayers[1].score += 2;
            newPlayers[2].score -= 1;
            newPlayers[3].score -= 1;
          } else if (team2Total > team1Total) {
            newPlayers[2].score += 2;
            newPlayers[3].score += 2;
            newPlayers[0].score -= 1;
            newPlayers[1].score -= 1;
          }
        }
        
        // Mark cards as used
        Object.keys(newRoundCards).forEach(playerId => {
          const playerIndex = parseInt(playerId);
          const cardId = newRoundCards[playerId].id;
          const cardIndex = newPlayers[playerIndex].cards.findIndex(c => c.id === cardId);
          if (cardIndex !== -1) {
            newPlayers[playerIndex].cards[cardIndex].used = true;
          }
        });
        
        return newPlayers;
      });
      
      // Check if game ended
      if (currentRound >= 10) {
        endGame();
      } else {
        setCurrentRound(currentRound + 1);
        setSelectedCard(null);
        setRoundCards({});
        setRoundResult(null);
        setIsProcessing(false);
      }
    }, 3000);
  };

  const endGame = () => {
    setGameEnded(true);
    
    let winner: string;
    let playerWon = false;
    
    // Check final scores after all rounds are complete
    if (gameType === '1v1') {
      if (players[0].score > players[1].score) {
        winner = 'You win the match!';
        playerWon = true;
      } else if (players[1].score > players[0].score) {
        winner = `${players[1].name} wins the match!`;
      } else {
        winner = 'Match tied!';
      }
    } else {
      const team1Score = players[0].score + players[1].score;
      const team2Score = players[2].score + players[3].score;
      
      if (team1Score > team2Score) {
        winner = 'Your team wins the match!';
        playerWon = true;
      } else if (team2Score > team1Score) {
        winner = 'Enemy team wins the match!';
      } else {
        winner = 'Match tied!';
      }
    }
    
    setGameWinner(winner);
    
    // Calculate XP gained
    const xpGained = calculateXPGain(playerWon, gameMode, gameType);
    setXpGained(xpGained);
    
    // Update player stats with opponent MMR for ranked games
    if (gameMode === 'ranked') {
      const opponentMMR = gameType === '1v1' ? players[1].mmr : 
        Math.floor(((players[1].mmr || 0) + (players[2].mmr || 0) + (players[3].mmr || 0)) / 3);
      updateStats(gameMode, gameType, playerWon, opponentMMR);
    } else {
      updateStats(gameMode, gameType, playerWon);
    }
    
    // Show XP gain display after a short delay
    setTimeout(() => {
      setShowXPGain(true);
    }, 2000);
    
    setIsProcessing(false);
  };

  const playerCards = players.find(p => !p.isAI)?.cards || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      {/* XP Gain Display */}
      {showXPGain && (
        <XPGainDisplay
          xpGained={xpGained}
          previousXPProgress={previousXPProgress}
          currentXPProgress={getXPProgress()}
          onClose={() => setShowXPGain(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setCurrentScreen('menu')}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Menu
        </button>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            Round {currentRound}/10
          </div>
          <div className="text-sm text-gray-400">
            {gameMode.charAt(0).toUpperCase() + gameMode.slice(1)} {gameType}
          </div>
          {gameMode === 'ranked' && (
            <div className="text-xs text-yellow-400 mt-1">
              Your MMR: {playerStats.rankedStats[gameType].mmr}
            </div>
          )}
        </div>
        
        {/* Points HUD */}
        <div className="text-right">
          <div className="text-sm text-gray-400">Your Points</div>
          <div className="text-2xl font-bold text-emerald-400">
            {gameType === '1v1' 
              ? (players[0]?.score || 0) 
              : ((players[0]?.score || 0) + (players[1]?.score || 0))}
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="max-w-6xl mx-auto">
        {/* Opponents Cards (face down) */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Opponents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.slice(1).map((player, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-white font-medium">{player.name}</div>
                  {gameType === '2v2' && (
                    <div className={`text-xs px-2 py-1 rounded ${
                      player.team === 1 ? 'bg-blue-600' : 'bg-red-600'
                    }`}>
                      Team {player.team}
                    </div>
                  )}
                  <div className="text-emerald-400 font-bold ml-auto">
                    {player.score} pts
                  </div>
                </div>
                {renderTitle(player.titleId)}
                <div className="text-sm text-gray-400">
                  Cards remaining: {player.cards.filter(c => !c.used).length}
                </div>
                {gameMode === 'ranked' && player.mmr && (
                  <div className="text-xs text-yellow-400 mt-1">
                    MMR: {player.mmr}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Round Results */}
        {Object.keys(roundCards).length > 0 && (
          <div className="mb-8 bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Round {currentRound - 1} Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {Object.entries(roundCards).map(([playerId, card]) => (
                <div key={playerId} className="text-center">
                  <div className="text-sm text-gray-400 mb-2">
                    {players[parseInt(playerId)]?.name}
                  </div>
                  <div className={`w-16 h-24 rounded-lg flex items-center justify-center font-bold text-lg mx-auto
                    ${card.isPowerUp ? 'power-card' : 'bg-gray-700 text-white'}`}>
                    {getCardValueDisplay(card.value)}
                    {card.isPowerUp && <Zap size={12} className="ml-1" />}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {card.value}
                  </div>
                </div>
              ))}
            </div>
            {roundResult && (
              <div className="text-center">
                <div className={`text-lg font-semibold ${
                  roundResult.includes('You') ? 'text-emerald-400' : 
                  roundResult.includes('tied') ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {roundResult}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game End Screen */}
        {gameEnded && gameWinner && (
          <div className="mb-8 bg-gray-800 rounded-lg p-8 text-center">
            <Crown size={48} className="mx-auto mb-4 text-yellow-400" />
            <h2 className="text-3xl font-bold mb-4 text-white">{gameWinner}</h2>
            <div className="mb-6">
              <div className="text-lg text-gray-300">Final Score</div>
              <div className="text-2xl font-bold text-emerald-400">
                {gameType === '1v1' ? 
                  `You: ${players[0]?.score || 0} | ${players[1]?.name}: ${players[1]?.score || 0}` :
                  `Team 1: ${(players[0]?.score || 0) + (players[1]?.score || 0)} | Team 2: ${(players[2]?.score || 0) + (players[3]?.score || 0)}`
                }
              </div>
            </div>
            
            {/* MMR Change Display for Ranked Games */}
            {gameMode === 'ranked' && (
              <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-400 mb-2">MMR Change</div>
                <div className="text-lg font-semibold text-emerald-400">
                  {(() => {
                    const currentMMR = playerStats.rankedStats[gameType].mmr;
                    const opponentMMR = gameType === '1v1' ? players[1].mmr : 
                      Math.floor(((players[1].mmr || 0) + (players[2].mmr || 0) + (players[3].mmr || 0)) / 3);
                    const playerWon = gameWinner.includes('You') || gameWinner.includes('Your team');
                    const mmrChange = calculateMMRChange(playerWon, currentMMR, opponentMMR);
                    return mmrChange > 0 ? `+${mmrChange}` : `${mmrChange}`;
                  })()}
                </div>
                <div className="text-xs text-gray-400">
                  New MMR: {(() => {
                    const currentMMR = playerStats.rankedStats[gameType].mmr;
                    const opponentMMR = gameType === '1v1' ? players[1].mmr : 
                      Math.floor(((players[1].mmr || 0) + (players[2].mmr || 0) + (players[3].mmr || 0)) / 3);
                    const playerWon = gameWinner.includes('You') || gameWinner.includes('Your team');
                    const mmrChange = calculateMMRChange(playerWon, currentMMR, opponentMMR);
                    return currentMMR + mmrChange;
                  })()}
                </div>
              </div>
            )}

            {/* XP Gain Display */}
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star size={20} className="text-yellow-400" />
                <div className="text-sm text-gray-400">Experience Gained</div>
              </div>
              <div className="text-lg font-semibold text-emerald-400 mb-2">
                +{xpGained} XP
              </div>
              <div className="text-xs text-gray-400">
                Level {previousXPProgress.level} → Level {getXPProgress().level}
                {getXPProgress().level > previousXPProgress.level && (
                  <span className="text-yellow-400 ml-2">🎉 Level Up!</span>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setCurrentScreen('menu')}
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 
                       text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
            >
              Return to Menu
            </button>
          </div>
        )}

        {/* Player Cards */}
        {!gameEnded && (
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Your Cards</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {playerCards.map((card) => (
                <Card
                  key={card.id}
                  card={card}
                  isSelected={selectedCard === card.id}
                  onSelect={handleCardSelect}
                  disabled={card.used || isProcessing}
                />
              ))}
            </div>
            
            {selectedCard && !isProcessing && Object.keys(roundCards).length === 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={playRound}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 
                           text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300"
                >
                  Play Selected Card
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
