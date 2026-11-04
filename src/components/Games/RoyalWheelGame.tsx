import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Sparkles, Trophy } from 'lucide-react';

const SEGMENTS = [
  { label: '2X', mult: 2, color: '#1e293b', text: '#cbd5e1' },
  { label: '5X', mult: 5, color: '#065f46', text: '#34d399' },
  { label: '0X', mult: 0, color: '#334155', text: '#94a3b8' },
  { label: '10X', mult: 10, color: '#1e3a8a', text: '#60a5fa' },
  { label: '2X', mult: 2, color: '#1e293b', text: '#cbd5e1' },
  { label: '20X', mult: 20, color: '#581c87', text: '#c084fc' },
  { label: '0X', mult: 0, color: '#334155', text: '#94a3b8' },
  { label: '50X', mult: 50, color: '#831843', text: '#f472b6' },
  { label: '5X', mult: 5, color: '#065f46', text: '#34d399' },
  { label: '100X', mult: 100, color: '#854d0e', text: '#facc15' },
  { label: '3X', mult: 3, color: '#1e293b', text: '#cbd5e1' },
  { label: 'JACKPOT', mult: 250, color: '#78350f', text: '#fef08a' },
];

export const RoyalWheelGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [rotation, setRotation] = useState(0);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">12 Wheel Segments with Multipliers:</p>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>JACKPOT</span>
          <span className="text-yellow-400 font-bold">250X + Pot</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>100X</span>
          <span className="text-amber-400 font-bold">100X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>50X</span>
          <span className="text-pink-400 font-bold">50X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>20X</span>
          <span className="text-purple-400 font-bold">20X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>10X / 5X</span>
          <span className="text-blue-400 font-bold">10X / 5X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>2X / 3X</span>
          <span className="text-slate-400 font-bold">2X / 3X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="royal-wheel" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          // Select segment based on probabilities
          const rand = Math.random();
          let targetIndex = 0;
          if (rand < 0.03) {
            targetIndex = 11; // JACKPOT
          } else if (rand < 0.08) {
            targetIndex = 9; // 100X
          } else if (rand < 0.16) {
            targetIndex = 7; // 50X
          } else if (rand < 0.28) {
            targetIndex = 5; // 20X
          } else if (rand < 0.45) {
            targetIndex = 3; // 10X
          } else if (rand < 0.65) {
            targetIndex = Math.random() > 0.5 ? 1 : 8; // 5X
          } else if (rand < 0.82) {
            targetIndex = Math.random() > 0.5 ? 0 : 4; // 2X
          } else {
            targetIndex = Math.random() > 0.5 ? 2 : 6; // 0X
          }

          const segmentAngle = 360 / SEGMENTS.length;
          // Target angle to land under top pointer (270deg offset)
          const targetAngle = 360 - (targetIndex * segmentAngle + segmentAngle / 2);
          const fullSpins = 360 * 6; // 6 full rotations
          const currentModulo = rotation % 360;
          const finalRotation = rotation + (360 - currentModulo) + fullSpins + targetAngle;

          setRotation(finalRotation);

          // Wheel tick audio
          const tickInterval = setInterval(() => {
            soundEngine.playSpinTick(soundEnabled);
          }, 120);

          setTimeout(() => {
            clearInterval(tickInterval);
            setIsSpinning(false);
            const landed = SEGMENTS[targetIndex];
            const multiplier = landed.mult;
            const payout = Math.round(bet * multiplier);

            let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS' = 'LOSS';
            if (landed.label === 'JACKPOT') {
              outcome = 'JACKPOT';
              soundEngine.playJackpot(soundEnabled);
              fireJackpotConfetti();
              setWinMessage(`ROYAL JACKPOT! Won ${(payout + 1000000).toLocaleString()} Coins!`);
              recordGameSpin('royal-wheel', bet, payout + 1000000, outcome, multiplier);
            } else if (multiplier >= 20) {
              outcome = 'BIG_WIN';
              soundEngine.playWin(soundEnabled, true);
              fireCoinCelebration();
              setWinMessage(`BIG WIN! ${multiplier}x (${payout.toLocaleString()} Coins)`);
              recordGameSpin('royal-wheel', bet, payout, outcome, multiplier);
            } else if (multiplier > 0) {
              outcome = 'WIN';
              soundEngine.playWin(soundEnabled, false);
              setWinMessage(`WIN! ${multiplier}x (+${payout.toLocaleString()} Coins)`);
              recordGameSpin('royal-wheel', bet, payout, outcome, multiplier);
            } else {
              soundEngine.playReelStop(soundEnabled);
              setWinMessage('No Win. Spin Again!');
              recordGameSpin('royal-wheel', bet, 0, 'LOSS', 0);
            }

            setLastResult({ payout, multiplier, outcome });
          }, 3500);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-sm py-2">
            {/* Wheel Pointer */}
            <div className="relative z-20 -mb-4 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-yellow-400 filter drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)]" />
            </div>

            {/* Outer Golden Wheel Rim */}
            <div className="w-72 h-72 rounded-full p-2 bg-gradient-to-tr from-amber-600 via-yellow-300 to-amber-700 shadow-[0_0_40px_rgba(245,158,11,0.35)] relative flex items-center justify-center">
              {/* Inner Rotating Wheel */}
              <div
                className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3500ms] cubic-bezier(0.15,0.9,0.2,1)"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: 'conic-gradient(#1e293b 0deg 30deg, #065f46 30deg 60deg, #334155 60deg 90deg, #1e3a8a 90deg 120deg, #1e293b 120deg 150deg, #581c87 150deg 180deg, #334155 180deg 210deg, #831843 210deg 240deg, #065f46 240deg 270deg, #854d0e 270deg 300deg, #1e293b 300deg 330deg, #78350f 330deg 360deg)',
                }}
              >
                {/* Wheel Segment Labels */}
                {SEGMENTS.map((seg, idx) => {
                  const angle = idx * 30 + 15;
                  return (
                    <div
                      key={idx}
                      className="absolute w-full h-full flex justify-center pt-2"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: '50% 50%',
                      }}
                    >
                      <span
                        className="text-[10px] font-black font-display tracking-wider"
                        style={{ color: seg.text }}
                      >
                        {seg.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Wheel Center Golden Hub */}
              <div className="absolute w-16 h-16 rounded-full bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 border-2 border-yellow-200 shadow-xl flex items-center justify-center z-10">
                <Trophy className="w-7 h-7 text-slate-950" />
              </div>
            </div>

            {/* Win announcement */}
            <div className="h-10 mt-4 flex items-center justify-center">
              {winMessage ? (
                <span className="text-sm font-extrabold font-display uppercase tracking-wider text-amber-300">
                  {winMessage}
                </span>
              ) : (
                <span className="text-xs text-slate-500">Spin the Golden Wheel</span>
              )}
            </div>

            {/* Spin CTA */}
            <button
              disabled={isSpinning || user.coins < bet}
              onClick={handleSpin}
              className={`w-full max-w-xs mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                isSpinning || user.coins < bet
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-yellow-200 shadow-amber-500/20'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSpinning ? 'SPINNING...' : `SPIN WHEEL (${bet.toLocaleString()})`}</span>
            </button>
          </div>
        );
      }}
    </GameShell>
  );
};
