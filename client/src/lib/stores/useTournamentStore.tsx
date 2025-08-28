import { create } from "zustand";
import { getRankFromMMR } from "../gameLogic";
import { usePlayerStore } from "./usePlayerStore";

type TournamentGameType = '1v1' | '2v2';

interface Tournament {
  id: string;
  type: TournamentGameType;
  startTime: number;
  endTime: number;
  participants: TournamentParticipant[];
  bracket: TournamentBracket;
  status: 'upcoming' | 'active' | 'completed';
  requiredRank: string;
}

interface TournamentParticipant {
  id: string;
  username: string;
  rank: string;
  division?: string | null;
  mmr: number;
  isPlayer: boolean;
}

interface TournamentMatch {
  id: string;
  round: number;
  participant1: TournamentParticipant | null;
  participant2: TournamentParticipant | null;
  winner: TournamentParticipant | null;
  status: 'pending' | 'active' | 'completed';
  isBestOf3: boolean;
  scores: { p1: number; p2: number };
}

interface TournamentBracket {
  matches: TournamentMatch[];
  rounds: number;
}

interface TournamentState {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  currentMatch: TournamentMatch | null;
  
  // Actions
  generateTournaments: () => void;
  joinTournament: (tournamentId: string) => boolean;
  getPlayerTournamentRank: () => { rank: string; division?: string | null };
  getCurrentTournament: () => Tournament | null;
  getNextTournaments: () => Tournament[];
  simulateMatchResult: (matchId: string) => void;
  advancePlayerInTournament: () => void;
  awardTournamentTitle: (tournament: Tournament, participant: TournamentParticipant) => void;
  forceStartTournament: () => boolean;
}

// Helper function to determine tournament rank based on highest MMR
const getPlayerTournamentRank = () => {
  const playerStore = usePlayerStore.getState();
  if (!playerStore || !playerStore.playerStats) return { rank: 'Bronze', division: 'I' };
  
  const { rankedStats } = playerStore.playerStats;
  if (!rankedStats || (!rankedStats['1v1'] && !rankedStats['2v2'])) {
    return { rank: 'Bronze', division: 'I' };
  }
  
  const mmr1v1 = rankedStats['1v1']?.mmr || 0;
  const mmr2v2 = rankedStats['2v2']?.mmr || 0;
  const highestMMR = Math.max(mmr1v1, mmr2v2);
  
  return getRankFromMMR(highestMMR);
};

// Generate AI participants for tournaments
const generateAIParticipants = (count: number, requiredRank: string): TournamentParticipant[] => {
  const participants: TournamentParticipant[] = [];
  const rankThresholds: Record<string, { min: number; max: number }> = {
    'Bronze': { min: 0, max: 399 },
    'Silver': { min: 400, max: 599 },
    'Gold': { min: 600, max: 799 },
    'Platinum': { min: 800, max: 999 },
    'Diamond': { min: 1000, max: 1199 },
    'Champion': { min: 1200, max: 1399 },
    'Grand Champion': { min: 1400, max: 1599 },
    'Card Legend': { min: 1600, max: 2000 }
  };

  const threshold = rankThresholds[requiredRank];
  if (!threshold) return participants;

  for (let i = 0; i < count; i++) {
    const mmr = Math.floor(Math.random() * (threshold.max - threshold.min + 1)) + threshold.min;
    const { rank, division } = getRankFromMMR(mmr);
    
    participants.push({
      id: `ai-${i}`,
      username: `Player${i + 1}`,
      rank,
      division,
      mmr,
      isPlayer: false
    });
  }
  
  return participants;
};

// Create a tournament bracket
const createBracket = (participants: TournamentParticipant[]): TournamentBracket => {
  const matches: TournamentMatch[] = [];
  let currentRound = 1;
  let roundParticipants = [...participants];
  
  // Create matches for each round
  while (roundParticipants.length > 1) {
    const roundMatches: TournamentMatch[] = [];
    
    for (let i = 0; i < roundParticipants.length; i += 2) {
      const isSemiFinal = roundParticipants.length === 4;
      const isFinal = roundParticipants.length === 2;
      const isBestOf3 = isSemiFinal || isFinal;
      
      roundMatches.push({
        id: `match-${currentRound}-${i / 2}`,
        round: currentRound,
        participant1: roundParticipants[i] || null,
        participant2: roundParticipants[i + 1] || null,
        winner: null,
        status: currentRound === 1 ? 'pending' : 'pending',
        isBestOf3,
        scores: { p1: 0, p2: 0 }
      });
    }
    
    matches.push(...roundMatches);
    roundParticipants = new Array(Math.ceil(roundParticipants.length / 2)).fill(null);
    currentRound++;
  }
  
  return {
    matches,
    rounds: currentRound - 1
  };
};

// Generate tournament schedule (every 10 minutes at fixed times like XX:00, XX:10, XX:20)
const generateTournamentSchedule = (): Tournament[] => {
  const tournaments: Tournament[] = [];
  const now = Date.now();
  const currentDate = new Date(now);
  
  // Calculate next tournament time (round up to next 10-minute mark)
  const currentMinutes = currentDate.getMinutes();
  const currentSeconds = currentDate.getSeconds();
  const currentMs = currentDate.getMilliseconds();
  
  // Round up to next 10-minute interval
  const nextInterval = Math.ceil(currentMinutes / 10) * 10;
  const nextTournamentDate = new Date(currentDate);
  nextTournamentDate.setMinutes(nextInterval, 0, 0); // Set to next 10-minute mark with 0 seconds and ms
  
  // If we're already past this hour's last interval, move to next hour
  if (nextInterval >= 60) {
    nextTournamentDate.setHours(nextTournamentDate.getHours() + 1, 0, 0, 0);
  }
  
  // Generate next 6 tournaments (1 hour worth)
  for (let i = 0; i < 6; i++) {
    const startTime = nextTournamentDate.getTime() + (i * 10 * 60 * 1000); // 10 minutes apart
    const endTime = startTime + (8 * 60 * 1000); // 8 minutes per tournament
    
    ['1v1', '2v2'].forEach((type) => {
      const playerRank = getPlayerTournamentRank();
      const aiParticipants = generateAIParticipants(7, playerRank.rank); // 7 AI + 1 player = 8 total
      
      tournaments.push({
        id: `tournament-${type}-${startTime}`,
        type: type as TournamentGameType,
        startTime,
        endTime,
        participants: aiParticipants,
        bracket: createBracket(aiParticipants),
        status: 'upcoming',
        requiredRank: playerRank.rank
      });
    });
  }
  
  return tournaments;
};

export const useTournamentStore = create<TournamentState>((set, get) => ({
  tournaments: [],
  activeTournament: null,
  currentMatch: null,

  generateTournaments: () => {
    const tournaments = generateTournamentSchedule();
    set({ tournaments });
  },

  getPlayerTournamentRank: () => {
    return getPlayerTournamentRank();
  },

  getCurrentTournament: () => {
    const { tournaments } = get();
    const now = Date.now();
    return tournaments.find(t => t.status === 'active' && t.startTime <= now && t.endTime >= now) || null;
  },

  getNextTournaments: () => {
    const { tournaments } = get();
    const now = Date.now();
    return tournaments
      .filter(t => t.startTime > now)
      .sort((a, b) => a.startTime - b.startTime)
      .slice(0, 4); // Next 2 tournaments (1v1 and 2v2)
  },

  joinTournament: (tournamentId: string) => {
    const { tournaments } = get();
    const tournament = tournaments.find(t => t.id === tournamentId);
    
    console.log('Tournament found:', tournament);
    console.log('Tournament status:', tournament?.status);
    
    if (!tournament) {
      console.error('Tournament not found:', tournamentId);
      return false;
    }
    
    if (tournament.status !== 'upcoming') {
      console.error('Tournament status invalid:', tournament.status);
      return false;
    }

    // Check if player level requirement is met (level 7)
    const playerStore = usePlayerStore.getState();
    if (!playerStore) {
      console.error('Player store not found');
      return false;
    }
    
    if (playerStore.playerStats.level < 7) {
      console.error('Player level too low:', playerStore.playerStats.level);
      return false;
    }

    // Check if player is already in tournament
    const alreadyJoined = tournament.participants.some(p => p.isPlayer);
    if (alreadyJoined) {
      console.error('Player already joined this tournament');
      return false;
    }

    const playerRank = getPlayerTournamentRank();
    const playerParticipant: TournamentParticipant = {
      id: 'player',
      username: playerStore.username || 'Player',
      rank: playerRank.rank,
      division: playerRank.division,
      mmr: Math.max(playerStore.playerStats.rankedStats['1v1'].mmr, playerStore.playerStats.rankedStats['2v2'].mmr),
      isPlayer: true
    };

    console.log('Adding player to tournament:', playerParticipant);

    // Add player to tournament and regenerate bracket
    const allParticipants = [...tournament.participants, playerParticipant];
    const newBracket = createBracket(allParticipants);
    
    const updatedTournament = {
      ...tournament,
      participants: allParticipants,
      bracket: newBracket
    };

    const updatedTournaments = tournaments.map(t => 
      t.id === tournamentId ? updatedTournament : t
    );

    set({ 
      tournaments: updatedTournaments,
      activeTournament: updatedTournament
    });

    console.log('Successfully joined tournament');
    return true;
  },

  simulateMatchResult: (matchId: string) => {
    // This would simulate AI vs AI matches
    // Implementation depends on game logic
  },

  advancePlayerInTournament: () => {
    // This would be called when player wins a match
    // Implementation depends on game logic
  },

  awardTournamentTitle: (tournament: Tournament, participant: TournamentParticipant) => {
    if (!participant.isPlayer) return;
    
    const playerStore = usePlayerStore.getState();
    if (!playerStore) return;

    const currentSeason = playerStore.currentSeason || 1;
    const rank = participant.rank;
    
    // Check current tournament wins for this season
    const currentWins = playerStore.playerStats.tournamentWins.currentSeason || 0;
    const isThirdWin = currentWins >= 2; // This would be their 3rd win
    
    // Determine title color and glow
    let titleColor = 'white';
    let glow = false;
    
    if (isThirdWin) {
      if (rank === 'Card Legend') {
        titleColor = 'pink';
        glow = true;
      } else if (rank === 'Grand Champion') {
        titleColor = 'golden';
        glow = true;
      } else {
        titleColor = 'green';
      }
    } else {
      if (rank === 'Card Legend') {
        titleColor = 'white';
        glow = true;
      } else if (rank === 'Grand Champion') {
        titleColor = 'white';
        glow = true;
      }
    }

    const titleId = `tournament-s${currentSeason}-${rank.toLowerCase().replace(' ', '-')}-${isThirdWin ? 'variant' : 'standard'}`;
    const titleName = `S${currentSeason} ${rank.toUpperCase()} TOURNAMENT WINNER${isThirdWin ? ' ★' : ''}`;

    playerStore.addTitleIfNotOwned({
      id: titleId,
      name: titleName,
      type: 'tournament',
      season: currentSeason,
      rankColor: titleColor,
      glow
    });
  },

  forceStartTournament: () => {
    const { tournaments } = get();
    const now = Date.now();
    
    // Find the next upcoming tournament
    const nextTournament = tournaments
      .filter(t => t.status === 'upcoming' && t.startTime > now)
      .sort((a, b) => a.startTime - b.startTime)[0];
    
    if (!nextTournament) {
      console.log('No upcoming tournaments to force start');
      return false;
    }
    
    // Update the tournament start time to now
    const updatedTournament = {
      ...nextTournament,
      startTime: now,
      endTime: now + (8 * 60 * 1000) // 8 minutes from now
    };
    
    const updatedTournaments = tournaments.map(t => 
      t.id === nextTournament.id ? updatedTournament : t
    );
    
    set({ tournaments: updatedTournaments });
    
    console.log('Forced tournament to start:', updatedTournament.id);
    return true;
  }
}));

// Initialize tournaments on store creation
if (typeof window !== 'undefined') {
  (window as any).__tournamentStore = useTournamentStore;
  useTournamentStore.getState().generateTournaments();
}