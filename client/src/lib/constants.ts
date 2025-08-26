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
    mmrRange: { min: 0, max: 399 },
    color: '#cd7f32'
  },
  {
    name: 'Silver',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 400, max: 599 },
    color: '#c0c0c0'
  },
  {
    name: 'Gold',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 600, max: 799 },
    color: '#ffd700'
  },
  {
    name: 'Platinum',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 800, max: 999 },
    color: '#e5e4e2'
  },
  {
    name: 'Diamond',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 1000, max: 1199 },
    color: '#b9f2ff'
  },
  {
    name: 'Champion',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 1200, max: 1399 },
    color: '#9d4edd'
  },
  {
    name: 'Grand Champion',
    divisions: ['I', 'II', 'III'],
    mmrRange: { min: 1400, max: 1599 },
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
  ],
  highRanked: [
    "L",
    "kupid",
    "l0st",
    "jayleng",
    "weweewew",
    "RisingPhoinex87",
    "dr.1",
    "prot",
    "hunt",
    "kif",
    "?",
    "rivverott",
    "1x Dark",
    "Moxxy!",
    "ä",
    "شغثغخ",
    "dark!",
    "Vortex",
    "FlickMaster17",
    "r",
    "Skywave!",
    "R3tr0",
    "TurboClash893",
    "Zynk",
    "Null_Force",
    "Orbital",
    "Boosted",
    "GravyTrain",
    "NitroNinja",
    "PixelPlay",
    "PhantomX",
    "Fury",
    "Zero!",
    "Moonlight",
    "QuickTap",
    "v1per",
    "Slugger",
    "MetaDrift",
    "Hydra",
    "Neo!",
    "ShadowDart",
    "SlipStream",
    "F1ick",
    "Karma",
    "Sparkz",
    "Glitch",
    "Dash7",
    "Ignite",
    "Cyclone",
    "Nova",
    "Opt1c",
    "Viral",
    "Stormz",
    "PyroBlast",
    "Bl1tz",
    "Echo",
    "Hover",
    "PulseRider"
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
