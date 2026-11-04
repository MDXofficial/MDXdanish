export type GameId =
  | 'lucky-jackpot'
  | 'mega-spin'
  | 'royal-wheel'
  | 'diamond-slots'
  | 'lucky-777'
  | 'gold-rush'
  | 'treasure-hunt'
  | 'color-wheel'
  | 'fruit-slots'
  | 'lucky-dice'
  | 'mystery-box'
  | 'super-spinner'
  | 'dragon-jackpot'
  | 'star-spin'
  | 'ultimate-jackpot';

export type GameCategory = 'jackpot' | 'slots' | 'wheels' | 'arcade' | 'table';

export interface GameInfo {
  id: GameId;
  name: string;
  category: GameCategory;
  tagline: string;
  minBet: number;
  maxBet: number;
  jackpotAmount: number;
  image?: string;
  badge?: string;
  color: string;
  glowColor: string;
  enabled: boolean;
  rtp: number; // e.g. 96 (%)
  popularity: number;
}

export type VIPTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'MDX Legend';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  coins: number;
  level: number;
  xp: number;
  vipTier: VIPTier;
  totalSpins: number;
  totalWon: number;
  highestWin: number;
  joinedDate: string;
  isAdmin?: boolean;
}

export interface GameHistoryItem {
  id: string;
  gameId: GameId;
  gameName: string;
  bet: number;
  payout: number;
  multiplier: number;
  timestamp: number;
  outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS';
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  rewardCoins: number;
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  type: 'spin' | 'win_amount' | 'multiplier' | 'play_games';
}

export interface LeaderboardUser {
  rank: number;
  username: string;
  avatar: string;
  coins: number;
  vipTier: VIPTier;
  isCurrentUser?: boolean;
}

export interface AdminSettings {
  defaultRtp: number;
  dailyBonusBase: number;
  hourlyBonusAmount: number;
  welcomeBonusAmount: number;
  isMaintenanceMode: boolean;
  gamesConfig: Record<GameId, { enabled: boolean; rtp: number; minBet: number; maxBet: number }>;
}
