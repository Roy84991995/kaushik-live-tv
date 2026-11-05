import React, { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  RotateCcw,
  Trash2,
  Tv,
  Smartphone,
  Shield,
  Info,
  Check,
  Zap,
  Volume2,
} from 'lucide-react';
import { useIPTV } from '../../context/IPTVContext';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    playerSettings,
    updatePlayerSettings,
    clearHistory,
    clearCache,
    refreshActivePlaylist,
    currentPlaylist,
  } = useIPTV();

  const [activeTab, setActiveTab] = useState<'player' | 'about' | 'privacy'>('player');
  const [clearedNotice, setClearedNotice] = useState<string | null>(null);

  if (!isSettingsModalOpen) return null;

  const showToast = (msg: string) => {
    setClearedNotice(msg);
    setTimeout(() => setClearedNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0c0e1e] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0e1124]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600/30 text-purple-400 border border-purple-500/30">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Application Settings</h2>
              <p className="text-xs text-slate-400">KAUSHIK LIVE TV • STREAMZ WORLD</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {clearedNotice && (
          <div className="bg-emerald-950/90 text-emerald-300 text-xs px-5 py-2.5 flex items-center gap-2 border-b border-emerald-500/30">
            <Check className="w-4 h-4 shrink-0" />
            <span>{clearedNotice}</span>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="px-5 pt-3 border-b border-white/10 flex gap-2 bg-[#090b16]">
          <button
            onClick={() => setActiveTab('player')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
              activeTab === 'player'
                ? 'bg-[#0c0e1e] text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Player & Experience
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
              activeTab === 'about'
                ? 'bg-[#0c0e1e] text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            About & Free Access
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-4 py-2 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
              activeTab === 'privacy'
                ? 'bg-[#0c0e1e] text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            Privacy & Legal
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'player' && (
            <div className="space-y-5">
              {/* TV Mode Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Tv className="w-4 h-4 text-indigo-400" />
                    Android TV 10-Foot UI Mode
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Enables high-contrast focus rings and D-pad remote navigation layout.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={playerSettings.tvMode}
                  onChange={e => updatePlayerSettings({ tvMode: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Autoplay */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white">Autoplay on Channel Select</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Immediately start video playback when a new channel card is selected.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={playerSettings.autoPlay}
                  onChange={e => updatePlayerSettings({ autoPlay: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Low Latency Mode */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Low-Latency Live HLS
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Optimizes live edge playback for real-time live news and sports.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={playerSettings.lowLatency}
                  onChange={e => updatePlayerSettings({ lowLatency: e.target.checked })}
                  className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                />
              </div>

              {/* Default Volume */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-indigo-400" />
                    Startup Volume Level
                  </h4>
                  <span className="text-xs font-mono font-bold text-indigo-300">
                    {playerSettings.defaultVolume}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playerSettings.defaultVolume}
                  onChange={e => updatePlayerSettings({ defaultVolume: parseInt(e.target.value, 10) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Data & History Maintenance */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Data & History Maintenance
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      clearHistory();
                      showToast('Viewing history cleared successfully.');
                    }}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-white/10 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear Viewing History
                  </button>

                  <button
                    onClick={() => {
                      clearCache();
                      showToast('App cache and settings reset.');
                    }}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Cache & Reset
                  </button>
                </div>

                {currentPlaylist.url && (
                  <button
                    onClick={async () => {
                      await refreshActivePlaylist();
                      showToast('Playlist reloaded from source.');
                    }}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refresh Current Playlist from URL
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-indigo-500/30">
                <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">
                  KAUSHIK LIVE TV
                </h3>
                <p className="text-indigo-300 font-semibold text-[11px] uppercase tracking-wider">
                  Brand Owner: STREAMZ WORLD
                </p>
                <div className="mt-3 inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs">
                  ★ 100% FREE FOREVER ★
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-white text-sm">Free Access Policy</h4>
                <ul className="list-disc pl-5 space-y-1 text-slate-400">
                  <li>No subscription or recurring charges.</li>
                  <li>No login, phone number, or registration required.</li>
                  <li>No premium channel locks or paywalls.</li>
                  <li>No forced video advertisements or pop-ups.</li>
                  <li>Designed for open, uninterrupted entertainment for all users.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5">
                <span className="font-semibold text-white block mb-1">Supported Platforms:</span>
                <span className="text-slate-400">
                  Android Mobile Phones (Android 8.0+), Android Smart TVs (Sony, OnePlus, Mi, TCL, Samsung, LG Web), Android TV Boxes & Fire TV sticks, and Desktop Web.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Shield className="w-4 h-4" />
                <span>Security & Streaming Compliance</span>
              </div>
              <p>
                KAUSHIK LIVE TV functions solely as an authorized M3U / M3U8 multimedia playlist parser
                and HLS player client. The application does not host, broadcast, or transmit copyrighted
                streams on its own servers.
              </p>
              <p>
                Users are solely responsible for adding legally authorized streaming links and public Free-to-Air
                (FTA) broadcasts. All playlist data, favorites, and settings are preserved strictly on your local
                device storage (Local Storage) and never uploaded to any remote tracking database.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-[11px] text-slate-400">
                Zero telemetry, zero user tracking, 100% offline-ready local state management.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
