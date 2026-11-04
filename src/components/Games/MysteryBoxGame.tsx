import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Package, Sparkles } from 'lucide-react';

interface Box {
  id: number;
  revealed: boolean;
  multiplier: number;
}

export const MysteryBoxGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [inRound, setInRound] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState<number | null>(null);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">5 High-Roller Golden Vaults:</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Grand Vault #1</span>
          <span className="text-pink-400 font-bold">50X Grand Prize</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Diamond Vault</span>
          <span className="text-cyan-400 font-bold">25X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Gold Vault</span>
          <span className="text-amber-400 font-bold">10X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Silver & Bronze Vaults</span>
          <span className="text-slate-300 font-bold">2X - 5X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="mystery-box" paytableInfo={paytableInfo}>
      {({ bet, setLastResult }) => {
        const startRound = () => {
          if (inRound || user.coins < bet) return;

          soundEngine.playSpinTick(soundEnabled);
          setInRound(true);
          setSelectedBoxId(null);
          setWinMessage('Select 1 of the 5 Golden Vaults!');

          const multipliers = [2, 5, 10, 25, 50].sort(() => Math.random() - 0.5);
          setBoxes(
            multipliers.map((mult, idx) => ({
              id: idx + 1,
              revealed: false,
              multiplier: mult,
            }))
          );
        };

        const pickBox = (id: number) => {
          if (!inRound || selectedBoxId !== null) return;

          setSelectedBoxId(id);
          soundEngine.playCoinClink(soundEnabled);

          setTimeout(() => {
            // Reveal all boxes
            const chosen = boxes.find((b) => b.id === id)!;
            const updated = boxes.map((b) => ({ ...b, revealed: true }));
            setBoxes(updated);
            setInRound(false);

            const mult = chosen.multiplier;
            const payout = Math.round(bet * mult);
            let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' = 'WIN';

            if (mult >= 50) {
              outcome = 'JACKPOT';
              soundEngine.playJackpot(soundEnabled);
              fireJackpotConfetti();
              setWinMessage(`50X GRAND VAULT HIT! ${(payout + 800000).toLocaleString()} Coins!`);
            } else if (mult >= 10) {
              outcome = 'BIG_WIN';
              soundEngine.playWin(soundEnabled, true);
              fireCoinCelebration();
              setWinMessage(`VAULT WIN! ${mult}x (${payout.toLocaleString()} Coins)`);
            } else {
              soundEngine.playWin(soundEnabled, false);
              setWinMessage(`UNLOCKED! ${mult}x (+${payout.toLocaleString()} Coins)`);
            }

            recordGameSpin('mystery-box', bet, payout, outcome, mult);
            setLastResult({ payout, multiplier: mult, outcome });
          }, 800);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-md py-2">
            <div className="w-full bg-[#1c0d16] p-4 sm:p-5 rounded-3xl border-2 border-pink-500/40 shadow-[0_0_40px_rgba(236,72,153,0.25)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-pink-500/30">
                <div className="flex items-center gap-1.5">
                  <Package className="w-5 h-5 text-pink-400" />
                  <span className="text-xs font-black tracking-widest text-pink-400 font-display">
                    MYSTERY GOLD VAULTS
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-300">UP TO 50X</span>
              </div>

              {/* 5 Vaults Grid */}
              <div className="grid grid-cols-5 gap-2 bg-[#090306] p-3 rounded-2xl border border-pink-900/50 shadow-inner">
                {boxes.length > 0
                  ? boxes.map((box) => (
                      <button
                        key={box.id}
                        disabled={!inRound || selectedBoxId !== null}
                        onClick={() => pickBox(box.id)}
                        className={`h-24 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                          box.revealed
                            ? box.id === selectedBoxId
                              ? 'bg-gradient-to-b from-amber-500/40 to-pink-500/30 border-2 border-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-105'
                              : 'bg-slate-900/60 border-slate-800 opacity-60'
                            : inRound
                            ? 'bg-slate-900 border-pink-700/60 hover:scale-105 active:scale-95 cursor-pointer shadow-md animate-pulse'
                            : 'bg-slate-900/40 border-slate-800 opacity-60'
                        }`}
                      >
                        {box.revealed ? (
                          <>
                            <span className="text-2xl">💰</span>
                            <span className="text-xs font-black text-amber-300 mt-1">
                              {box.multiplier}X
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-3xl select-none">🎁</span>
                            <span className="text-[10px] text-pink-400 font-bold uppercase mt-1">
                              #{box.id}
                            </span>
                          </>
                        )}
                      </button>
                    ))
                  : Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-24 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center opacity-70"
                      >
                        <span className="text-3xl">🎁</span>
                        <span className="text-[10px] text-slate-400 mt-1">LOCKED</span>
                      </div>
                    ))}
              </div>

              <div className="h-8 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-pink-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Pick 1 Box to Reveal Vault Prize</span>
                )}
              </div>

              {!inRound && (
                <button
                  disabled={user.coins < bet}
                  onClick={startRound}
                  className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                    user.coins < bet
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-pink-500 via-rose-400 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-pink-200 shadow-pink-500/20'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>START VAULT PICK ({bet.toLocaleString()})</span>
                </button>
              )}
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
