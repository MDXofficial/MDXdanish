import React, { useState } from 'react';
import { GameShell } from './GameShell';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { fireJackpotConfetti, fireCoinCelebration } from '../../utils/confetti';
import { Compass, Sparkles, Skull, CheckCircle } from 'lucide-react';

interface Tile {
  id: number;
  revealed: boolean;
  isSkull: boolean;
  value: number; // multiplier increment
  icon: string;
}

export const TreasureHuntGame: React.FC = () => {
  const { user, recordGameSpin, soundEnabled } = useGame();
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [inRound, setInRound] = useState(false);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [tilesOpened, setTilesOpened] = useState(0);
  const [winMessage, setWinMessage] = useState<string | null>(null);

  const paytableInfo = (
    <div className="space-y-2 text-xs text-slate-300">
      <p className="text-slate-400">Aztec Temple Grid (5x5):</p>
      <div className="space-y-1.5">
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>Uncover Relics (🎭, 🗿, 🏆, 🪙)</span>
          <span className="text-emerald-400 font-bold">+0.4x to +2.5x each</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>💀 Skull Traps (3 hidden)</span>
          <span className="text-red-400 font-bold">Temple Collapse (Bust)</span>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
          <span>CASH OUT Button</span>
          <span className="text-amber-400 font-bold">Bank winnings anytime!</span>
        </div>
      </div>
    </div>
  );

  return (
    <GameShell gameId="treasure-hunt" paytableInfo={paytableInfo}>
      {({ bet, setLastResult }) => {
        const startHunt = () => {
          if (inRound || user.coins < bet) return;

          soundEngine.playDiceRoll(soundEnabled);
          setInRound(true);
          setCurrentMultiplier(1.0);
          setTilesOpened(0);
          setWinMessage('Tap tiles to find Aztec Gold. Cash out anytime!');

          // Create 25 tiles with 3 skulls
          const skullPositions = new Set<number>();
          while (skullPositions.size < 3) {
            skullPositions.add(Math.floor(Math.random() * 25));
          }

          const RELIC_ICONS = ['🎭', '🗿', '🏆', '🪙', '✨'];
          const initialTiles: Tile[] = Array.from({ length: 25 }, (_, idx) => {
            const isSkull = skullPositions.has(idx);
            const icon = isSkull ? '💀' : RELIC_ICONS[idx % RELIC_ICONS.length];
            return {
              id: idx,
              revealed: false,
              isSkull,
              value: isSkull ? 0 : 0.4 + (idx % 4) * 0.3,
              icon,
            };
          });

          setTiles(initialTiles);
        };

        const handleTileClick = (id: number) => {
          if (!inRound) return;
          const target = tiles.find((t) => t.id === id);
          if (!target || target.revealed) return;

          const updated = tiles.map((t) => (t.id === id ? { ...t, revealed: true } : t));
          setTiles(updated);

          if (target.isSkull) {
            // Bust
            soundEngine.playReelStop(soundEnabled);
            setInRound(false);
            setWinMessage('TEMPLE TRAP! Cursed skull was uncovered.');
            recordGameSpin('treasure-hunt', bet, 0, 'LOSS', 0);
            setLastResult({ payout: 0, multiplier: 0, outcome: 'LOSS' });
          } else {
            soundEngine.playCoinClink(soundEnabled);
            const nextMult = parseFloat((currentMultiplier + target.value).toFixed(2));
            setCurrentMultiplier(nextMult);
            setTilesOpened((prev) => prev + 1);
            setWinMessage(`Current: ${nextMult}x (${Math.round(bet * nextMult).toLocaleString()} Coins)`);
          }
        };

        const handleCashOut = () => {
          if (!inRound || tilesOpened === 0) return;

          setInRound(false);
          const payout = Math.round(bet * currentMultiplier);
          let outcome: 'WIN' | 'BIG_WIN' | 'JACKPOT' = 'WIN';

          if (currentMultiplier >= 15) {
            outcome = 'JACKPOT';
            soundEngine.playJackpot(soundEnabled);
            fireJackpotConfetti();
            setWinMessage(`EXPEDITION JACKPOT! ${currentMultiplier}x (${payout.toLocaleString()} Coins)`);
          } else if (currentMultiplier >= 5) {
            outcome = 'BIG_WIN';
            soundEngine.playWin(soundEnabled, true);
            fireCoinCelebration();
            setWinMessage(`TREASURE ESCAPED! ${currentMultiplier}x (${payout.toLocaleString()} Coins)`);
          } else {
            soundEngine.playWin(soundEnabled, false);
            setWinMessage(`CASHED OUT! ${currentMultiplier}x (+${payout.toLocaleString()} Coins)`);
          }

          recordGameSpin('treasure-hunt', bet, payout, outcome, currentMultiplier);
          setLastResult({ payout, multiplier: currentMultiplier, outcome });
        };

        return (
          <div className="flex flex-col items-center justify-center w-full max-w-md py-2">
            <div className="w-full bg-[#0d1612] p-4 sm:p-5 rounded-3xl border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-1.5">
                  <Compass className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-black tracking-widest text-emerald-400 font-display">
                    TREASURE HUNT 5x5
                  </span>
                </div>
                {inRound ? (
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    MULT: {currentMultiplier}x
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">UNCOVER RELICS</span>
                )}
              </div>

              {/* 5x5 Grid */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 bg-[#040806] p-2.5 rounded-2xl border border-emerald-900/50 shadow-inner">
                {tiles.length > 0
                  ? tiles.map((tile) => (
                      <button
                        key={tile.id}
                        disabled={!inRound || tile.revealed}
                        onClick={() => handleTileClick(tile.id)}
                        className={`h-11 sm:h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                          tile.revealed
                            ? tile.isSkull
                              ? 'bg-red-950/80 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                              : 'bg-emerald-950/70 border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                            : inRound
                            ? 'bg-slate-900/90 border border-emerald-700/60 hover:scale-105 active:scale-95 cursor-pointer shadow-md'
                            : 'bg-slate-900/40 border border-slate-800 opacity-60'
                        }`}
                      >
                        {tile.revealed ? (
                          <span>{tile.icon}</span>
                        ) : (
                          <span className="text-xs text-emerald-500/70">🏛️</span>
                        )}
                      </button>
                    ))
                  : Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-11 sm:h-12 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-center opacity-70"
                      >
                        <span className="text-xs text-slate-600">🏛️</span>
                      </div>
                    ))}
              </div>

              <div className="h-8 mt-3 flex items-center justify-center">
                {winMessage ? (
                  <span className="text-xs sm:text-sm font-extrabold font-display uppercase tracking-wide text-emerald-300">
                    {winMessage}
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Tap Enter Temple to Begin</span>
                )}
              </div>

              {inRound ? (
                <button
                  disabled={tilesOpened === 0}
                  onClick={handleCashOut}
                  className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                    tilesOpened === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-yellow-200 shadow-amber-500/30'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    CASH OUT ({Math.round(bet * currentMultiplier).toLocaleString()} COINS)
                  </span>
                </button>
              ) : (
                <button
                  disabled={user.coins < bet}
                  onClick={startHunt}
                  className={`w-full mt-2 py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-xl ${
                    user.coins < bet
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 text-slate-950 hover:brightness-110 active:scale-[0.98] border border-green-300 shadow-emerald-500/20'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>ENTER TEMPLE ({bet.toLocaleString()})</span>
                </button>
              )}
            </div>
          </div>
        );
      }}
    </GameShell>
  );
};
