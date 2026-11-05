import React from 'react';
import { Play, Heart, Radio, Sparkles, Tv, ShieldCheck, Flame } from 'lucide-react';
import { useIPTV } from '../../context/IPTVContext';

export const FeaturedHero: React.FC = () => {
  const { currentPlaylist, activeChannel, playChannel, isFavorite, toggleFavorite, playbackStatus } = useIPTV();

  // Pick a featured channel (either currently playing, or the first premier channel in the bouquet)
  const featured = activeChannel || currentPlaylist.channels[0];
  if (!featured) return null;

  const isFav = isFavorite(featured.id);
  const isActivelyLive = activeChannel?.id === featured.id && playbackStatus === 'playing';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl bg-gradient-to-r from-[#0b0d1e] via-[#10132b] to-[#0a0a14]">
      {/* Background Ambient Glow & Graphic */}
      <div className="absolute inset-0 bg-radial-at-tr from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 md:p-10 items-center">
        {/* Left Info Column */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Top badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            {isActivelyLive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/20 border border-red-500/40 text-red-400 text-xs font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-live-glow" />
                Playing Live
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Channel
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
              {featured.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Free Forever
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mb-3">
            {featured.name}
          </h1>

          {/* Description */}
          <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed mb-6">
            Watch continuous live high-definition broadcast powered by ROY LIVE TV on
            Android Mobile & Android Smart TV. Free and verified live streams with zero subscription.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => playChannel(featured)}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              Watch Live Stream
            </button>

            <button
              onClick={() => toggleFavorite(featured.id)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border font-semibold text-sm transition-all cursor-pointer backdrop-blur-md ${
                isFav
                  ? 'bg-red-500/20 text-red-300 border-red-500/40'
                  : 'bg-white/10 text-slate-200 hover:text-white hover:bg-white/15 border-white/15'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
              {isFav ? 'Saved to Favourites' : 'Add to Favourites'}
            </button>
          </div>
        </div>

        {/* Right Preview Card / Logo Column */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-sm aspect-video sm:aspect-4/3 rounded-2xl bg-black/60 border border-white/15 p-6 flex flex-col items-center justify-center shadow-2xl backdrop-blur-md group">
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold">
              {featured.resolution || 'FHD 1080p'}
            </div>

            {featured.logo ? (
              <img
                src={featured.logo}
                alt={featured.name}
                className="max-h-24 sm:max-h-32 object-contain filter drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                onError={e => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    featured.name
                  )}&background=1e1b4b&color=a5b4fc&bold=true&size=160`;
                }}
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-200 text-2xl font-bold">
                {featured.name.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="mt-4 text-center">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                STREAMZ WORLD NETWORK
              </span>
              <p className="text-sm font-bold text-slate-200 mt-1">High Speed Direct HLS Stream</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
