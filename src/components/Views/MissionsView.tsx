import React from 'react';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireCoinCelebration } from '../../utils/confetti';
import { Gift, Clock, Sparkles, Check, Trophy } from 'lucide-react';

export const MissionsView: React.FC = () => {
  const {
    dailyMissions,
    claimMissionReward,
    canClaimHourly,
    hourlyRemainingSeconds,
    claimHourlyFaucet,
    adminSettings,
    soundEnabled,
  } = useGame();

  const handleClaimHourly = () => {
    if (!canClaimHourly) return;
    claimHourlyFaucet();
    fireCoinCelebration();
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-amber-400 font-display">
            DAILY MISSIONS & FAUCETS
          </h2>
          <p className="text-xs text-slate-400">Complete quests to collect free coins</p>
        </div>
      </div>

      {/* Hourly Free Faucet */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-black border-2 border-emerald-500/40 flex items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-emerald-400 font-display uppercase tracking-wider">
              HOURLY REFILL FAUCET
            </span>
          </div>
          <p className="text-base font-black text-white mt-1 tabular-nums">
            +{adminSettings.hourlyBonusAmount.toLocaleString()} Free Coins
          </p>
          <span className="text-xs text-slate-400">
            {canClaimHourly ? 'Ready to collect!' : `Next refill in: ${formatCountdown(hourlyRemainingSeconds)}`}
          </span>
        </div>

        <button
          disabled={!canClaimHourly}
          onClick={handleClaimHourly}
          className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition ${
            canClaimHourly
              ? 'bg-emerald-500 text-black hover:bg-emerald-400 animate-pulse shadow-md'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          {canClaimHourly ? 'CLAIM FAUCET' : 'COOLDOWN'}
        </button>
      </div>

      {/* Missions List */}
      <div className="space-y-3">
        {dailyMissions.map((m) => (
          <div
            key={m.id}
            className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {m.title}
                {m.completed && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    DONE
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">{m.description}</p>
              <div className="flex items-center gap-3 text-xs pt-1">
                <span className="text-amber-400 font-extrabold font-mono">
                  +{m.rewardCoins.toLocaleString()} Coins
                </span>
                <span className="text-slate-500">
                  Progress: {m.currentCount} / {m.targetCount}
                </span>
              </div>
            </div>

            <button
              disabled={!m.completed || m.claimed}
              onClick={() => {
                soundEngine.playCoinClink(soundEnabled);
                claimMissionReward(m.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${
                m.claimed
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : m.completed
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-md animate-bounce'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {m.claimed ? 'CLAIMED' : m.completed ? 'CLAIM' : 'IN PROGRESS'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
