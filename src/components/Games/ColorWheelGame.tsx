import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Disc, Sparkles } from 'lucide-react';

type BetColor = 'green' | 'gold' | 'red' | 'black' | 'blue';

interface ColorOption {
  id: BetColor;
  label: string;
  multiplier: number;
  hex: string;
  badgeBg: string;
}

const COLOR_OPTIONS: ColorOption[] = [
  { id: 'green', label: 'NEON GREEN', multiplier: 14, hex: '#22c55e', badgeBg: 'bg-emerald-500' },
  { id: 'gold', label: 'ROYAL GOLD', multiplier: 5, hex: '#eab308', badgeBg: 'bg-amber-500' },
  { id: 'blue', label: 'COBALT BLUE', multiplier: 3, hex: '#3b82f6', badgeBg: 'bg-blue-500' },
  { id: 'red', label: 'FLAME RED', multiplier: 2, hex: '#ef4444', badgeBg: 'bg-red-500' },
  { id: 'black', label: 'ONYX BLACK', multiplier: 2, hex: '#1e293b', badgeBg: 'bg-slate-700' },
];

export const ColorWheelGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [selectedColor, setSelectedColor] = useState<BetColor>('gold');
  const [rotation, setRotation] = useState(0);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Color Roulette Multipliers:</p>
      <div className="space-y-1.5">
        {COLOR_OPTIONS.map((c) => (
          <div key={c.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between items-center">
            <span className="font-bold flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.hex }} />
              {c.label}
            </span>
            <span className="text-amber-400 font-bold">{c.multiplier}X</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <GameShell gameId="color-wheel" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          // Random winning color
          const rand = Math.random();
          let landedColor: BetColor;
          if (rand < 0.08) landedColor = 'green';
          else if (rand < 0.25) landedColor = 'gold';
          else if (rand < 0.45) landedColor = 'blue';
          else if (rand < 0.72) landedColor = 'red';
          else landedColor = 'black';

          const colorAngles: Record<BetColor, number> = {
            green: 36,
            gold: 108,
            blue: 180,
            red: 252,
            black: 324,
          };

          const targetAngle = 360 - colorAngles[landedColor];
          const fullSpins = 360 * 5;
          const currentModulo = rotation % 360;
          const finalRotation = rotation + (360 - currentModulo) + fullSpins + targetAngle;
          setRotation(finalRotation);

          const tickInterval = setInterval(() => {
            soundEngine.playSpinTick(soundEnabled);
          }, 120);

          setTimeout(() => {
            clearInterval(tickInterval);
            setIsSpinning(false);

            const won = selectedColor === landedColor;
            const chosen = COLOR_OPTIONS.find((c) => c.id === selectedColor)!;
            const multiplier = won ? chosen.multiplier : 0;
            const payout = won ? Math.round(bet * multiplier) : 0;

            let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS' = 'LOSS';
            if (won) {
              if (multiplier >= 14) {
                outcome = 'JACKPOT';
                soundEngine.playJackpot(soundEnabled);
                fireJackpotConfetti();
                setWinMessage(`NEON GREEN HIT! 14x (${payout.toLocaleString()} Coins)`);
              } else if (multiplier >= 5) {
                outcome = 'BIG_WIN';
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`GOLD WIN! 5x (${payout.toLocaleString()} Coins)`);
              } else {
                outcome = 'WIN';
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`COLOR HIT! +${payout.toLocaleString()} Coins`);
              }
              recordGameSpin('color-wheel', bet, payout, outcome, multiplier);
            } else {
              soundEngine.playReelStop(soundEnabled);
              setWinMessage(`Landed on ${landedColor.toUpperCase()}. Try next spin!`);
              recordGameSpin('color-wheel', bet, 0, 'LOSS', 0);
            }

            setLastResult({ payout, multiplier, outcome });
          }, 3200);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-sm py-2">
            {/* Top Pointer */}
            <div className="relative z-20 -mb-4 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]" />
            </div>

            {/* Wheel */}
            <div className="w-64 h-64 rounded-full p-2 bg-gradient-to-tr from-purple-800 via-amber-400 to-emerald-500 shadow-[0_0_35px_rgba(168,85,247,0.3)] relative flex items-center justify-center">
              <div
                className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3200ms] cubic-bezier(0.15,0.9,0.2,1)"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  background: 'conic-gradient(#22c55e 0deg 72deg, #eab308 72deg 144deg, #3b82f6 144deg 216deg, #ef4444 216deg 288deg, #1e293b 288deg 360deg)',
                }}
              />
              <div className="absolute w-14 h-14 rounded-full bg-slate-950 border-2 border-amber-400 flex items-center justify-center shadow-lg">
                <Disc className="w-6 h-6 text-amber-400" />
              </div>
            </div>

            {/* Color Selection Chips */}
            <div className="w-full mt-4 flex items-center justify-center gap-1.5 flex-wrap">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  disabled={isSpinning}
                  onClick={() => {
                    soundEngine.playClick(soundEnabled);
                    setSelectedColor(c.id);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                    selectedColor === c.id
                      ? 'border-white scale-105 shadow-md ring-2 ring-amber-400'
                      : 'border-slate-800 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex, color: c.id === 'gold' ? '#000' : '#fff' }}
                >
                  <span>{c.label.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-90">{c.multiplier}X</span>
                </button>
              ))}
            </div>

            <div className="h-8 mt-3 flex items-center justify-center">
              {winMessage ? (
                <span className="text-sm font-extrabold font-display uppercase tracking-wide text-amber-300">
                  {winMessage}
                </span>
              ) : (
                <span className="text-xs text-slate-500">Pick Color & Spin Wheel</span>
              )}
            </div>

            <button
              disabled={isSpinning || user.coins < bet}
              onClick={handleSpin}
              className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                isSpinning || user.coins < bet
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-purple-500 via-amber-400 to-emerald-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-white/40 shadow-purple-500/20'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSpinning ? 'SPINNING...' : `SPIN COLOR (${bet.toLocaleString()})`}</span>
            </button>
          </div>
        );
      }}
    </GameShell>
  );
};
