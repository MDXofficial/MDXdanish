import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { AVATAR_OPTIONS } from '../../data/games';
import { User, Shield, Trophy, Coins, X, Check, LogOut, Flame } from 'lucide-react';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateProfile, setAuthModalOpen, logoutUser, soundEnabled } = useGame();
  const [username, setUsername] = useState(user.username);
  const [selectedAvatar, setSelectedAvatar] = useState(user.avatar);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    soundEngine.playClick(soundEnabled);
    updateProfile(username, selectedAvatar);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleLogout = () => {
    logoutUser();
    onClose();
    setAuthModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0a0f] border-2 border-amber-500/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-black text-amber-400 font-display tracking-wide">
                PLAYER PROFILE
              </h3>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Avatar Display & Selection */}
        <div className="flex flex-col items-center my-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-1 shadow-xl flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl">
              {selectedAvatar}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 uppercase tracking-wider">
              {user.vipTier} VIP
            </span>
            <span className="text-xs text-slate-400 font-medium">Level {user.level}</span>
          </div>
        </div>

        {/* Avatar Options Grid */}
        <div className="mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Choose Avatar
          </span>
          <div className="grid grid-cols-6 gap-2 bg-[#090b10] p-3 rounded-2xl border border-slate-800">
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av}
                onClick={() => setSelectedAvatar(av)}
                className={`h-11 rounded-xl flex items-center justify-center text-2xl transition ${
                  selectedAvatar === av
                    ? 'bg-amber-500/30 border-2 border-amber-400 scale-105 shadow-md'
                    : 'bg-slate-900/60 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Username input */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm font-semibold text-white focus:outline-none focus:border-amber-400"
            maxLength={20}
          />
        </div>

        {/* Lifetime Statistics */}
        <div className="mb-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Career Records
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">TOTAL SPINS</span>
              <span className="text-sm font-black text-white tabular-nums">{user.totalSpins.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">TOTAL COINS WON</span>
              <span className="text-sm font-black text-amber-400 tabular-nums">{user.totalWon.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">HIGHEST SINGLE WIN</span>
              <span className="text-sm font-black text-emerald-400 tabular-nums">{user.highestWin.toLocaleString()}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block font-medium">MEMBER SINCE</span>
              <span className="text-sm font-black text-slate-300">{user.joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Save button & Logout */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl font-extrabold text-sm font-display tracking-wider uppercase transition bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 flex items-center justify-center gap-1.5"
          >
            {isSaved ? <Check className="w-4 h-4" /> : null}
            <span>{isSaved ? 'SAVED!' : 'SAVE PROFILE'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="px-3.5 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-bold transition flex items-center gap-1"
            title="Log Out / Switch Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
