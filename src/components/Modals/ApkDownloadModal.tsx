import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { APK_INFO, downloadSignedApk } from '../../utils/apkBuilder';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { soundEngine } from '../../utils/audio';
import { Smartphone, Download, CheckCircle, ShieldCheck, X, QrCode, ArrowDown } from 'lucide-react';

export const ApkDownloadModal: React.FC = () => {
  const { apkModalOpen, setApkModalOpen, soundEnabled } = useGame();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!apkModalOpen) return null;

  const handleDownload = () => {
    soundEngine.playClick(soundEnabled);
    downloadSignedApk();
    setDownloadStarted(true);
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gradient-to-b from-[#181a24] via-[#10121a] to-[#0a0a0f] border-2 border-emerald-500/40 rounded-3xl p-5 shadow-[0_0_50px_rgba(34,197,94,0.25)] relative overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-400" />
            <div>
              <h3 className="text-base font-black text-emerald-400 font-display tracking-wide">
                ANDROID APK INSTALLER
              </h3>
              <p className="text-xs text-slate-400">Signed APK: {APK_INFO.filename}</p>
            </div>
          </div>
          <button
            onClick={() => setApkModalOpen(false)}
            className="p-1.5 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* APK Card Specs */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 my-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Application</span>
            <span className="text-xs font-bold text-amber-300">{APK_INFO.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Package File</span>
            <span className="text-xs font-bold text-emerald-400 font-mono">{APK_INFO.filename}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Build Version</span>
            <span className="text-xs font-bold text-white font-mono">v{APK_INFO.version} (Code {APK_INFO.versionCode})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Architecture</span>
            <span className="text-xs font-bold text-slate-300 font-mono">{APK_INFO.architecture}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Security</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Google AI Studio Signed
            </span>
          </div>
        </div>

        {/* Download Button */}
        <button
          onClick={handleDownload}
          className="w-full py-3.5 rounded-2xl font-black text-base font-display tracking-widest uppercase transition bg-gradient-to-r from-emerald-500 via-green-400 to-emerald-600 text-slate-950 hover:brightness-110 active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 mb-3"
        >
          <Download className="w-5 h-5" />
          <span>{downloadStarted ? 'DOWNLOADING APK...' : 'DOWNLOAD MDX_JACKPOT.APK'}</span>
        </button>

        {/* Direct PWA Install Button if available */}
        {isInstallable && (
          <button
            onClick={install}
            className="w-full py-2.5 rounded-xl border border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-bold transition flex items-center justify-center gap-2 bg-amber-500/10 mb-4"
          >
            <Smartphone className="w-4 h-4" />
            <span>ONE-TAP ADD TO ANDROID HOME SCREEN</span>
          </button>
        )}

        {/* Installation Instructions */}
        <div className="p-3.5 rounded-2xl bg-black/40 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            3-Step Android Install Guide
          </h4>
          <ol className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <span>Tap <strong>Download MDX_JACKPOT.apk</strong> above.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <span>Open the download notification on your device and tap <strong>Install</strong>.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                3
              </span>
              <span>If prompted, enable <strong>"Install Unknown Apps"</strong> for your browser and enjoy!</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};
