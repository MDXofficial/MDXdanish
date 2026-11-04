import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { RefreshCw, Sparkles } from 'lucide-react';

const OUTER_SEGMENTS = [2, 5, 3, 10, 4, 15, 2, 25];
const INNER_BOOSTS = [1, 2, 3, 5];

export const SuperSpinnerGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [outerRot, setOuterRot] = useState(0);
  const [innerRot, setInnerRot] = useState(0);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Dual Concentric Ring Mechanics:</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Outer Ring Multipliers</span>
          <span className="text-cyan-400 font-bold">2X up to 25X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Inner Ring Power Boost</span>
          <span className="text-amber-400 font-bold">1X, 2X, 3X, 5X Booster</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Combined Grand Total</span>
          <span className="text-emerald-400 font-bold">Outer X Inner (Up to 125X!)</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="super-spinner" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const handleSpin = () => {
          if (isSpinning || user.coins < bet) return;

          setIsSpinning(true);
          setWinMessage(null);
          soundEngine.playSpinTick(soundEnabled);

          const randOuter = Math.random();
          let outerIdx = 0;
          if (randOuter < 0.08) outerIdx = 7; // 25X
          else if (randOuter < 0.2) outerIdx = 5; // 15X
          else if (randOuter < 0.4) outerIdx = 3; // 10X
          else outerIdx = Math.floor(Math.random() * 3);

          const randInner = Math.random();
          let innerIdx = 0;
          if (randInner < 0.1) innerIdx = 3; // 5x boost
          else if (randInner < 0.3) innerIdx = 2; // 3x boost
          else if (randInner < 0.6) innerIdx = 1; // 2x boost
          else innerIdx = 0; // 1x

          const outerAngle = 360 - (outerIdx * 45 + 22.5);
          const innerAngle = 360 - (innerIdx * 90 + 45);

          const newOuterRot = outerRot + 360 * 5 + outerAngle - (outerRot % 360);
          const newInnerRot = innerRot - (360 * 6 + innerAngle - (innerRot % 360));

          setOuterRot(newOuterRot);
          setInnerRot(newInnerRot);

          const tickInterval = setInterval(() => {
            soundEngine.playSpinTick(soundEnabled);
          }, 110);

          setTimeout(() => {
            clearInterval(tickInterval);
            setIsSpinning(false);

            const outerVal = OUTER_SEGMENTS[outerIdx];
            const innerVal = INNER_BOOSTS[innerIdx];
            const totalMult = outerVal * innerVal;
            const payout = Math.round(bet * totalMult);

            let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' = 'WIN';
            if (totalMult >= 50) {
              outcome = 'JACKPOT';
              soundEngine.playJackpot(soundEnabled);
              fireJackpotConfetti();
              setWinMessage(`SUPER SPINNER JACKPOT! ${totalMult}x (${payout.toLocaleString()} Coins)`);
            } else if (totalMult >= 15) {
              outcome = 'BIG_WIN';
              soundEngine.playWin(soundEnabled, true);
              fireCoinCelebration();
              setWinMessage(`BOOSTED WIN! ${totalMult}x (${payout.toLocaleString()} Coins)`);
            } else {
              soundEngine.playWin(soundEnabled, false);
              setWinMessage(`WIN! ${totalMult}x (+${payout.toLocaleString()} Coins)`);
            }

            recordGameSpin('super-spinner', bet, payout, outcome, totalMult);
            setLastResult({ payout, multiplier: totalMult, outcome });
          }, 3300);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-sm py-2">
            {/* Top Pointer */}
            <div className="relative z-20 -mb-4 flex flex-col items-center">
              <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-cyan-400 filter drop-shadow-[0_2px_8px_rgba(6,182,212,0.8)]" />
            </div>

            {/* Dual Concentric Wheel */}
            <div className="w-72 h-72 rounded-full p-2 bg-gradient-to-tr from-cyan-600 via-sky-300 to-blue-800 shadow-[0_0_35px_rgba(6,182,212,0.35)] relative flex items-center justify-center">
              {/* Outer Ring */}
              <div
                className="w-full h-full rounded-full relative overflow-hidden transition-transform duration-[3300ms] cubic-bezier(0.15,0.9,0.2,1)"
                style={{
                  transform: `rotate(${outerRot}deg)`,
                  background: 'conic-gradient(#082f49 0deg 45deg, #0369a1 45deg 90deg, #0c4a6e 90deg 135deg, #0284c7 135deg 180deg, #082f49 180deg 225deg, #0369a1 225deg 270deg, #0c4a6e 270deg 315deg, #0284c7 315deg 360deg)',
                }}
              >
                {OUTER_SEGMENTS.map((val, idx) => (
                  <div
                    key={idx}
                    className="absolute w-full h-full flex justify-center pt-2"
                    style={{ transform: `rotate(${idx * 45 + 22.5}deg)` }}
                  >
                    <span className="text-xs font-black text-cyan-200">{val}X</span>
                  </div>
                ))}
              </div>

              {/* Inner Ring (Power Booster) */}
              <div
                className="absolute w-36 h-36 rounded-full border-4 border-amber-400 shadow-xl overflow-hidden transition-transform duration-[3300ms] cubic-bezier(0.15,0.9,0.2,1)"
                style={{
                  transform: `rotate(${innerRot}deg)`,
                  background: 'conic-gradient(#78350f 0deg 90deg, #d97706 90deg 180deg, #92400e 180deg 270deg, #b45309 270deg 360deg)',
                }}
              >
                {INNER_BOOSTS.map((val, idx) => (
                  <div
                    key={idx}
                    className="absolute w-full h-full flex justify-center pt-1.5"
                    style={{ transform: `rotate(${idx * 90 + 45}deg)` }}
                  >
                    <span className="text-[11px] font-black text-amber-200">BOOST {val}X</span>
                  </div>
                ))}
              </div>

              {/* Center Core */}
              <div className="absolute w-12 h-12 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-lg z-10">
                <RefreshCw className="w-5 h-5 text-cyan-300" />
              </div>
            </div>

            <div className="h-8 mt-3 flex items-center justify-center">
              {winMessage ? (
                <span className="text-sm font-extrabold font-display uppercase tracking-wide text-cyan-300">
                  {winMessage}
                </span>
              ) : (
                <span className="text-xs text-slate-500">Outer Multiplier X Inner Booster</span>
              )}
            </div>

            <button
              disabled={isSpinning || user.coins < bet}
              onClick={handleSpin}
              className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                isSpinning || user.coins < bet
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-400 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-cyan-200 shadow-cyan-500/20'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>{isSpinning ? 'SPINNING...' : `SPIN DUAL RING (${bet.toLocaleString()})`}</span>
            </button>
          </div>
        );
      }}
    </GameShell>
  );
};
