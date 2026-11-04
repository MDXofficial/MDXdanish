import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  GameId,
  GameInfo,
  UserProfile,
  GameHistoryItem,
  DailyMission,
  LeaderboardUser,
  AdminSettings,
  VIPTier,
} from '../types';
import { INITIAL_GAMES, INITIAL_LEADERBOARD } from '../data/games';
import { soundEngine } from '../utils/audio';

interface GameContextType {
  user: UserProfile;
  games: GameInfo[];
  history: GameHistoryItem[];
  dailyMissions: DailyMission[];
  streakDays: number;
  canClaimDaily: boolean;
  canClaimSpin: boolean;
  canClaimHourly: boolean;
  hourlyRemainingSeconds: number;
  activeGame: GameId | null;
  activeTab: 'home' | 'missions' | 'leaderboard' | 'history' | 'profile';
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  deviceViewMode: 'fullscreen' | 'android-frame';
  allUsers: UserProfile[];
  adminSettings: AdminSettings;
  leaderboard: LeaderboardUser[];
  
  // Modals visibility
  dailyModalOpen: boolean;
  spinModalOpen: boolean;
  apkModalOpen: boolean;
  adminModalOpen: boolean;
  authModalOpen: boolean;
  rewardsModalOpen: boolean;

  // Actions
  setDailyModalOpen: (open: boolean) => void;
  setSpinModalOpen: (open: boolean) => void;
  setApkModalOpen: (open: boolean) => void;
  setAdminModalOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setRewardsModalOpen: (open: boolean) => void;
  setActiveGame: (gameId: GameId | null) => void;
  setActiveTab: (tab: 'home' | 'missions' | 'leaderboard' | 'history' | 'profile') => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
  toggleDeviceViewMode: () => void;
  recordGameSpin: (gameId: GameId, bet: number, payout: number, outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS', multiplier: number) => void;
  claimDailyBonus: () => number;
  claimSpinReward: (coinsWon: number) => void;
  claimHourlyFaucet: () => number;
  claimMissionReward: (missionId: string) => void;
  updateProfile: (username: string, avatar: string) => void;
  loginUser: (email: string, username?: string, asAdmin?: boolean) => void;
  logoutUser: () => void;
  addCoins: (amount: number) => void;
  adminUpdateGame: (gameId: GameId, partial: Partial<GameInfo>) => void;
  adminUpdateSettings: (settings: Partial<AdminSettings>) => void;
  adminAdjustCoins: (userId: string, newAmount: number) => void;
}

const DEFAULT_MISSIONS: DailyMission[] = [
  {
    id: 'm1',
    title: 'Warm Up',
    description: 'Spin any 5 slot or wheel games',
    rewardCoins: 15000,
    targetCount: 5,
    currentCount: 0,
    completed: false,
    claimed: false,
    type: 'spin',
  },
  {
    id: 'm2',
    title: 'Big Winner',
    description: 'Win a total of 50,000 virtual coins',
    rewardCoins: 35000,
    targetCount: 50000,
    currentCount: 0,
    completed: false,
    claimed: false,
    type: 'win_amount',
  },
  {
    id: 'm3',
    title: 'High Multiplier',
    description: 'Hit any win with 10x multiplier or higher',
    rewardCoins: 50000,
    targetCount: 1,
    currentCount: 0,
    completed: false,
    claimed: false,
    type: 'multiplier',
  },
  {
    id: 'm4',
    title: 'Casino Explorer',
    description: 'Play at least 3 distinct games today',
    rewardCoins: 25000,
    targetCount: 3,
    currentCount: 0,
    completed: false,
    claimed: false,
    type: 'play_games',
  },
];

const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  defaultRtp: 96.0,
  dailyBonusBase: 50000,
  hourlyBonusAmount: 10000,
  welcomeBonusAmount: 100000,
  isMaintenanceMode: false,
  gamesConfig: INITIAL_GAMES.reduce((acc, g) => {
    acc[g.id] = { enabled: g.enabled, rtp: g.rtp, minBet: g.minBet, maxBet: g.maxBet };
    return acc;
  }, {} as AdminSettings['gamesConfig']),
};

const INITIAL_USER: UserProfile = {
  id: 'usr_guest_01',
  username: 'JackpotVIP',
  email: 'player@mdxjackpot.vip',
  avatar: '👑',
  coins: 100000,
  level: 1,
  xp: 0,
  vipTier: 'Gold',
  totalSpins: 0,
  totalWon: 0,
  highestWin: 0,
  joinedDate: '2026-11-04',
  isAdmin: false,
};

function calculateVip(coins: number, totalWon: number): VIPTier {
  const score = coins + totalWon;
  if (score > 50000000) return 'MDX Legend';
  if (score > 25000000) return 'Diamond';
  if (score > 10000000) return 'Platinum';
  if (score > 3000000) return 'Gold';
  if (score > 1000000) return 'Silver';
  return 'Bronze';
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load stored state
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('mdx_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [games, setGames] = useState<GameInfo[]>(() => {
    const saved = localStorage.getItem('mdx_games');
    return saved ? JSON.parse(saved) : INITIAL_GAMES;
  });

  const [history, setHistory] = useState<GameHistoryItem[]>(() => {
    const saved = localStorage.getItem('mdx_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>(() => {
    const saved = localStorage.getItem('mdx_missions');
    return saved ? JSON.parse(saved) : DEFAULT_MISSIONS;
  });

  const [streakDays, setStreakDays] = useState<number>(() => {
    const saved = localStorage.getItem('mdx_streak');
    return saved ? parseInt(saved, 10) : 3;
  });

  const [lastDailyClaim, setLastDailyClaim] = useState<string>(() => {
    return localStorage.getItem('mdx_last_daily') || '';
  });

  const [lastSpinClaim, setLastSpinClaim] = useState<number>(() => {
    const saved = localStorage.getItem('mdx_last_spin');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [lastHourlyClaim, setLastHourlyClaim] = useState<number>(() => {
    const saved = localStorage.getItem('mdx_last_hourly');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => {
    const saved = localStorage.getItem('mdx_admin_settings');
    return saved ? JSON.parse(saved) : DEFAULT_ADMIN_SETTINGS;
  });

  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('mdx_all_users');
    if (saved) return JSON.parse(saved);
    return [
      INITIAL_USER,
      {
        id: 'usr_admin_01',
        username: 'MDX_Admin',
        email: 'admin@mdxjackpot.vip',
        avatar: '🦁',
        coins: 50000000,
        level: 50,
        xp: 99999,
        vipTier: 'MDX Legend',
        totalSpins: 540,
        totalWon: 125000000,
        highestWin: 25000000,
        joinedDate: '2026-01-01',
        isAdmin: true,
      },
    ];
  });

  // Navigation & View
  const [activeTab, setActiveTab] = useState<'home' | 'missions' | 'leaderboard' | 'history' | 'profile'>('home');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [deviceViewMode, setDeviceViewMode] = useState<'fullscreen' | 'android-frame'>('fullscreen');

  // Modals
  const [dailyModalOpen, setDailyModalOpen] = useState(false);
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [apkModalOpen, setApkModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [rewardsModalOpen, setRewardsModalOpen] = useState(false);

  // Hourly countdown timer
  const [hourlyRemainingSeconds, setHourlyRemainingSeconds] = useState(0);

  // Today string for daily claim comparison
  const todayStr = new Date().toISOString().split('T')[0];
  const canClaimDaily = lastDailyClaim !== todayStr;
  const canClaimSpin = Date.now() - lastSpinClaim >= 12 * 60 * 60 * 1000; // twice a day or 12h
  const canClaimHourly = Date.now() - lastHourlyClaim >= 60 * 60 * 1000;

  useEffect(() => {
    const updateCountdown = () => {
      const elapsed = Date.now() - lastHourlyClaim;
      const rem = Math.max(0, Math.floor((3600 * 1000 - elapsed) / 1000));
      setHourlyRemainingSeconds(rem);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lastHourlyClaim]);

  // Persistence helpers
  useEffect(() => {
    localStorage.setItem('mdx_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mdx_games', JSON.stringify(games));
  }, [games]);

  useEffect(() => {
    localStorage.setItem('mdx_history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('mdx_missions', JSON.stringify(dailyMissions));
  }, [dailyMissions]);

  useEffect(() => {
    localStorage.setItem('mdx_admin_settings', JSON.stringify(adminSettings));
  }, [adminSettings]);

  useEffect(() => {
    localStorage.setItem('mdx_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  // Actions
  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
    soundEngine.playClick(!soundEnabled);
  };

  const toggleHaptics = () => {
    setHapticsEnabled((prev) => !prev);
  };

  const toggleDeviceViewMode = () => {
    setDeviceViewMode((prev) => (prev === 'fullscreen' ? 'android-frame' : 'fullscreen'));
  };

  const addCoins = (amount: number) => {
    setUser((prev) => {
      const newCoins = prev.coins + amount;
      const newTotalWon = amount > 0 ? prev.totalWon + amount : prev.totalWon;
      const newVip = calculateVip(newCoins, newTotalWon);
      return {
        ...prev,
        coins: Math.max(0, newCoins),
        totalWon: newTotalWon,
        vipTier: newVip,
      };
    });
  };

  const recordGameSpin = (
    gameId: GameId,
    bet: number,
    payout: number,
    outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS',
    multiplier: number
  ) => {
    const game = games.find((g) => g.id === gameId);
    const gameName = game ? game.name : gameId;
    const net = payout - bet;

    // Update user balance, XP, level, stats
    setUser((prev) => {
      const newCoins = Math.max(0, prev.coins + net);
      const newWon = prev.totalWon + payout;
      const highestWin = Math.max(prev.highestWin, payout);
      const newSpins = prev.totalSpins + 1;
      const xpEarned = Math.floor(bet / 100);
      const newXp = prev.xp + xpEarned;
      const newLevel = 1 + Math.floor(newXp / 500);
      const newVip = calculateVip(newCoins, newWon);

      return {
        ...prev,
        coins: newCoins,
        totalWon: newWon,
        highestWin,
        totalSpins: newSpins,
        xp: newXp,
        level: newLevel,
        vipTier: newVip,
      };
    });

    // Add to history
    const historyItem: GameHistoryItem = {
      id: `spin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      gameId,
      gameName,
      bet,
      payout,
      multiplier,
      timestamp: Date.now(),
      outcome,
    };
    setHistory((prev) => [historyItem, ...prev.slice(0, 49)]);

    // Update daily missions
    setDailyMissions((prev) =>
      prev.map((mission) => {
        let count = mission.currentCount;
        if (mission.type === 'spin') {
          count += 1;
        } else if (mission.type === 'win_amount' && payout > 0) {
          count += payout;
        } else if (mission.type === 'multiplier' && multiplier >= 10) {
          count += 1;
        } else if (mission.type === 'play_games') {
          // Count unique games played
          const distinct = new Set([...history.map((h) => h.gameId), gameId]).size;
          count = distinct;
        }
        const completed = count >= mission.targetCount;
        return {
          ...mission,
          currentCount: count,
          completed,
        };
      })
    );
  };

  const claimDailyBonus = (): number => {
    if (!canClaimDaily) return 0;
    const base = adminSettings.dailyBonusBase;
    const multiplier = 1 + (streakDays % 7) * 0.2;
    const bonus = Math.round(base * multiplier);

    addCoins(bonus);
    setLastDailyClaim(todayStr);
    localStorage.setItem('mdx_last_daily', todayStr);

    const nextStreak = streakDays + 1;
    setStreakDays(nextStreak);
    localStorage.setItem('mdx_streak', nextStreak.toString());

    soundEngine.playCoinClink(soundEnabled);
    return bonus;
  };

  const claimSpinReward = (coinsWon: number) => {
    addCoins(coinsWon);
    const now = Date.now();
    setLastSpinClaim(now);
    localStorage.setItem('mdx_last_spin', now.toString());
  };

  const claimHourlyFaucet = (): number => {
    if (!canClaimHourly) return 0;
    const amount = adminSettings.hourlyBonusAmount;
    addCoins(amount);
    const now = Date.now();
    setLastHourlyClaim(now);
    localStorage.setItem('mdx_last_hourly', now.toString());
    soundEngine.playCoinClink(soundEnabled);
    return amount;
  };

  const claimMissionReward = (missionId: string) => {
    setDailyMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId && m.completed && !m.claimed) {
          addCoins(m.rewardCoins);
          soundEngine.playWin(soundEnabled);
          return { ...m, claimed: true };
        }
        return m;
      })
    );
  };

  const updateProfile = (username: string, avatar: string) => {
    setUser((prev) => ({
      ...prev,
      username: username.trim() || prev.username,
      avatar,
    }));
  };

  const loginUser = (email: string, username?: string, asAdmin = false) => {
    const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setUser(existing);
    } else {
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        username: username || email.split('@')[0],
        email,
        avatar: '👑',
        coins: asAdmin ? 50000000 : adminSettings.welcomeBonusAmount,
        level: asAdmin ? 50 : 1,
        xp: asAdmin ? 50000 : 0,
        vipTier: asAdmin ? 'MDX Legend' : 'Bronze',
        totalSpins: 0,
        totalWon: 0,
        highestWin: 0,
        joinedDate: todayStr,
        isAdmin: asAdmin,
      };
      setAllUsers((prev) => [newUser, ...prev]);
      setUser(newUser);
    }
    setAuthModalOpen(false);
  };

  const logoutUser = () => {
    setUser(INITIAL_USER);
  };

  const adminUpdateGame = (gameId: GameId, partial: Partial<GameInfo>) => {
    setGames((prev) =>
      prev.map((g) => (g.id === gameId ? { ...g, ...partial } : g))
    );
  };

  const adminUpdateSettings = (settings: Partial<AdminSettings>) => {
    setAdminSettings((prev) => ({ ...prev, ...settings }));
  };

  const adminAdjustCoins = (userId: string, newAmount: number) => {
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, coins: newAmount } : u))
    );
    if (user.id === userId) {
      setUser((prev) => ({ ...prev, coins: newAmount }));
    }
  };

  // Build dynamic leaderboard including active player
  const leaderboard: LeaderboardUser[] = [
    ...INITIAL_LEADERBOARD,
    {
      rank: 99,
      username: user.username,
      avatar: user.avatar,
      coins: user.coins,
      vipTier: user.vipTier,
      isCurrentUser: true,
    },
  ]
    .sort((a, b) => b.coins - a.coins)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  return (
    <GameContext.Provider
      value={{
        user,
        games,
        history,
        dailyMissions,
        streakDays,
        canClaimDaily,
        canClaimSpin,
        canClaimHourly,
        hourlyRemainingSeconds,
        activeGame,
        activeTab,
        soundEnabled,
        hapticsEnabled,
        deviceViewMode,
        allUsers,
        adminSettings,
        leaderboard,
        dailyModalOpen,
        spinModalOpen,
        apkModalOpen,
        adminModalOpen,
        authModalOpen,
        rewardsModalOpen,
        setDailyModalOpen,
        setSpinModalOpen,
        setApkModalOpen,
        setAdminModalOpen,
        setAuthModalOpen,
        setRewardsModalOpen,
        setActiveGame,
        setActiveTab,
        toggleSound,
        toggleHaptics,
        toggleDeviceViewMode,
        recordGameSpin,
        claimDailyBonus,
        claimSpinReward,
        claimHourlyFaucet,
        claimMissionReward,
        updateProfile,
        loginUser,
        logoutUser,
        addCoins,
        adminUpdateGame,
        adminUpdateSettings,
        adminAdjustCoins,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
