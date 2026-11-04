import React from 'react';
import { useGame } from '../../context/GameContext';
import { History, Play, Sparkles } from 'lucide-react';

export const HistoryView: React.FC = () => {
  const { history, setActiveTab } = useGame();

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-amber-400 font-display flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            GAMEPLAY HISTORY
          </h2>
          <p className="text-xs text-slate-400">Audit log of your recent 50 spins & rounds</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
          <span className="text-4xl block">🎰</span>
          <h3 className="text-sm font-bold text-white">No Game History Yet</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Choose any of the 15 games in the lobby to start spinning and record your wins!
          </p>
          <button
            onClick={() => setActiveTab('home')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider hover:brightness-110 transition shadow-md"
          >
            Explore 15 Games
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => {
            const isJackpot = item.outcome === 'JACKPOT';
            const isBigWin = item.outcome === 'BIG_WIN';
            const isWin = item.outcome === 'WIN';
            const net = item.payout - item.bet;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
                  isJackpot
                    ? 'bg-amber-500/20 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                    : isBigWin
                    ? 'bg-emerald-950/30 border-emerald-500/40'
                    : isWin
                    ? 'bg-slate-900/90 border-slate-800'
                    : 'bg-slate-900/50 border-slate-800/80 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base ${
                      isJackpot
                        ? 'bg-yellow-400 text-black'
                        : isBigWin || isWin
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isJackpot ? '👑' : isBigWin ? '💎' : isWin ? '🪙' : '🎲'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {item.gameName}
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                          isJackpot
                            ? 'bg-yellow-400 text-black'
                            : isBigWin
                            ? 'bg-emerald-500 text-black'
                            : isWin
                            ? 'bg-slate-700 text-slate-200'
                            : 'bg-red-950 text-red-400'
                        }`}
                      >
                        {item.outcome}
                      </span>
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Bet: {item.bet.toLocaleString()} · Mult: {item.multiplier}x
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black font-mono tabular-nums ${
                      net > 0 ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {net > 0 ? `+${net.toLocaleString()}` : `-${item.bet.toLocaleString()}`}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
