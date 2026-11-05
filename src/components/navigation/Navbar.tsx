import React, { useState } from 'react';
import {
  Tv,
  Search,
  X,
  ListPlus,
  Settings as SettingsIcon,
  Smartphone,
  Download,
  FolderGit2,
  Sparkles,
  Radio,
} from 'lucide-react';
import { useIPTV } from '../../context/IPTVContext';

export const Navbar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    currentPlaylist,
    playlists,
    switchPlaylist,
    setIsPlaylistModalOpen,
    setIsSettingsModalOpen,
    setIsAndroidProjectModalOpen,
    playerSettings,
    updatePlayerSettings,
  } = useIPTV();

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-[#07070e]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-600/30">
            <div className="w-full h-full bg-[#090b16] rounded-[14px] flex items-center justify-center">
              <Tv className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#07070e] animate-live-glow" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white uppercase font-sans">
                KAUSHIK <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">LIVE TV</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                FREE
              </span>
            </div>
            <p className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              STREAMZ WORLD • ANDROID & TV
            </p>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 max-w-md mx-2 hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search Indian channels, movies, sports, numbers..."
              className="w-full pl-10 pr-9 py-2 bg-slate-900/90 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-hidden focus:border-indigo-500 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mobile search toggle */}
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Playlist Manager Button */}
          <button
            onClick={() => setIsPlaylistModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer"
            title="Import or Switch M3U Playlist"
          >
            <ListPlus className="w-4 h-4 text-indigo-400" />
            <span className="hidden lg:inline max-w-[120px] truncate">{currentPlaylist.name}</span>
            <span className="lg:hidden">Playlist</span>
          </button>

          {/* Android Studio Project / Code Generator Button */}
          <button
            onClick={() => setIsAndroidProjectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Download Android Studio Kotlin Project & Media3 ExoPlayer APK Code"
          >
            <FolderGit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Android Studio Project</span>
          </button>

          {/* TV / Mobile Mode Toggle Button */}
          <button
            onClick={() => updatePlayerSettings({ tvMode: !playerSettings.tvMode })}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              playerSettings.tvMode
                ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/40'
                : 'bg-white/5 text-slate-300 hover:bg-white/10 border-white/10'
            }`}
            title={playerSettings.tvMode ? 'Switch to Mobile / Web View' : 'Switch to 10-ft Smart TV View'}
          >
            {playerSettings.tvMode ? <Tv className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="App & Player Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded mobile search */}
      {isSearchExpanded && (
        <div className="md:hidden px-4 pb-3 pt-1 border-t border-white/5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search channels..."
              className="w-full pl-10 pr-9 py-2 bg-slate-900 rounded-xl text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-hidden focus:border-indigo-500"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
