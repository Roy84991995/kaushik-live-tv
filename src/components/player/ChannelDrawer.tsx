import React, { useState } from 'react';
import { X, Search, Radio, Heart, Sparkles } from 'lucide-react';
import { useIPTV } from '../../context/IPTVContext';
import { Channel } from '../../types/iptv';

export const ChannelDrawer: React.FC = () => {
  const {
    currentPlaylist,
    activeChannel,
    playChannel,
    isChannelListOpen,
    setIsChannelListOpen,
    categories,
    isFavorite,
    toggleFavorite,
    playbackStatus,
  } = useIPTV();

  const [activeCategory, setActiveCategory] = useState<string>('All Channels');
  const [drawerSearch, setDrawerSearch] = useState<string>('');

  if (!isChannelListOpen) return null;

  const filtered = currentPlaylist.channels.filter(ch => {
    let matchCat = true;
    if (activeCategory === 'Favourites') {
      matchCat = isFavorite(ch.id);
    } else if (activeCategory !== 'All Channels') {
      matchCat = ch.category === activeCategory;
    }

    if (!matchCat) return false;

    if (drawerSearch.trim()) {
      const q = drawerSearch.toLowerCase().trim();
      return (
        ch.name.toLowerCase().includes(q) ||
        ch.category.toLowerCase().includes(q) ||
        (ch.channelNumber && ch.channelNumber.toString().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 glass-panel border-l border-white/10 shadow-2xl flex flex-col backdrop-blur-2xl bg-[#090b16]/95">
      {/* Drawer Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-white">Live Channel Guide</h3>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
            {currentPlaylist.channels.length}
          </span>
        </div>
        <button
          onClick={() => setIsChannelListOpen(false)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-white/5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={drawerSearch}
            onChange={e => setDrawerSearch(e.target.value)}
            placeholder="Search channels or numbers..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/80 rounded-xl text-xs text-white placeholder-slate-500 border border-white/10 focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Category Pills horizontal scroll */}
      <div className="px-3 py-2 border-b border-white/5 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Channel Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No channels found for this category or query.
          </div>
        ) : (
          filtered.map(ch => {
            const isPlaying = activeChannel?.id === ch.id;
            const fav = isFavorite(ch.id);

            return (
              <div
                key={ch.id}
                onClick={() => {
                  playChannel(ch);
                  // On mobile screens, auto close drawer
                  if (window.innerWidth < 640) {
                    setIsChannelListOpen(false);
                  }
                }}
                className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border cursor-pointer ${
                  isPlaying
                    ? 'bg-indigo-600/25 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/50 hover:bg-slate-800/70 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {ch.logo ? (
                    <img
                      src={ch.logo}
                      alt={ch.name}
                      className="w-9 h-9 rounded-lg object-contain bg-black/40 p-1 shrink-0"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold shrink-0">
                      {ch.name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {ch.channelNumber && (
                        <span className="text-[10px] font-mono text-indigo-300 font-semibold">
                          #{ch.channelNumber}
                        </span>
                      )}
                      <p
                        className={`text-xs font-semibold truncate ${
                          isPlaying ? 'text-indigo-300' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {ch.name}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">{ch.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {isPlaying && playbackStatus === 'playing' && (
                    <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-live-glow" />
                      LIVE
                    </span>
                  )}
                  {isPlaying && playbackStatus === 'connecting' && (
                    <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      SYNC
                    </span>
                  )}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      toggleFavorite(ch.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      fav ? 'text-red-400' : 'text-slate-500 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
