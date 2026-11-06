import React, { useState } from 'react';
import { IPTVProvider, useIPTV } from './context/IPTVContext';
import { Navbar } from './components/navigation/Navbar';
import { LivePlayer } from './components/player/LivePlayer';
import { ChannelDrawer } from './components/player/ChannelDrawer';
import { FeaturedHero } from './components/home/FeaturedHero';
import { CategoryRow } from './components/home/CategoryRow';
import { ChannelCard } from './components/home/ChannelCard';
import { TvRemoteSimulator } from "./components/navigation/TvRemoteSimulator";
import { PlaylistModal } from './components/modals/PlaylistModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { AndroidProjectModal } from './components/modals/AndroidProjectModal';
import {
  Tv,
  Heart,
  History,
  Radio,
  Flame,
  Film,
  Trophy,
  Music,
  Smile,
  BookOpen,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { Channel } from './types/iptv';

function MainContent() {
  const {
    currentPlaylist,
    filteredChannels,
    selectedCategory,
    setSelectedCategory,
    categories,
    history,
    favoriteIds,
    searchQuery,
    playerSettings,
  } = useIPTV();

  // Category Icon helper
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'HLS Test Streams':
        return <Sparkles className="w-5 h-5 text-emerald-400" />;
      case 'Bengali News':
      case 'Hindi News':
      case 'English News':
        return <Radio className="w-5 h-5" />;
      case 'Sports':
        return <Trophy className="w-5 h-5" />;
      case 'Movies':
        return <Film className="w-5 h-5" />;
      case 'Music':
        return <Music className="w-5 h-5" />;
      case 'Kids':
        return <Smile className="w-5 h-5" />;
      case 'Educational':
        return <BookOpen className="w-5 h-5" />;
      case 'Religious / Devotional':
        return <Sparkles className="w-5 h-5" />;
      case 'Favourites':
        return <Heart className="w-5 h-5" />;
      default:
        return <Tv className="w-5 h-5" />;
    }
  };

  // Group channels by category for the OTT carousels
  const channelsByCategory = React.useMemo(() => {
    const map = new Map<string, Channel[]>();
    currentPlaylist.channels.forEach(ch => {
      const cat = ch.category || 'General Entertainment';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(ch);
    });
    return map;
  }, [currentPlaylist]);

  // Favorite channels list
  const favoriteChannels = React.useMemo(() => {
    return currentPlaylist.channels.filter(ch => favoriteIds.includes(ch.id));
  }, [currentPlaylist, favoriteIds]);

  // Recent channels from history
  const recentChannels = React.useMemo(() => {
    return history.map(item => item.channel);
  }, [history]);

  const isBrowsingAll = selectedCategory === 'All Channels' && !searchQuery.trim();

  return (
    <div
      className={`min-h-screen flex flex-col bg-[#06060c] text-slate-100 ${
        playerSettings.tvMode ? 'tv-mode-active text-lg' : ''
      }`}
    >
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* TV Mode Indicator Alert Bar */}
        {playerSettings.tvMode && (
          <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-indigo-400/40 flex items-center justify-between text-xs sm:text-sm text-indigo-200">
            <div className="flex items-center gap-2">
              <Tv className="w-5 h-5 text-indigo-400 animate-pulse" />
              <span className="font-bold">Android TV 10-Foot UI Active</span>
              <span className="hidden sm:inline text-indigo-300">
                — Use D-Pad Arrow keys, OK to play, Back (ESC), and 0-9 to change channels
              </span>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-xs"
            >
              Scroll Top
            </button>
          </div>
        )}

        {/* Live TV Video Player Section */}
        <section className="sticky top-[72px] z-30 w-full -mx-4 px-4 py-2 bg-[#06060c]/95 backdrop-blur-xl border-b border-white/10 sm:static sm:mx-0 sm:px-0 sm:py-0 sm:bg-transparent sm:backdrop-blur-none sm:border-0">
          <LivePlayer />
        </section>

        {/* Categories Bar (Sticky / Horizontal Scroll) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
                Browse Indian & Global Bouquets
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {currentPlaylist.channels.length} Total Channels
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            {categories.map(cat => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-indigo-400 shadow-lg shadow-indigo-600/30 transform scale-102'
                      : 'bg-[#101222] text-slate-300 hover:text-white hover:bg-slate-800 border-white/5 hover:border-white/15'
                  }`}
                >
                  {getCategoryIcon(cat)}
                  <span>{cat}</span>
                  {cat === 'Favourites' && favoriteIds.length > 0 && (
                    <span className="ml-1 text-[10px] font-mono bg-red-500 text-white px-1.5 py-0.2 rounded-full">
                      {favoriteIds.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* When User is Searching or Filtered to a Single Category: Display Comprehensive Grid */}
        {!isBrowsingAll ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-wide">
                  {searchQuery.trim() ? `Search Results for "${searchQuery}"` : selectedCategory}
                </h3>
                <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                  {filteredChannels.length} Channels
                </span>
              </div>

              {selectedCategory !== 'All Channels' && (
                <button
                  onClick={() => setSelectedCategory('All Channels')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                >
                  Clear Filter
                </button>
              )}
            </div>

            {filteredChannels.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-[#0c0d18] border border-white/5 p-6">
                <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-300 mb-1">No channels found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try another search query, clear filters, or import your custom M3U playlist file with more streams.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredChannels.map(ch => (
                  <ChannelCard key={ch.id} channel={ch} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Main OTT Home View with Featured Banner, Recent, Favourites, and Category Rows */
          <div className="space-y-8">
            {/* Featured Showcase Hero */}
            <FeaturedHero />

            {/* Favorite Channels Row (if any) */}
            {favoriteChannels.length > 0 && (
              <CategoryRow
                title="Favourite Channels"
                channels={favoriteChannels}
                icon={<Heart className="w-5 h-5 fill-red-500 text-red-500" />}
              />
            )}

            {/* Recently Watched / Continue Watching */}
            {recentChannels.length > 0 && (
              <CategoryRow
                title="Recently Watched"
                channels={recentChannels}
                icon={<History className="w-5 h-5 text-indigo-400" />}
              />
            )}

            {/* Clearly Labelled Sample HLS Test Streams */}
            {channelsByCategory.has('HLS Test Streams') && (
              <CategoryRow
                title="Sample HLS Test Streams (Player Verification)"
                channels={channelsByCategory.get('HLS Test Streams')!}
                icon={<Sparkles className="w-5 h-5 text-emerald-400" />}
              />
            )}

            {/* Bengali Entertainment & News */}
            {channelsByCategory.has('Bengali News') && (
              <CategoryRow
                title="Bengali News"
                channels={channelsByCategory.get('Bengali News')!}
                icon={<Radio className="w-5 h-5 text-blue-400" />}
              />
            )}

            {channelsByCategory.has('Bengali Entertainment') && (
              <CategoryRow
                title="Bengali Entertainment"
                channels={channelsByCategory.get('Bengali Entertainment')!}
                icon={<Film className="w-5 h-5 text-purple-400" />}
              />
            )}

            {/* Hindi Entertainment & News */}
            {channelsByCategory.has('Hindi Entertainment') && (
              <CategoryRow
                title="Hindi Entertainment"
                channels={channelsByCategory.get('Hindi Entertainment')!}
                icon={<Tv className="w-5 h-5 text-indigo-400" />}
              />
            )}

            {channelsByCategory.has('Hindi News') && (
              <CategoryRow
                title="Hindi News"
                channels={channelsByCategory.get('Hindi News')!}
                icon={<Radio className="w-5 h-5 text-emerald-400" />}
              />
            )}

            {/* English News */}
            {channelsByCategory.has('English News') && (
              <CategoryRow
                title="English News"
                channels={channelsByCategory.get('English News')!}
                icon={<Radio className="w-5 h-5 text-sky-400" />}
              />
            )}

            {/* Sports */}
            {channelsByCategory.has('Sports') && (
              <CategoryRow
                title="Sports"
                channels={channelsByCategory.get('Sports')!}
                icon={<Trophy className="w-5 h-5 text-amber-400" />}
              />
            )}

            {/* Movies */}
            {channelsByCategory.has('Movies') && (
              <CategoryRow
                title="Movies"
                channels={channelsByCategory.get('Movies')!}
                icon={<Film className="w-5 h-5 text-rose-400" />}
              />
            )}

            {/* Music */}
            {channelsByCategory.has('Music') && (
              <CategoryRow
                title="Music"
                channels={channelsByCategory.get('Music')!}
                icon={<Music className="w-5 h-5 text-violet-400" />}
              />
            )}

            {/* Kids */}
            {channelsByCategory.has('Kids') && (
              <CategoryRow
                title="Kids"
                channels={channelsByCategory.get('Kids')!}
                icon={<Smile className="w-5 h-5 text-yellow-400" />}
              />
            )}

            {/* Religious / Devotional */}
            {channelsByCategory.has('Religious / Devotional') && (
              <CategoryRow
                title="Religious / Devotional"
                channels={channelsByCategory.get('Religious / Devotional')!}
                icon={<Sparkles className="w-5 h-5 text-orange-400" />}
              />
            )}

            {/* Educational */}
            {channelsByCategory.has('Educational') && (
              <CategoryRow
                title="Educational"
                channels={channelsByCategory.get('Educational')!}
                icon={<BookOpen className="w-5 h-5 text-cyan-400" />}
              />
            )}

            {/* Regional Channels */}
            {channelsByCategory.has('Regional Channels') && (
              <CategoryRow
                title="Regional Channels"
                channels={channelsByCategory.get('Regional Channels')!}
                icon={<Layers className="w-5 h-5 text-teal-400" />}
              />
            )}

            {/* Any custom M3U categories imported by user */}
            {Array.from(channelsByCategory.entries())
              .filter(
                ([cat]) =>
                  ![
                    'Bengali News',
                    'Bengali Entertainment',
                    'Hindi Entertainment',
                    'Hindi News',
                    'English News',
                    'Sports',
                    'Movies',
                    'Music',
                    'Kids',
                    'Religious / Devotional',
                    'Educational',
                    'Regional Channels',
                  ].includes(cat)
              )
              .map(([cat, channels]) => (
                <CategoryRow key={cat} title={cat} channels={channels} />
              ))}
          </div>
        )}
      </main>

      {/* Slide-out Live Channel Guide Drawer */}
      <ChannelDrawer />

      {/* Modals */}
      <PlaylistModal />
      <SettingsModal />
      <AndroidProjectModal />

      {/* Interactive Android TV Remote Control Simulator */}
      <TvRemoteSimulator />

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-[#040408] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
              K
            </div>
            <div>
              <p className="font-bold text-white text-sm">
                KAUSHIK LIVE TV — <span className="text-indigo-400">STREAMZ WORLD</span>
              </p>
              <p className="text-[11px] text-slate-500">
                100% Free Forever • Android Mobile, Android Smart TV & TV Box Compatible
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="w-3.5 h-3.5" /> Zero Subscription
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" /> No Paywall or Mandatory Login
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <Tv className="w-3.5 h-3.5" /> Media3 ExoPlayer Engine
            </span>
          </div>

          <p className="text-[11px] text-slate-500 text-center md:text-right">
            Supports remote M3U / M3U8 URLs, local file upload & D-Pad navigation.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <IPTVProvider>
      <MainContent />
    </IPTVProvider>
  );
}
