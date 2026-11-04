import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Pickaxe, Sparkles, RefreshCw } from 'lucide-react';

interface Cart {
  id: number;
  revealed: boolean;
  value: number; // multiplier
  type: 'nugget' | 'gold_bar' | 'gem' | 'dynamite';
}

export const GoldRushGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [picksLeft, setPicksLeft] = useState(0);
  const [totalMultiplier, setTotalMultiplier] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Excavate 3 Minecarts:</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🧨 Dynamite Blast</span>
          <span className="text-amber-400 font-bold">15X - 30X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>💎 Diamond Vein</span>
          <span className="text-cyan-400 font-bold">10X - 20X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🪙 Pure Gold Nugget</span>
          <span className="text-yellow-400 font-bold">3X - 8X</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>🪨 Silver Ore</span>
          <span className="text-slate-400 font-bold">1X - 2X</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="gold-rush" paytableInfo={paytableInfo}>
      {({ bet, isSpinning, setIsSpinning, setLastResult }) => {
        const startExcavation = () => {
          if (roundActive || user.coins < bet) return;

          soundEngine.playDiceRoll(soundEnabled);
          setRoundActive(true);
          setPicksLeft(3);
          setTotalMultiplier(0);
          setWinMessage('Select 3 Minecarts to dig!');

          // Pre-generate 6 carts
          const pool: Cart[] = [
            { id: 1, revealed: false, value: Math.floor(Math.random() * 8) + 3, type: 'nugget' as const },
            { id: 2, revealed: false, value: Math.floor(Math.random() * 10) + 5, type: 'gem' as const },
            { id: 3, revealed: false, value: Math.floor(Math.random() * 15) + 10, type: 'dynamite' as const },
            { id: 4, revealed: false, value: Math.floor(Math.random() * 5) + 2, type: 'gold_bar' as const },
            { id: 5, revealed: false, value: Math.floor(Math.random() * 8) + 4, type: 'nugget' as const },
            { id: 6, revealed: false, value: Math.floor(Math.random() * 20) + 12, type: 'dynamite' as const },
          ].sort(() => Math.random() - 0.5);

          setCarts(pool);
        };

        const pickCart = (id: number) => {
          if (!roundActive || picksLeft <= 0) return;

          const cart = carts.find((c) => c.id === id);
          if (!cart || cart.revealed) return;

          soundEngine.playCoinClink(soundEnabled);
          const updated = carts.map((c) => (c.id === id ? { ...c, revealed: true } : c));
          setCarts(updated);

          const newTotal = totalMultiplier + cart.value;
          setTotalMultiplier(newTotal);
          const newPicks = picksLeft - 1;
          setPicksLeft(newPicks);

          if (newPicks === 0) {
            setRoundActive(false);
            const payout = Math.round(bet * newTotal);
            let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' = 'WIN';

            if (newTotal >= 30) {
              outcome = 'JACKPOT';
              soundEngine.playJackpot(soundEnabled);
              fireJackpotConfetti();
              setWinMessage(`GOLD STRIKE JACKPOT! ${newTotal}x (${payout.toLocaleString()} Coins)`);
            } else if (newTotal >= 15) {
              outcome = 'BIG_WIN';
              soundEngine.playWin(soundEnabled, true);
              fireCoinCelebration();
              setWinMessage(`BIG VEIN WIN! ${newTotal}x (${payout.toLocaleString()} Coins)`);
            } else {
              soundEngine.playWin(soundEnabled, false);
              setWinMessage(`DIG WIN! ${newTotal}x (+${payout.toLocaleString()} Coins)`);
            }

            recordGameSpin('gold-rush', bet, payout, outcome, newTotal);
            setLastResult({ payout, multiplier: newTotal, outcome });
          }
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-md py-2">
            <div className="w-full bg-[#181309] p-4 sm:p-5 rounded-3xl border-2 border-amber-600/40 shadow-[0_0_40px_rgba(245,158,11,0.25)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-600/30">
                <div className="flex items-center gap-1.5">
                  <Pickaxe className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-black tracking-widest text-amber-400 font-display">
                    GOLD RUSH MINECARTS
                  </span>
                </div>
                {roundActive ? (
                  <span className="text-xs font-extrabold text-amber-300">
                    PICKS: {picksLeft} | MULT: {totalMultiplier}x
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">EXCAVATE NUGGETS</span>
                )}
              </div>

              {/* 6 Minecarts Grid */}
              <div className="grid grid-cols-3 gap-3 bg-[#0a0804] p-4 rounded-2xl border border-amber-900/50 shadow-inner">
                {roundActive || carts.length > 0 ? (
                  carts.map((cart) => (
                    <button
                      key={cart.id}
                      disabled={!roundActive || cart.revealed}
                      onClick={() => pickCart(cart.id)}
                      className={`h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                        cart.revealed
                          ? 'bg-amber-950/60 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                          : roundActive
                          ? 'bg-slate-900/90 border-amber-700/60 hover:scale-105 active:scale-95 cursor-pointer shadow-md'
                          : 'bg-slate-900/40 border-slate-800 opacity-60'
                      }`}
                    >
                      {cart.revealed ? (
                        <>
                          <span className="text-2xl">
                            {cart.type === 'dynamite' ? '🧨' : cart.type === 'gem' ? '💎' : '🪙'}
                          </span>
                          <span className="text-xs font-black text-amber-300 mt-1">
                            +{cart.value}X
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-3xl">🛒</span>
                          <span className="text-[10px] text-amber-400/80 font-bold uppercase mt-1">
                            CART #{cart.id}
                          </span>
                        </>
                      )}
                    </button>
                  ))
                ) : (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center opacity-70"
                    >
                      <span className="text-3xl">🛒</span>
                      <span className="text-[10px] text-slate-400 mt-1">LOCKED</span>
                    </div>
                  ))
                )}
              </div>

              <div className="h-9 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-sm font-extrabold font-display uppercase tracking-wide text-amber-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Tap Start to Begin Excavation</span>
                )}
              </div>

              {!roundActive && (
                <button
                  disabled={user.coins < bet}
                  onClick={startExcavation}
                  className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                    user.coins < bet
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-amber-200 shadow-amber-500/20'
                  }`}
                >
                  <Pickaxe className="w-5 h-5" />
                  <span>START EXCAVATION ({bet.toLocaleString()})</span>
                </button>
              )}
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
