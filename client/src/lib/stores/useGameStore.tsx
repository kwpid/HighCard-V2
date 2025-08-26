import { create } from "zustand";

type GameMode = 'casual' | 'ranked';
type GameType = '1v1' | '2v2';
type Screen = 'menu' | 'mode-select' | 'queue' | 'game';

interface ModalsState {
  stats: boolean;
  settings: boolean;
  tutorial: boolean;
  inventory: boolean;
  leaderboards: boolean;
  news: boolean;
  rewards: boolean;
}

interface GameState {
  currentScreen: Screen;
  gameMode: GameMode;
  gameType: GameType;
  selectedMode: GameMode | null;
  modalsOpen: ModalsState;
  rewardQueue: { id: string; type: 'title'; name: string }[];
  rewardModalOpen: boolean;
  
  // Actions
  setCurrentScreen: (screen: Screen) => void;
  setGameMode: (mode: GameMode, type: GameType) => void;
  setSelectedMode: (mode: GameMode) => void;
  setModalsOpen: (modal: keyof ModalsState, isOpen: boolean) => void;
  initializeGame: () => void;
  enqueueRewards: (items: { id: string; type: 'title'; name: string }[]) => void;
  popReward: () => { id: string; type: 'title'; name: string } | null;
}

export const useGameStore = create<GameState>((set: any, get: any) => ({
  currentScreen: 'menu',
  gameMode: 'casual',
  gameType: '1v1',
  selectedMode: null,
  modalsOpen: {
    stats: false,
    settings: false,
    tutorial: false,
    inventory: false,
    leaderboards: false,
    news: false,
    rewards: false,
  },
  rewardQueue: [],
  rewardModalOpen: false,

  setCurrentScreen: (screen: Screen) => set({ currentScreen: screen }),
  
  setGameMode: (mode: GameMode, type: GameType) => set({ gameMode: mode, gameType: type }),
  
  setSelectedMode: (mode: GameMode) => set({ selectedMode: mode }),
  
  setModalsOpen: (modal: keyof ModalsState, isOpen: boolean) =>
    set((state: GameState) => ({
      modalsOpen: {
        ...state.modalsOpen,
        [modal]: isOpen,
      },
    })),

  initializeGame: () => {
    // Initialize any game-wide settings from localStorage
    const savedSettings = localStorage.getItem('highcard-settings');
    if (savedSettings) {
      // Handle settings if needed
    }
  },

  enqueueRewards: (items: { id: string; type: 'title'; name: string }[]) => set((state: GameState) => ({
    rewardQueue: [...state.rewardQueue, ...items],
    rewardModalOpen: true,
  })),

  popReward: () => {
    const { rewardQueue } = get();
    if (rewardQueue.length === 0) return null;
    const [first, ...rest] = rewardQueue;
    set({ rewardQueue: rest, rewardModalOpen: rest.length > 0 });
    return first;
  },
}));
