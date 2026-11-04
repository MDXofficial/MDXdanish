import React, { useState } from 'react';
import { GameId } from '../../types';
import { useGame } from '../../context/GameContext';
import { soundEngine } from '../../utils/audio';
import { ArrowLeft, Volume2, VolumeX, Info, Coins, Sparkles, RefreshCw } from 'lucide-react';

interface GameShellProps {
  gameId: GameId;
  children: (props: {
    bet: number;
    isSpinning: boolean;
    setIsSpinning: (spinning: boolean) => void;
    lastResult: { payout: number; multiplier: number; outcome: string } | null;
    setLastResult: (res: { payout: number; multiplier: number; outcome: string } | null) => void;
  }) => React.ReactNode;
  paytableInfo: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({ gameId, children, paytableInfo }) => {
  const { games, user, addCoins, setActiveGame, soundEnabled, toggleSound } = useGame();
  const game = games.find((g) => g.id === gameId);

  const minBet = game ? game.minBet : 500;
  const maxBet = game ? game.maxBet : 50000;

  const [bet, setBet] = useState(minBet);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [lastResult, setLastResult] = useState<{
    payout: number;
    multiplier: number;
    outcome: string;
  } | null>(null);

  const betPresets = [
    minBet,
    Math.round(minBet * 2),
    Math.round(minBet * 5),
    Math.round(minBet * 10),
    maxBet,
  ].filter((v, idx, arr) => arr.indexOf(v) === idx && v <= maxBet);

  const handleBack = () => {
    soundEngine.playClick(soundEnabled);
    setActiveGame(null);
  };

  const handleQuickFaucet = () => {
    soundEngine.playCoinClink(soundEnabled);
    addCoins(25000);
  };

  if (!game) return null;

  return (
    <div className="flex flex-col min-h-[640px] w-full bg-[#090a0d] border border-amber-500/20 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Game Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-black via-[#111319] to-black border-b border-amber-500/20 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-400 text-xs font-semibold transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LOBBY</span>
          </button>
          <div>
            <h2 className="text-base font-extrabold text-amber-400 font-display tracking-wide flex items-center gap-1.5">
              {game.name}
              {game.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {game.badge}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>RTP: {game.rtp}%</span>
              <span>·</span>
              <span className="text-amber-300 font-medium">
                POT: {game.jackpotAmount.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition"
            title="Paytable & Rules"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Paytable Dropdown / Overlay */}
      {showInfo && (
        <div className="absolute inset-x-0 top-[57px] bottom-[80px] bg-black/95 backdrop-blur-md z-30 p-4 overflow-y-auto border-b border-amber-500/30">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-amber-400 font-display">PAYTABLE & GAME RULES</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
              >
                Close
              </button>
            </div>
            {paytableInfo}
          </div>
        </div>
      )}

      {/* Game Stage Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 relative overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#171923] via-[#0b0c10] to-[#050608]">
        {children({
          bet,
          isSpinning,
          setIsSpinning,
          lastResult,
          setLastResult,
        })}
      </div>

      {/* Game Bottom Control Bar */}
      <div className="bg-[#0b0c12] border-t border-amber-500/20 px-4 py-3 z-20">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-4xl mx-auto">
          {/* User Balance & Free Refill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
              <Coins className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BALANCE</span>
                <span className="text-sm font-black text-amber-300 font-display tabular-nums">
                  {user.coins.toLocaleString()}
                </span>
              </div>
            </div>
            {user.coins < minBet && (
              <button
                onClick={handleQuickFaucet}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-400 text-xs font-bold animate-pulse hover:bg-emerald-500/30 transition"
                title="Get 25,000 free coins"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+25K FREE</span>
              </button>
            )}
          </div>

          {/* Bet Selector Controls */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 uppercase hidden sm:inline">BET:</span>
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              {betPresets.map((preset) => (
                <button
                  key={preset}
                  disabled={isSpinning}
                  onClick={() => {
                    soundEngine.playClick(soundEnabled);
                    setBet(preset);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition tabular-nums ${
                    bet === preset
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {preset >= 1000 ? `${preset / 1000}k` : preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
