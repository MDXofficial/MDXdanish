import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireCoinCelebration } from '../../utils/confetti';
import { Gift, Clock, Sparkles, Check, X, Award } from 'lucide-react';

export const RewardsModal: React.FC = () => {
  const {
    rewardsModalOpen,
    setRewardsModalOpen,
    canClaimHourly,
    hourlyRemainingSeconds,
    claimHourlyFaucet,
    dailyMissions,
    claimMissionReward,
    adminSettings,
    soundEnabled,
  } = useGame();

  // Scratch card mini-game
  const [scratchCard, setScratchCard] = useState<
    Array<{ id: number; scratched: boolean; value: number }>
  >([
    { id: 1, scratched: false, value: 15000 },
    { id: 2, scratched: false, value: 50000 },
    { id: 3, scratched: false, value: 15000 },
  ]);
  const [scratchClaimed, setScratchClaimed] = useState(false);

  if (!rewardsModalOpen) return null;

  const handleClaimHourly = () => {
    if (!canClaimHourly) return;
    claimHourlyFaucet();
    fireCoinCelebration();
  };

  const handleScratch = (id: number) => {
    soundEngine.playCoinClink(soundEnabled);
    const updated = scratchCard.map((s) => (s.id === id ? { ...s, scratched: true } : s));
    setScratchCard(updated);

    if (updated.every((s) => s.scratched) && !scratchClaimed) {
      setScratchClaimed(true);
      fireCoinCelebration();
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0a0f] border-2 border-amber-500/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6 text-amber-400" />
            <div>
              <h3 className="text-base font-black text-amber-400 font-display tracking-wide">
                REWARDS & FAUCETS
              </h3>
              <p className="text-xs text-slate-400">Claim Free Virtual Coins</p>
            </div>
          </div>
          <button
            onClick={() => setRewardsModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Hourly Coin Faucet */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/30 my-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-emerald-400 font-display uppercase tracking-wider">
                HOURLY FAUCET
              </span>
            </div>
            <p className="text-sm font-black text-white mt-1 tabular-nums">
              +{adminSettings.hourlyBonusAmount.toLocaleString()} Free Coins
            </p>
            <span className="text-[11px] text-slate-400">
              {canClaimHourly ? 'Ready to collect!' : `Next refill in: ${formatCountdown(hourlyRemainingSeconds)}`}
            </span>
          </div>

          <button
            disabled={!canClaimHourly}
            onClick={handleClaimHourly}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition ${
              canClaimHourly
                ? 'bg-emerald-500 text-black hover:bg-emerald-400 animate-pulse shadow-md'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {canClaimHourly ? 'CLAIM NOW' : 'LOCKED'}
          </button>
        </div>

        {/* Scratch Card Mini-Game */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Lucky Scratch Card
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Scratch all 3 spots</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {scratchCard.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScratch(s.id)}
                className={`h-16 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition border ${
                  s.scratched
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {s.scratched ? (
                  <>
                    <span className="text-lg">🪙</span>
                    <span className="tabular-nums">+{s.value.toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">✨</span>
                    <span className="text-[10px] uppercase">SCRATCH</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Missions */}
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Daily Missions
          </span>
          <div className="space-y-2">
            {dailyMissions.map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{m.title}</h4>
                  <p className="text-[11px] text-slate-400">{m.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-amber-400 font-extrabold">
                      +{m.rewardCoins.toLocaleString()} Coins
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Progress: {m.currentCount} / {m.targetCount}
                    </span>
                  </div>
                </div>

                <button
                  disabled={!m.completed || m.claimed}
                  onClick={() => claimMissionReward(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    m.claimed
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : m.completed
                      ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-sm animate-bounce'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {m.claimed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>CLAIMED</span>
                    </>
                  ) : (
                    <span>{m.completed ? 'CLAIM' : 'IN PROGRESS'}</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
