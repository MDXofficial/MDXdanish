import React from 'react';
import { useGame } from '../context/GameContext';
import { soundEngine } from '../utils/audio';
import { Gamepad2, Gift, Trophy, History, User } from 'lucide-react';

export const Navigation: React.FC<{ onOpenProfile: () => void }> = ({ onOpenProfile }) => {
  const { activeTab, setActiveTab, soundEnabled, dailyMissions } = useGame();

  const handleTab = (tab: 'home' | 'missions' | 'leaderboard' | 'history' | 'profile') => {
    soundEngine.playClick(soundEnabled);
    if (tab === 'profile') {
      onOpenProfile();
    } else {
      setActiveTab(tab);
    }
  };

  const pendingMissions = dailyMissions.filter((m) => m.completed && !m.claimed).length;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#08090d]/95 backdrop-blur-md border-t border-amber-500/20 py-1.5 px-4 max-w-lg mx-auto sm:max-w-none">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          onClick={() => handleTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'home' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">15 Games</span>
        </button>

        <button
          onClick={() => handleTab('missions')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'missions' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Missions</span>
          {pendingMissions > 0 && (
            <span className="absolute top-0 right-2 w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-black flex items-center justify-center">
              {pendingMissions}
            </span>
          )}
        </button>

        <button
          onClick={() => handleTab('leaderboard')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'leaderboard' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Ranking</span>
        </button>

        <button
          onClick={() => handleTab('history')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition ${
            activeTab === 'history' ? 'text-amber-400 font-bold scale-105' : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">History</span>
        </button>

        <button
          onClick={() => handleTab('profile')}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-white transition"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Profile</span>
        </button>
      </div>
    </nav>
  );
};
