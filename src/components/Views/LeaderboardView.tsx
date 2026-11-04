import React from 'react';
import { useGame } from '../../context/GameContext';
import { Trophy, Medal, Crown, Star } from 'lucide-react';

export const LeaderboardView: React.FC = () => {
  const { leaderboard, user } = useGame();

  return (
    <div className="space-y-4 pb-20 max-w-2xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-black text-amber-400 font-display flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            GLOBAL VIP LEADERBOARD
          </h2>
          <p className="text-xs text-slate-400">Top Virtual High-Rollers & Champions</p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-2 pt-4 pb-2 items-end">
        {/* 2nd Place */}
        {leaderboard[1] && (
          <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-slate-700 text-center">
            <div className="w-6 h-6 rounded-full bg-slate-400 text-black text-xs font-black flex items-center justify-center mb-1">
              2
            </div>
            <span className="text-3xl my-1">{leaderboard[1].avatar}</span>
            <span className="text-xs font-bold text-white truncate max-w-full">
              {leaderboard[1].username}
            </span>
            <span className="text-[11px] font-black text-amber-400 font-mono mt-0.5">
              {(leaderboard[1].coins / 1000000).toFixed(1)}M
            </span>
          </div>
        )}

        {/* 1st Place (Winner) */}
        {leaderboard[0] && (
          <div className="flex flex-col items-center p-4 rounded-3xl bg-gradient-to-b from-amber-500/30 via-yellow-500/10 to-slate-900 border-2 border-amber-400 text-center shadow-[0_0_30px_rgba(245,158,11,0.3)] -translate-y-2">
            <Crown className="w-6 h-6 text-yellow-300 mb-0.5" />
            <div className="w-6 h-6 rounded-full bg-yellow-400 text-black text-xs font-black flex items-center justify-center mb-1">
              1
            </div>
            <span className="text-4xl my-1">{leaderboard[0].avatar}</span>
            <span className="text-xs font-black text-white truncate max-w-full">
              {leaderboard[0].username}
            </span>
            <span className="text-xs font-black text-yellow-300 font-mono mt-0.5">
              {(leaderboard[0].coins / 1000000).toFixed(1)}M
            </span>
          </div>
        )}

        {/* 3rd Place */}
        {leaderboard[2] && (
          <div className="flex flex-col items-center p-3 rounded-2xl bg-slate-900/80 border border-amber-900/50 text-center">
            <div className="w-6 h-6 rounded-full bg-amber-700 text-white text-xs font-black flex items-center justify-center mb-1">
              3
            </div>
            <span className="text-3xl my-1">{leaderboard[2].avatar}</span>
            <span className="text-xs font-bold text-white truncate max-w-full">
              {leaderboard[2].username}
            </span>
            <span className="text-[11px] font-black text-amber-400 font-mono mt-0.5">
              {(leaderboard[2].coins / 1000000).toFixed(1)}M
            </span>
          </div>
        )}
      </div>

      {/* Ranks list */}
      <div className="space-y-2">
        {leaderboard.map((player) => (
          <div
            key={`${player.rank}-${player.username}`}
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition ${
              player.isCurrentUser
                ? 'bg-amber-500/15 border-amber-400/80 ring-1 ring-amber-400 shadow-md'
                : 'bg-slate-900/80 border-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-black font-mono text-xs text-slate-400">
                #{player.rank}
              </span>
              <span className="text-2xl">{player.avatar}</span>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  {player.username}
                  {player.isCurrentUser && (
                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-black">
                      YOU
                    </span>
                  )}
                </h4>
                <span className="text-[10px] text-amber-400 font-semibold uppercase">
                  {player.vipTier} VIP
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-black text-amber-300 font-mono tabular-nums">
                {player.coins.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 block">VIRTUAL COINS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
