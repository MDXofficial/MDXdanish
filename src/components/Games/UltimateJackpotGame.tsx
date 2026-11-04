import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Trophy, Sparkles, Coins } from 'lucide-react';

interface CoinSpot {
  id: number;
  locked: boolean;
  value: number; // multiplier or direct coins
  jackpotName?: 'MINI' | 'MINOR' | 'MAJOR' | 'GRAND';
}

export const UltimateJackpotGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [spots, setSpots] = useState<CoinSpot[]>(
    Array.from({ length: 15 }, (_, i) => ({ id: i, locked: false, value: 0 }))
  );
  const [inBonus, setInBonus] = useState(false);
  const [respins, setRespins] = useState(3);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Grand Hold & Spin Arena (15 Spots):</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>GRAND JACKPOT (Fill 15 Spots)</span>
          <span className="text-yellow-400 font-bold">5,000X + 50,000,000 Coins</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>MAJOR JACKPOT</span>
          <span className="text-amber-400 font-bold">1,000X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>MINOR JACKPOT</span>
          <span className="text-blue-400 font-bold">200X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>MINI JACKPOT</span>
          <span className="text-emerald-400 font-bold">50X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="ultimate-jackpot" paytableInfo={paytableInfo}>
      {({ bet, setLastResult }) => {
        const startHoldAndSpin = () => {
          if (inBonus || user.coins < bet) return;

          soundEngine.playJackpot(soundEnabled);
          setInBonus(true);
          setRespins(3);
          setWinMessage('HOLD & SPIN! 3 Respins to collect Golden Coins');

          // Seed with 3 random locked golden coins
          const initial = Array.from({ length: 15 }, (_, i) => ({ id: i, locked: false, value: 0 }));
          const seededIndices = [2, 7, 11];
          seededIndices.forEach((idx) => {
            initial[idx] = {
              id: idx,
              locked: true,
              value: Math.floor(Math.random() * 5) + 2,
            };
          });
          setSpots(initial);
        };

        const spinHoldReels = () => {
          if (!inBonus || respins <= 0) return;

          soundEngine.playSpinTick(soundEnabled);
          let newCoinLanded = false;
          let landedJackpot: 'MINI' | 'MINOR' | 'MAJOR' | 'GRAND' | undefined;

          const updated = spots.map((spot) => {
            if (spot.locked) return spot;

            const chance = Math.random();
            if (chance < 0.28) {
              newCoinLanded = true;
              let val = Math.floor(Math.random() * 8) + 2;
              let jName: 'MINI' | 'MINOR' | 'MAJOR' | 'GRAND' | undefined;

              if (chance < 0.02) {
                jName = 'MAJOR';
                val = 1000;
              } else if (chance < 0.06) {
                jName = 'MINOR';
                val = 200;
              } else if (chance < 0.12) {
                jName = 'MINI';
                val = 50;
              }

              landedJackpot = jName;
              return {
                id: spot.id,
                locked: true,
                value: val,
                jackpotName: jName,
              };
            }
            return spot;
          });

          setSpots(updated);

          const lockedCount = updated.filter((s) => s.locked).length;

          if (lockedCount === 15) {
            // GRAND JACKPOT!
            setInBonus(false);
            soundEngine.playJackpot(soundEnabled);
            fireJackpotConfetti();

            const sumMultipliers = updated.reduce((acc, s) => acc + s.value, 0) + 5000;
            const payout = Math.round(bet * sumMultipliers) + 50000000;
            setWinMessage(`GRAND JACKPOT UNLOCKED! WON ${payout.toLocaleString()} COINS!`);
            recordGameSpin('ultimate-jackpot', bet, payout, 'JACKPOT', sumMultipliers);
            setLastResult({ payout, multiplier: sumMultipliers, outcome: 'JACKPOT' });
            return;
          }

          if (newCoinLanded) {
            soundEngine.playCoinClink(soundEnabled);
            setRespins(3);
            if (landedJackpot) {
              setWinMessage(`${landedJackpot} JACKPOT COIN HIT! Respins Reset to 3!`);
            } else {
              setWinMessage('Coin Locked! Respins Reset to 3!');
            }
          } else {
            const nextRespins = respins - 1;
            setRespins(nextRespins);

            if (nextRespins === 0) {
              // Round complete, tally coins
              setInBonus(false);
              const totalMult = updated.reduce((acc, s) => acc + s.value, 0);
              const payout = Math.round(bet * totalMult);
              let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' = 'WIN';

              if (totalMult >= 200) {
                outcome = 'JACKPOT';
                soundEngine.playJackpot(soundEnabled);
                fireJackpotConfetti();
                setWinMessage(`JACKPOT ARENA WIN! ${totalMult}x (${payout.toLocaleString()} Coins)`);
              } else if (totalMult >= 30) {
                outcome = 'BIG_WIN';
                soundEngine.playWin(soundEnabled, true);
                fireCoinCelebration();
                setWinMessage(`BIG HOLD WIN! ${totalMult}x (${payout.toLocaleString()} Coins)`);
              } else {
                soundEngine.playWin(soundEnabled, false);
                setWinMessage(`BONUS COMPLETE! ${totalMult}x (+${payout.toLocaleString()} Coins)`);
              }

              recordGameSpin('ultimate-jackpot', bet, payout, outcome, totalMult);
              setLastResult({ payout, multiplier: totalMult, outcome });
            } else {
              setWinMessage(`No coin landed. ${nextRespins} Respins left!`);
            }
          }
        };

        const totalLocked = spots.filter((s) => s.locked).length;

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-lg py-2">
            <div className="w-full bg-[#0a180e] p-4 sm:p-5 rounded-3xl border-2 border-emerald-500/50 shadow-[0_0_40px_rgba(74,222,128,0.25)]">
              {/* Header Ticker */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-black tracking-widest text-emerald-400 font-display">
                    ULTIMATE 50M GRAND POT
                  </span>
                </div>
                {inBonus ? (
                  <span className="text-xs font-black text-amber-300 animate-pulse">
                    RESPINS: {respins} / 3 | LOCKED: {totalLocked}/15
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">HOLD & SPIN BONUS</span>
                )}
              </div>

              {/* 5x3 Coin Matrix */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-[#030a05] p-2.5 sm:p-3 rounded-2xl border-2 border-emerald-900/60 shadow-inner">
                {spots.map((spot) => (
                  <div
                    key={spot.id}
                    className={`h-16 sm:h-20 rounded-xl flex flex-col items-center justify-center border transition-all ${
                      spot.locked
                        ? 'bg-gradient-to-b from-amber-500/40 via-yellow-400/20 to-black border-2 border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.4)] scale-100'
                        : 'bg-slate-900/80 border-slate-800 opacity-60'
                    }`}
                  >
                    {spot.locked ? (
                      <>
                        <span className="text-xl sm:text-2xl">🪙</span>
                        <span className="text-[10px] font-black text-amber-300 mt-0.5">
                          {spot.jackpotName ? spot.jackpotName : `${spot.value}X`}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-700">·</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="h-9 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-emerald-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Trigger Hold & Spin for 50M Grand Pot</span>
                )}
              </div>

              {inBonus ? (
                <button
                  disabled={respins <= 0}
                  onClick={spinHoldReels}
                  className="w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-yellow-200 shadow-amber-500/30"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>RESPIN REELS ({respins} LEFT)</span>
                </button>
              ) : (
                <button
                  disabled={user.coins < bet}
                  onClick={startHoldAndSpin}
                  className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                    user.coins < bet
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-emerald-500 via-green-400 to-amber-400 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-green-300 shadow-emerald-500/30'
                  }`}
                >
                  <Coins className="w-5 h-5" />
                  <span>ENTER JACKPOT ARENA ({bet.toLocaleString()})</span>
                </button>
              )}
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
