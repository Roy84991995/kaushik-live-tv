import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Tv } from 'lucide-react';
import { Channel } from '../../types/iptv';
import { ChannelCard } from './ChannelCard';
import { useIPTV } from '../../context/IPTVContext';

interface CategoryRowProps {
  title: string;
  channels: Channel[];
  icon?: React.ReactNode;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({ title, channels, icon }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { setSelectedCategory } = useIPTV();

  if (channels.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative py-4 group/row">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-indigo-400">{icon}</span>}
          <h3 className="text-lg font-bold text-white tracking-wide">{title}</h3>
          <span className="text-xs font-mono font-semibold bg-white/10 text-slate-300 px-2 py-0.5 rounded-full">
            {channels.length}
          </span>
        </div>

        <button
          onClick={() => setSelectedCategory(title)}
          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 cursor-pointer"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Left/Right Scroll Arrows */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-md border border-white/20 shadow-xl cursor-pointer"
        title="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/80 hover:bg-indigo-600 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-md border border-white/20 shadow-xl cursor-pointer"
        title="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Horizontal Cards Reel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-3 pt-1 scroll-smooth no-scrollbar scrollbar-none"
      >
        {channels.map(ch => (
          <div key={ch.id} className="w-56 sm:w-64 shrink-0">
            <ChannelCard channel={ch} />
          </div>
        ))}
      </div>
    </div>
  );
};
