import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GameId } from '../../types';
import { soundEngine } from '../../utils/audio';
import { Shield, Settings, Users, Gamepad2, Coins, BarChart3, X, Check, Save } from 'lucide-react';

export const AdminPanelModal: React.FC = () => {
  const {
    adminModalOpen,
    setAdminModalOpen,
    user,
    games,
    adminSettings,
    allUsers,
    adminUpdateGame,
    adminUpdateSettings,
    adminAdjustCoins,
    history,
    soundEnabled,
  } = useGame();

  const [activeTab, setActiveTab] = useState<'games' | 'users' | 'rewards' | 'stats'>('games');
  const [dailyBonusInput, setDailyBonusInput] = useState(adminSettings.dailyBonusBase);
  const [hourlyBonusInput, setHourlyBonusInput] = useState(adminSettings.hourlyBonusAmount);
  const [welcomeBonusInput, setWelcomeBonusInput] = useState(adminSettings.welcomeBonusAmount);
  const [selectedUserCoins, setSelectedUserCoins] = useState<Record<string, number>>({});
  const [savedNotice, setSavedNotice] = useState(false);

  if (!adminModalOpen) return null;

  const handleSaveRewardSettings = () => {
    soundEngine.playClick(soundEnabled);
    adminUpdateSettings({
      dailyBonusBase: Number(dailyBonusInput),
      hourlyBonusAmount: Number(hourlyBonusInput),
      welcomeBonusAmount: Number(welcomeBonusInput),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleGiveCoins = (userId: string, current: number, add: number) => {
    soundEngine.playCoinClink(soundEnabled);
    adminAdjustCoins(userId, current + add);
  };

  // Stats calculation
  const totalSpinsAllTime = history.length;
  const totalPayoutAllTime = history.reduce((acc, h) => acc + h.payout, 0);
  const totalBetsAllTime = history.reduce((acc, h) => acc + h.bet, 0);
  const totalCirculatingCoins = allUsers.reduce((acc, u) => acc + u.coins, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0a0f] border-2 border-emerald-500/50 rounded-3xl p-5 shadow-[0_0_60px_rgba(16,185,129,0.3)] relative overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-black text-emerald-400 font-display tracking-wide flex items-center gap-2">
                MDX JACKPOT ADMIN CONSOLE
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ROOT
                </span>
              </h3>
              <p className="text-xs text-slate-400">Master Gaming Engine & Economy Controls</p>
            </div>
          </div>
          <button
            onClick={() => setAdminModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-xl my-3 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('games')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'games'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>15 Games</span>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Users</span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'rewards'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>Rewards & Economy</span>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-emerald-500 text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Live Stats</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: 15 GAMES MANAGEMENT */}
          {activeTab === 'games' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Configuring All 15 Games (RTP & State)
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">15/15 Active</span>
              </div>

              {games.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-[160px]">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-amber-400">
                      🎰
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">{g.name}</h4>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">{g.category}</span>
                    </div>
                  </div>

                  {/* RTP Slider */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">RTP:</span>
                    <input
                      type="range"
                      min={80}
                      max={98}
                      step={0.5}
                      value={g.rtp}
                      onChange={(e) => adminUpdateGame(g.id, { rtp: parseFloat(e.target.value) })}
                      className="w-20 accent-emerald-500"
                    />
                    <span className="text-xs font-black text-emerald-400 w-10 tabular-nums">
                      {g.rtp}%
                    </span>
                  </div>

                  {/* Min Bet & Max Bet */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-300">
                    <span className="text-[10px] text-slate-500 uppercase">Min:</span>
                    <input
                      type="number"
                      value={g.minBet}
                      onChange={(e) =>
                        adminUpdateGame(g.id, { minBet: Math.max(100, parseInt(e.target.value) || 100) })
                      }
                      className="w-16 px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-center"
                    />
                  </div>

                  {/* Toggle Enable */}
                  <button
                    onClick={() => adminUpdateGame(g.id, { enabled: !g.enabled })}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      g.enabled
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}
                  >
                    {g.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Manage Registered Players
              </span>

              {allUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{u.avatar}</span>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {u.username}
                        {u.isAdmin && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">
                            ADMIN
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block font-medium">BALANCE</span>
                      <span className="text-xs font-black text-amber-400 font-mono">
                        {u.coins.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleGiveCoins(u.id, u.coins, 100000)}
                        className="px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30"
                      >
                        +100K
                      </button>
                      <button
                        onClick={() => handleGiveCoins(u.id, u.coins, 1000000)}
                        className="px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30"
                      >
                        +1M
                      </button>
                      <button
                        onClick={() => adminAdjustCoins(u.id, 100000)}
                        className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs font-bold hover:text-white"
                        title="Reset to 100,000"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: REWARDS & ECONOMY SETTINGS */}
          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Virtual Coin Faucets & Daily Bonuses
              </span>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Daily Base Bonus (Coins)
                  </label>
                  <input
                    type="number"
                    value={dailyBonusInput}
                    onChange={(e) => setDailyBonusInput(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Base bonus rewarded before streak multiplier is applied.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Hourly Free Faucet (Coins)
                  </label>
                  <input
                    type="number"
                    value={hourlyBonusInput}
                    onChange={(e) => setHourlyBonusInput(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Available every 60 minutes for any player.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    New Player Welcome Bonus (Coins)
                  </label>
                  <input
                    type="number"
                    value={welcomeBonusInput}
                    onChange={(e) => setWelcomeBonusInput(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Granted automatically on sign up or guest initialization.
                  </span>
                </div>

                <button
                  onClick={handleSaveRewardSettings}
                  className="w-full py-3 rounded-xl font-bold text-sm uppercase transition bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 hover:brightness-110 flex items-center justify-center gap-1.5"
                >
                  {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{savedNotice ? 'SAVED REWARD CONFIG' : 'UPDATE REWARD CONFIG'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-3">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">
                Session Telemetry & Economy
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">TOTAL SPINS RECORDED</span>
                  <span className="text-xl font-black text-white tabular-nums">{totalSpinsAllTime}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">CIRCULATING VIRTUAL COINS</span>
                  <span className="text-xl font-black text-amber-400 tabular-nums">
                    {totalCirculatingCoins.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">TOTAL PAYOUTS ISSUED</span>
                  <span className="text-xl font-black text-emerald-400 tabular-nums">
                    {totalPayoutAllTime.toLocaleString()}
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block font-bold">SYSTEM INTEGRITY</span>
                  <span className="text-xl font-black text-emerald-400">100% OPERATIONAL</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
