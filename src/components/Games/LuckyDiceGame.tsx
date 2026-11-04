import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Dices, Sparkles } from 'lucide-react';

type DiceBet = 'low' | 'high' | 'seven' | 'doubles' | 'snake_eyes';

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const LuckyDiceGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [selectedBet, setSelectedBet] = useState<DiceBet>('seven');
  const [dice1, setDice1] = useState(3);
  const [dice2, setDice2] = useState(4);
  const [isRolling, setIsRolling] = useState(false);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Double Dice Payouts:</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Snake Eyes (1 & 1)</span>
          <span className="text-red-400 font-bold">20X Jackpot</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Lucky Seven (Sum = 7)</span>
          <span className="text-amber-400 font-bold">5X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Any Doubles (Matching pair)</span>
          <span className="text-emerald-400 font-bold">4X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>High (Sum 8-12) / Low (Sum 2-6)</span>
          <span className="text-blue-400 font-bold">2X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="lucky-dice" paytableInfo={paytableInfo}>
      {({ bet, setLastResult }) => {
        const handleRoll = () => {
          if (isRolling || user.coins < bet) return;

          setIsRolling(true);
          setWinMessage(null);
          soundEngine.playDiceRoll(soundEnabled);

          let ticks = 0;
          const interval = setInterval(() => {
            setDice1(Math.floor(Math.random() * 6) + 1);
            setDice2(Math.floor(Math.random() * 6) + 1);
            ticks++;

            if (ticks >= 12) {
              clearInterval(interval);

              const d1 = Math.floor(Math.random() * 6) + 1;
              const d2 = Math.floor(Math.random() * 6) + 1;
              const sum = d1 + d2;
              setDice1(d1);
              setDice2(d2);
              setIsRolling(false);

              let won = false;
              let multiplier = 0;
              let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' | 'LOSS' = 'LOSS';

              if (selectedBet === 'snake_eyes' && d1 === 1 && d2 === 1) {
                won = true;
                multiplier = 20;
                outcome = 'JACKPOT';
              } else if (selectedBet === 'seven' && sum === 7) {
                won = true;
                multiplier = 5;
                outcome = 'BIG_WIN';
              } else if (selectedBet === 'doubles' && d1 === d2) {
                won = true;
                multiplier = 4;
                outcome = 'BIG_WIN';
              } else if (selectedBet === 'high' && sum >= 8) {
                won = true;
                multiplier = 2;
                outcome = 'WIN';
              } else if (selectedBet === 'low' && sum <= 6) {
                won = true;
                multiplier = 2;
                outcome = 'WIN';
              }

              const payout = won ? Math.round(bet * multiplier) : 0;
              setLastResult({ payout, multiplier, outcome });

              if (won) {
                if (outcome === 'JACKPOT') {
                  soundEngine.playJackpot(soundEnabled);
                  fireJackpotConfetti();
                  setWinMessage(`SNAKE EYES JACKPOT! ${(payout + 500000).toLocaleString()} Coins!`);
                  recordGameSpin('lucky-dice', bet, payout + 500000, outcome, multiplier);
                } else if (outcome === 'BIG_WIN') {
                  soundEngine.playWin(soundEnabled, true);
                  fireCoinCelebration();
                  setWinMessage(`DICE WIN! ${multiplier}x (${payout.toLocaleString()} Coins)`);
                  recordGameSpin('lucky-dice', bet, payout, outcome, multiplier);
                } else {
                  soundEngine.playWin(soundEnabled, false);
                  setWinMessage(`WIN! +${payout.toLocaleString()} Coins`);
                  recordGameSpin('lucky-dice', bet, payout, outcome, multiplier);
                }
              } else {
                soundEngine.playReelStop(soundEnabled);
                setWinMessage(`Rolled ${sum} (${d1}+${d2}). Try again!`);
                recordGameSpin('lucky-dice', bet, 0, 'LOSS', 0);
              }
            }
          }, 80);
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-sm py-2">
            <div className="w-full bg-[#1b1109] p-5 rounded-3xl border-2 border-orange-500/40 shadow-[0_0_40px_rgba(249,115,22,0.25)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-orange-500/30">
                <div className="flex items-center gap-1.5">
                  <Dices className="w-5 h-5 text-orange-400" />
                  <span className="text-xs font-black tracking-widest text-orange-400 font-display">
                    VEGAS LUCKY DICE
                  </span>
                </div>
                <span className="text-xs font-bold text-amber-300">
                  SUM: {dice1 + dice2}
                </span>
              </div>

              {/* 3D Dice Display Box */}
              <div className="flex items-center justify-center gap-6 bg-[#0a0604] p-6 rounded-2xl border-2 border-orange-900/60 shadow-inner">
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-300 border-2 border-amber-400 shadow-xl flex items-center justify-center text-6xl text-slate-950 font-bold ${
                    isRolling ? 'rotate-12 scale-110' : 'rotate-0'
                  } transition-all duration-100`}
                >
                  {DICE_FACES[dice1 - 1]}
                </div>
                <div
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-300 border-2 border-amber-400 shadow-xl flex items-center justify-center text-6xl text-slate-950 font-bold ${
                    isRolling ? '-rotate-12 scale-110' : 'rotate-0'
                  } transition-all duration-100`}
                >
                  {DICE_FACES[dice2 - 1]}
                </div>
              </div>

              {/* Bet Choices */}
              <div className="grid grid-cols-3 gap-1.5 mt-4">
                {[
                  { id: 'low' as const, label: 'LOW (2-6)', mult: '2X' },
                  { id: 'seven' as const, label: 'LUCKY 7', mult: '5X' },
                  { id: 'high' as const, label: 'HIGH (8-12)', mult: '2X' },
                  { id: 'doubles' as const, label: 'DOUBLES', mult: '4X' },
                  { id: 'snake_eyes' as const, label: 'SNAKE 1-1', mult: '20X' },
                ].map((b) => (
                  <button
                    key={b.id}
                    disabled={isRolling}
                    onClick={() => {
                      soundEngine.playClick(soundEnabled);
                      setSelectedBet(b.id);
                    }}
                    className={`p-2 rounded-xl text-[11px] font-bold transition flex flex-col items-center justify-center border ${
                      selectedBet === b.id
                        ? 'bg-orange-500/30 border-orange-400 text-orange-300 ring-2 ring-orange-500/50'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{b.label}</span>
                    <span className="text-[10px] text-amber-400 font-extrabold">{b.mult}</span>
                  </button>
                ))}
              </div>

              <div className="h-8 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-orange-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Choose Bet Type & Roll Dice</span>
                )}
              </div>

              <button
                disabled={isRolling || user.coins < bet}
                onClick={handleRoll}
                className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                  isRolling || user.coins < bet
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-orange-200 shadow-orange-500/20'
                }`}
              >
                <Sparkles className="w-5 h-5" />
                <span>{isRolling ? 'ROLLING...' : `ROLL DICE (${bet.toLocaleString()})`}</span>
              </button>
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
