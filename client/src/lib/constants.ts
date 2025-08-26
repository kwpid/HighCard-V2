// Game constants and configuration

export const GAME_CONFIG = {
  ROUNDS_PER_MATCH: 10,
  REGULAR_CARDS_PER_PLAYER: 8,
  POWER_UP_CARDS_PER_PLAYER: 2,
  POINTS_FOR_WIN: 2,
  POINTS_FOR_LOSS: -1,
  PLACEMENT_MATCHES_REQUIRED: 5,
  WINS_PER_SEASON_REWARD: 10,
} as const;

export const QUEUE_CONFIG = {
  MIN_QUEUE_TIME: 3, // seconds
  MAX_QUEUE_TIME: 20, // seconds
  MMR_MULTIPLIER: 2, // additional seconds per 100 MMR
} as const;

export const CARD_VALUES = {
  MIN_REGULAR: 2,
  MAX_REGULAR: 14, // Ace = 14
  MIN_POWER_UP: 16,
  MAX_POWER_UP: 18,
} as const;

export const CARD_DISPLAY_VALUES = {
  11: 'J',
  12: 'Q', 
  13: 'K',
  14: 'A',
  16: 'PWR',
  17: 'PWR',
  18: 'PWR',
} as const;

export const SUITS = ['♠', '♥', '♦', '♣'] as const;

export const RANKS = [
  {
    name: 'Bronze',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 0, max: 199 },
    color: '#cd7f32'
  },
  {
    name: 'Silver',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 200, max: 399 },
    color: '#c0c0c0'
  },
  {
    name: 'Gold',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 400, max: 599 },
    color: '#ffd700'
  },
  {
    name: 'Platinum',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 600, max: 799 },
    color: '#e5e4e2'
  },
  {
    name: 'Diamond',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 800, max: 999 },
    color: '#b9f2ff'
  },
  {
    name: 'Champion',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 1000, max: 1199 },
    color: '#9d4edd'
  },
  {
    name: 'Grand Champion',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 1200, max: 1599 },
    color: '#ff006e'
  },
  {
    name: 'Card Legend',
    divisions: [],
    mmrRange: { min: 1600, max: Infinity },
    color: '#ffffff'
  },
] as const;

export const AI_NAMES = {
  regular: [
    'Alex', 'Jordan', 'Casey', 'Morgan', 'Riley', 'Avery', 'Quinn', 'Sage',
    'Phoenix', 'River', 'Skylar', 'Rowan', 'Ember', 'Nova', 'Zephyr', 'Orion',
    'Blake', 'Cameron', 'Drew', 'Finley', 'Harper', 'Hayden', 'Jamie', 'Kai',
    'Lane', 'Logan', 'Marley', 'Parker', 'Reese', 'Scout', 'Taylor', 'Vale'
  ],
  highRanked: [
    'Phantom', 'Shadow', 'Blaze', 'Storm', 'Viper', 'Titan', 'Nexus', 'Apex',
    'Eclipse', 'Quantum', 'Vertex', 'Matrix', 'Cipher', 'Vector', 'Prism', 'Flux',
    'Zenith', 'Crimson', 'Raven', 'Frost', 'Thunder', 'Void', 'Neon', 'Chrome',
    'Onyx', 'Pulse', 'Razor', 'Saber', 'Talon', 'Wraith', 'Zorro', 'Kraken'
  ]
} as const;

export const SEASON_CONFIG = {
  SEASON_ONE_START: new Date('2025-09-01T00:00:00Z'),
  SOFT_RESET_MULTIPLIER: 0.7, // 70% of previous MMR
  PRE_SEASON_NUMBER: 0,
} as const;

export const UI_CONFIG = {
  ANIMATION_DURATION: 300, // milliseconds
  CARD_HOVER_SCALE: 1.05,
  CARD_SELECT_TRANSLATE_Y: -8, // pixels
  MODAL_Z_INDEX: 50,
  NEON_GLOW_COLOR: 'rgba(16, 185, 129, 0.4)',
} as const;

export const LOCAL_STORAGE_KEYS = {
  PLAYER_STATS: 'highcard-player-stats',
  SETTINGS: 'highcard-settings',
  TUTORIAL_COMPLETED: 'highcard-tutorial-completed',
} as const;
