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
  { id: 'title_rookie', name: 'Rookie', level: 5, color: 'text-white', glow: false },
  { id: 'title_gamer', name: 'GAMER', level: 10, color: 'text-white', glow: false },
  { id: 'title_grinder', name: 'LEVEL GRINDER', level: 15, color: 'text-white', glow: false },
  { id: 'title_noshow', name: 'MR. NO-SHOW', level: 17, color: 'text-white', glow: false },
  { id: 'title_cardshark', name: 'CARD SHARK', level: 20, color: 'text-white', glow: false },
  { id: 'title_ultimategrinder', name: 'ULTIMATE GRINDER', level: 25, color: 'text-white', glow: false },
  { id: 'title_shadowdealer', name: 'SHADOW DEALER', level: 30, color: 'text-white', glow: false },
  { id: 'title_stackmaster', name: 'STACK MASTER', level: 35, color: 'text-white', glow: false },
  { id: 'title_kingoftable', name: 'KING OF THE TABLE', level: 40, color: 'text-white', glow: false },
  { id: 'title_cardlord', name: 'CARD LORD', level: 50, color: 'text-white', glow: false },
];
