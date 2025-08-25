import { create } from "zustand";

type GameMode = 'casual' | 'ranked';
type GameType = '1v1' | '2v2';
type Screen = 'menu' | 'queue' | 'game';

interface ModalsState {
  stats: boolean;
  settings: boolean;
  tutorial: boolean;
  inventory: boolean;
  leaderboards: boolean;
}

interface GameState {
  currentScreen: Screen;
  gameMode: GameMode;
  gameType: GameType;
  modalsOpen: ModalsState;
  
  // Actions
  setCurrentScreen: (screen: Screen) => void;
  setGameMode: (mode: GameMode, type: GameType) => void;
  setModalsOpen: (modal: keyof ModalsState, isOpen: boolean) => void;
  initializeGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  currentScreen: 'menu',
  gameMode: 'casual',
  gameType: '1v1',
  modalsOpen: {
    stats: false,
    settings: false,
    tutorial: false,
    inventory: false,
    leaderboards: false,
  },

  setCurrentScreen: (screen) => set({ currentScreen: screen }),
  
  setGameMode: (mode, type) => set({ gameMode: mode, gameType: type }),
  
  setModalsOpen: (modal, isOpen) =>
    set((state) => ({
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
}));
