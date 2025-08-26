// Central title configuration for easy additions
// Add level-based titles here. They will be auto-awarded on reaching the required level.

export type LevelTitle = {
  id: string;          // unique ID (e.g., title_gamer)
  name: string;        // display name (e.g., GAMER)
  level: number;       // level requirement
  color?: string;      // CSS color class or hex (e.g., 'text-white' or '#ffffff')
  glow?: boolean;      // whether to apply a subtle glow animation
};

export const levelTitles: LevelTitle[] = [
  { id: 'title_rookie', name: 'Rookie', level: 5, color: 'text-gray-200', glow: false },
  { id: 'title_gamer', name: 'GAMER', level: 10, color: 'text-white', glow: false },
  { id: 'title_grinder', name: 'LEVEL GRINDER', level: 15, color: 'text-white', glow: false },
  { id: 'title_noshow', name: 'MR. NO-SHOW', level: 17, color: 'text-white', glow: false },
  // Add more here, e.g.:
  // { id: 'title_elite', name: 'ELITE', level: 20, color: 'text-yellow-300', glow: true },
];


