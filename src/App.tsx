/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { LobbyView } from './components/Views/LobbyView';
import { MissionsView } from './components/Views/MissionsView';
import { LeaderboardView } from './components/Views/LeaderboardView';
import { HistoryView } from './components/Views/HistoryView';
import { GameRenderer } from './components/Games/GameRenderer';
import { DailyBonusModal } from './components/Modals/DailyBonusModal';
import { SpinRewardModal } from './components/Modals/SpinRewardModal';
import { ProfileModal } from './components/Modals/ProfileModal';
import { AuthModal } from './components/Modals/AuthModal';
import { ApkDownloadModal } from './components/Modals/ApkDownloadModal';
import { AdminPanelModal } from './components/Modals/AdminPanelModal';
import { RewardsModal } from './components/Modals/RewardsModal';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeGame, activeTab, deviceViewMode } = useGame();
  const [profileOpen, setProfileOpen] = useState(false);

  const renderActiveView = () => {
    if (activeGame) {
      return <GameRenderer gameId={activeGame} />;
    }

    switch (activeTab) {
      case 'home':
        return <LobbyView />;
      case 'missions':
        return <MissionsView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'history':
        return <HistoryView />;
      default:
        return <LobbyView />;
    }
  };

  // If Simulated Android Phone Frame is enabled on larger screens
  if (deviceViewMode === 'android-frame') {
    return (
      <div className="min-h-screen bg-[#040507] py-6 px-4 flex items-center justify-center">
        {/* Realistic Android Phone Bezel */}
        <div className="w-full max-w-[430px] h-[890px] rounded-[48px] bg-[#111319] p-3 shadow-[0_0_80px_rgba(0,0,0,0.9),0_0_40px_rgba(245,158,11,0.2)] border-4 border-[#272b38] relative flex flex-col overflow-hidden">
          {/* Top Speaker & Punch Hole Camera */}
          <div className="absolute top-2.5 inset-x-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="w-12 h-1 bg-slate-700/60 rounded-full mb-1" />
          </div>

          {/* Android Status Bar */}
          <div className="h-7 px-5 flex items-center justify-between text-[11px] font-bold text-slate-300 z-50 bg-[#08090d] shrink-0 select-none">
            <span>23:11</span>
            {/* Front Camera Notch */}
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <BatteryMedium className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          {/* Internal Screen Content */}
          <div className="flex-1 rounded-[36px] overflow-hidden bg-[#070709] flex flex-col relative">
            <Header onOpenProfile={() => setProfileOpen(true)} />
            <main className="flex-1 overflow-y-auto p-3 no-scrollbar">
              {renderActiveView()}
            </main>
            {!activeGame && <Navigation onOpenProfile={() => setProfileOpen(true)} />}
          </div>

          {/* Android Gesture Bar */}
          <div className="h-4 flex items-center justify-center shrink-0">
            <div className="w-32 h-1 rounded-full bg-slate-500/50" />
          </div>
        </div>

        {/* Global Modals */}
        <DailyBonusModal />
        <SpinRewardModal />
        <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        <AuthModal />
        <ApkDownloadModal />
        <AdminPanelModal />
        <RewardsModal />
      </div>
    );
  }

  // Fullscreen Responsive Layout
  return (
    <div className="min-h-screen bg-[#070709] text-slate-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <Header onOpenProfile={() => setProfileOpen(true)} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6">
        {renderActiveView()}
      </main>

      {!activeGame && <Navigation onOpenProfile={() => setProfileOpen(true)} />}

      {/* Global Modals */}
      <DailyBonusModal />
      <SpinRewardModal />
      <ProfileModal isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <AuthModal />
      <ApkDownloadModal />
      <AdminPanelModal />
      <RewardsModal />
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}
