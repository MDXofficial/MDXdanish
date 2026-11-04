import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireCoinCelebration } from '../../utils/confetti';
import { Calendar, CheckCircle2, Gift, X, Sparkles } from 'lucide-react';

const STREAK_REWARDS = [
  { day: 1, reward: 25000, label: 'Day 1' },
  { day: 2, reward: 40000, label: 'Day 2' },
  { day: 3, reward: 60000, label: 'Day 3' },
  { day: 4, reward: 85000, label: 'Day 4' },
  { day: 5, reward: 120000, label: 'Day 5' },
  { day: 6, reward: 175000, label: 'Day 6' },
  { day: 7, reward: 300000, label: 'Day 7 (MEGA)' },
];

export const DailyBonusModal: React.FC = () => {
  const {
    dailyModalOpen,
    setDailyModalOpen,
    canClaimDaily,
    claimDailyBonus,
    streakDays,
    soundEnabled,
  } = useGame();

  const [claimedReward, setClaimedReward] = useState<number | null>(null);

  if (!dailyModalOpen) return null;

  const handleClaim = () => {
    if (!canClaimDaily) return;
    const amount = claimDailyBonus();
    setClaimedReward(amount);
    fireCoinCelebration();
  };

  const currentDayIndex = streakDays % 7;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0a0f] border-2 border-amber-500/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-black text-amber-400 font-display tracking-wide">
                DAILY LOGIN REWARDS
              </h3>
              <p className="text-xs text-slate-400">Streak: {streakDays} Consecutive Days</p>
            </div>
          </div>
          <button
            onClick={() => setDailyModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 7-Day Calendar Strip */}
        <div className="grid grid-cols-4 gap-2 my-4">
          {STREAK_REWARDS.slice(0, 4).map((r, i) => {
            const isCompleted = i < currentDayIndex;
            const isCurrent = i === currentDayIndex;
            return (
              <div
                key={r.day}
                className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border text-center transition ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 scale-105'
                    : isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/50 opacity-80'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">{r.label}</span>
                <span className="text-2xl my-1">{isCompleted ? '✅' : '🎁'}</span>
                <span className="text-[11px] font-black text-amber-300 tabular-nums">
                  {r.reward >= 1000 ? `${r.reward / 1000}K` : r.reward}
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {STREAK_REWARDS.slice(4, 7).map((r, i) => {
            const actualIndex = i + 4;
            const isCompleted = actualIndex < currentDayIndex;
            const isCurrent = actualIndex === currentDayIndex;
            const isMega = actualIndex === 6;
            return (
              <div
                key={r.day}
                className={`p-2.5 rounded-2xl flex flex-col items-center justify-center border text-center transition ${
                  isMega
                    ? 'bg-gradient-to-b from-amber-500/30 to-yellow-500/10 border-yellow-400 shadow-md'
                    : isCurrent
                    ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50'
                    : isCompleted
                    ? 'bg-slate-900/60 border-emerald-500/50 opacity-80'
                    : 'bg-slate-900/40 border-slate-800 opacity-60'
                }`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase">{r.label}</span>
                <span className="text-2xl my-1">{isCompleted ? '✅' : isMega ? '👑' : '🎁'}</span>
                <span className="text-xs font-black text-amber-300 tabular-nums">
                  {r.reward >= 1000 ? `${r.reward / 1000}K` : r.reward}
                </span>
              </div>
            );
          })}
        </div>

        {/* Claim Notice or Claimed Success */}
        {claimedReward ? (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-center mb-4">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              CLAIMED +{claimedReward.toLocaleString()} VIRTUAL COINS!
            </p>
            <p className="text-[11px] text-slate-300 mt-1">Come back tomorrow for your next streak bonus!</p>
          </div>
        ) : !canClaimDaily ? (
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center mb-4">
            <p className="text-xs font-bold text-slate-400">TODAY'S BONUS ALREADY CLAIMED</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Next gift unlocks tomorrow at 00:00 UTC</p>
          </div>
        ) : null}

        {/* Claim Action */}
        <button
          disabled={!canClaimDaily}
          onClick={handleClaim}
          className={`w-full py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
            !canClaimDaily
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-yellow-200 shadow-amber-500/30'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>{canClaimDaily ? 'CLAIM DAILY COINS' : 'CLAIMED FOR TODAY'}</span>
        </button>
      </div>
    </div>
  );
};
