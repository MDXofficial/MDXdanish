import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Sparkles, Trophy, X, Disc } from 'lucide-react';

const PRIZES = [
  { label: '25K', coins: 25000, color: '#1e293b' },
  { label: '50K', coins: 50000, color: '#065f46' },
  { label: '100K', coins: 100000, color: '#1e3a8a' },
  { label: '250K', coins: 250000, color: '#581c87' },
  { label: '500K', coins: 500000, color: '#831843' },
  { label: '1M', coins: 1000000, color: '#854d0e' },
  { label: '50K', coins: 50000, color: '#065f46' },
  { label: '5M JACKPOT', coins: 5000000, color: '#78350f' },
];

export const SpinRewardModal: React.FC = () => {
  const { spinModalOpen, setSpinModalOpen, canClaimSpin, claimSpinReward, soundEnabled } = useGame();
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wonCoins, setWonCoins] = useState<number | null>(null);

  if (!spinModalOpen) return null;

  const handleSpinWheel = () => {
    if (isSpinning || !canClaimSpin) return;

    setIsSpinning(true);
    setWonCoins(null);
    soundEngine.playSpinTick(soundEnabled);

    // Pick a prize
    const rand = Math.random();
    let targetIndex = 0;
    if (rand < 0.05) targetIndex = 7; // 5M Jackpot
    else if (rand < 0.15) targetIndex = 5; // 1M
    else if (rand < 0.3) targetIndex = 4; // 500K
    else if (rand < 0.5) targetIndex = 3; // 250K
    else if (rand < 0.75) targetIndex = 2; // 100K
    else targetIndex = Math.random() > 0.5 ? 0 : 1; // 25k or 50k

    const segmentAngle = 360 / PRIZES.length;
    const targetAngle = 360 - (targetIndex * segmentAngle + segmentAngle / 2);
    const fullSpins = 360 * 6;
    const currentModulo = rotation % 360;
    const finalRotation = rotation + (360 - currentModulo) + fullSpins + targetAngle;
    setRotation(finalRotation);

    const tickInterval = setInterval(() => {
      soundEngine.playSpinTick(soundEnabled);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);

      const prize = PRIZES[targetIndex];
      setWonCoins(prize.coins);
      claimSpinReward(prize.coins);

      if (prize.coins >= 1000000) {
        soundEngine.playJackpot(soundEnabled);
        fireJackpotConfetti();
      } else {
        soundEngine.playWin(soundEnabled, true);
        fireCoinCelebration();
      }
    }, 3400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0a0f] border-2 border-amber-500/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <div>
              <h3 className="text-base font-black text-amber-400 font-display tracking-wide">
                LUCKY SPIN REWARD
              </h3>
              <p className="text-xs text-slate-400">Guaranteed Virtual Coin Prize</p>
            </div>
          </div>
          <button
            onClick={() => setSpinModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wheel Graphic */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative z-20 -mb-3 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-yellow-400 filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)]" />
          </div>

          <div className="w-56 h-56 rounded-full p-2 bg-gradient-to-tr from-amber-600 via-yellow-300 to-emerald-500 shadow-2xl relative flex items-center justify-center">
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3400ms] cubic-bezier(0.15,0.9,0.2,1)"
              style={{
                transform: `rotate(${rotation}deg)`,
                background:
                  'conic-gradient(#1e293b 0deg 45deg, #065f46 45deg 90deg, #1e3a8a 90deg 135deg, #581c87 135deg 180deg, #831843 180deg 225deg, #854d0e 225deg 270deg, #065f46 270deg 315deg, #78350f 315deg 360deg)',
              }}
            >
              {PRIZES.map((p, idx) => (
                <div
                  key={idx}
                  className="absolute w-full h-full flex justify-center pt-2"
                  style={{ transform: `rotate(${idx * 45 + 22.5}deg)` }}
                >
                  <span className="text-[10px] font-black text-amber-200">{p.label}</span>
                </div>
              ))}
            </div>

            <div className="absolute w-12 h-12 rounded-full bg-slate-950 border-2 border-yellow-300 flex items-center justify-center shadow-lg">
              <Disc className="w-5 h-5 text-amber-400" />
            </div>
          </div>
        </div>

        {wonCoins && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500 text-center mb-3">
            <span className="text-sm font-black text-emerald-400 uppercase tracking-wide">
              🎉 WON +{wonCoins.toLocaleString()} COINS!
            </span>
          </div>
        )}

        <button
          disabled={isSpinning || (!canClaimSpin && !wonCoins)}
          onClick={handleSpinWheel}
          className={`w-full py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
            isSpinning || (!canClaimSpin && !wonCoins)
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-yellow-200 shadow-amber-500/30'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>
            {isSpinning
              ? 'SPINNING...'
              : wonCoins
              ? 'PRIZE CLAIMED'
              : canClaimSpin
              ? 'SPIN LUCKY WHEEL'
              : 'FREE SPIN READY SOON'}
          </span>
        </button>
      </div>
    </div>
  );
};
