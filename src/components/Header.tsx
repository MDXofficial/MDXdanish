import React from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../utils/audio';
import {
  Coins,
  Gift,
  Trophy,
  Download,
  Smartphone,
  Shield,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

export const Header: React.FC<{ onOpenProfile: () => void }> = ({ onOpenProfile }) => {
  const {
    user,
    canClaimDaily,
    canClaimSpin,
    setDailyModalOpen,
    setSpinModalOpen,
    setApkModalOpen,
    setAdminModalOpen,
    setRewardsModalOpen,
    deviceViewMode,
    toggleDeviceViewMode,
    soundEnabled,
    toggleSound,
  } = useGame();

  const handleLogoClick = () => {
    soundEngine.playClick(soundEnabled);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#08090d]/95 backdrop-blur-md border-b border-amber-500/20 px-3 sm:px-6 py-2.5 transition">
      <div className="flex items-center justify-between gap-2 max-w-7xl mx-auto">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleLogoClick}>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-amber-400/60 shadow-[0_0_12px_rgba(245,158,11,0.4)] bg-black shrink-0">
            <img
              src="/src/assets/images/mdx_jackpot_logo_1793776319432.jpg"
              alt="MDX JACKPOT"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm sm:text-base font-black font-display tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 flex items-center gap-1.5 whitespace-nowrap">
              MDX JACKPOT
              <span className="hidden sm:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                PRO
              </span>
            </h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest hidden sm:block">
              PLAY & WIN VIRTUALLY
            </span>
          </div>
        </div>

        {/* Center Actions / Coin Pill */}
        <div className="flex items-center gap-2">
          {/* Virtual Coin Balance */}
          <div
            onClick={() => {
              soundEngine.playCoinClink(soundEnabled);
              setRewardsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 cursor-pointer shadow-md group transition"
            title="Click to claim free rewards"
          >
            <Coins className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs sm:text-sm font-black text-amber-300 font-display tabular-nums">
              {user.coins.toLocaleString()}
            </span>
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
              <Plus className="w-3 h-3" />
            </div>
          </div>

          {/* Daily Gift Button */}
          <button
            onClick={() => {
              soundEngine.playClick(soundEnabled);
              setDailyModalOpen(true);
            }}
            className={`relative p-2 rounded-xl border transition ${
              canClaimDaily
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Daily Login Bonus"
          >
            <Gift className="w-4 h-4" />
            {canClaimDaily && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>

          {/* Lucky Spin Button */}
          <button
            onClick={() => {
              soundEngine.playClick(soundEnabled);
              setSpinModalOpen(true);
            }}
            className={`relative p-2 rounded-xl border transition ${
              canClaimSpin
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Lucky Daily Spin"
          >
            <Trophy className="w-4 h-4" />
            {canClaimSpin && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition hidden md:flex"
            title="Toggle Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Device Frame View Toggle */}
          <button
            onClick={toggleDeviceViewMode}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition hidden sm:flex items-center gap-1 text-xs font-semibold"
            title="Toggle Android Device Frame Simulation"
          >
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] hidden lg:inline">
              {deviceViewMode === 'android-frame' ? 'Exit Frame' : 'Phone View'}
            </span>
          </button>

          {/* Admin Panel button if user is Admin */}
          {user.isAdmin && (
            <button
              onClick={() => setAdminModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition flex items-center gap-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ADMIN</span>
            </button>
          )}

          {/* Download APK CTA */}
          <button
            onClick={() => setApkModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition shadow-md flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">GET APK</span>
          </button>

          {/* Profile Avatar Trigger */}
          <button
            onClick={onOpenProfile}
            className="w-9 h-9 rounded-full bg-slate-900 border-2 border-amber-400/60 hover:border-amber-300 flex items-center justify-center text-lg transition shadow-md hover:scale-105 shrink-0"
            title="Player Profile"
          >
            {user.avatar}
          </button>
        </div>
      </div>
    </header>
  );
};
