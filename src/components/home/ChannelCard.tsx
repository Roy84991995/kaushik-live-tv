import React from 'react';
import { Play, Heart, Radio, Sparkles } from 'lucide-react';
import { Channel } from '../../types/iptv';
import { useIPTV } from '../../context/IPTVContext';

interface ChannelCardProps {
  channel: Channel;
  isFocused?: boolean;
  onFocus?: () => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, isFocused, onFocus }) => {
  const { playChannel, activeChannel, isFavorite, toggleFavorite, playbackStatus } = useIPTV();
  const isPlaying = activeChannel?.id === channel.id;
  const isActivelyLive = isPlaying && playbackStatus === 'playing';
  const isConnecting = isPlaying && playbackStatus === 'connecting';
  const hasError = isPlaying && playbackStatus === 'error';
  const fav = isFavorite(channel.id);

  return (
    <div
      tabIndex={0}
      onFocus={onFocus}
      onClick={() => playChannel(channel)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playChannel(channel);
        }
      }}
      className={`group relative flex flex-col rounded-2xl p-3 bg-gradient-to-b from-[#121424] to-[#0c0d18] border transition-all duration-300 cursor-pointer overflow-hidden outline-hidden select-none ${
        isFocused ? 'tv-focused' : ''
      } ${
        isPlaying
          ? isActivelyLive
            ? 'border-indigo-400 shadow-2xl shadow-indigo-500/40 ring-2 ring-indigo-400/60'
            : hasError
            ? 'border-rose-500 shadow-xl shadow-rose-900/30'
            : 'border-amber-500/80 shadow-xl shadow-amber-900/20'
          : 'border-white/8 hover:border-white/25 hover:shadow-xl hover:shadow-purple-950/40 hover:-translate-y-1'
      }`}
    >
      {/* Top badges: Channel Number & Live status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {channel.channelNumber && (
            <span className="text-[10px] font-mono font-bold bg-white/10 text-slate-300 px-2 py-0.5 rounded-md border border-white/5">
              CH {channel.channelNumber}
            </span>
          )}
          <span className="text-[9px] font-bold uppercase tracking-wider bg-indigo-950/80 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
            {channel.resolution || 'HD'}
          </span>
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            toggleFavorite(channel.id);
          }}
          className={`p-1.5 rounded-lg backdrop-blur-md transition-colors cursor-pointer ${
            fav ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-white bg-black/30'
          }`}
          title={fav ? 'Remove from Favourites' : 'Add to Favourites'}
        >
          <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-red-500' : ''}`} />
        </button>
      </div>

      {/* Channel Logo & Visual Container */}
      <div className="relative aspect-video w-full rounded-xl bg-gradient-to-br from-indigo-950/70 to-black flex items-center justify-center p-3 overflow-hidden border border-indigo-500/20 shadow-inner shadow-indigo-500/10 group-hover:border-white/15 transition-colors">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-300"
            onError={e => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                channel.name
              )}&background=1e1b4b&color=a5b4fc&bold=true&size=128`;
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-indigo-900/50 flex items-center justify-center text-indigo-300 font-bold text-lg border border-indigo-500/30">
            {channel.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Hover / Play Overlay */}
        <div className="absolute inset-0 bg-indigo-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Currently Playing Indicator Badge */}
        {isPlaying && (
          <div
            className={`absolute bottom-2 left-2 flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg ${
              isActivelyLive
                ? 'bg-red-500 text-white shadow-red-500/50 ring-1 ring-red-300/60'
                : isConnecting
                ? 'bg-amber-600/90 text-amber-100'
                : 'bg-rose-700/90 text-white'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActivelyLive ? 'bg-white animate-live-glow' : isConnecting ? 'bg-amber-300 animate-ping' : 'bg-rose-300'
              }`}
            />
            {isActivelyLive ? 'PLAYING' : isConnecting ? 'CONNECTING' : 'OFFLINE'}
          </div>
        )}
      </div>

      {/* Channel Title & Info */}
      <div className="mt-3">
        <h4 className="text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition-colors">
          {channel.name}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span className="truncate">{channel.category}</span>

          {/* Strict LIVE status rule: Never show as LIVE unless stream is actively playing */}
          {isActivelyLive ? (
            <span className="flex items-center gap-1 text-[10px] text-red-400 font-semibold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          ) : isConnecting ? (
            <span className="text-[10px] text-amber-400 font-semibold shrink-0">CONNECTING</span>
          ) : (
            <span className="text-[10px] text-slate-500 shrink-0 font-mono">HLS</span>
          )}
        </div>
      </div>
    </div>
  );
};
