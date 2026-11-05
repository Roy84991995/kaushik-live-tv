import React, { useState } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Volume2,
  Volume1,
  VolumeX,
  Tv,
  ArrowLeft,
  Home,
  X,
  Minimize2,
  Maximize2,
  List,
} from 'lucide-react';
import { useIPTV } from '../../context/IPTVContext';

export const TvRemoteSimulator: React.FC = () => {
  const {
    playerSettings,
    updatePlayerSettings,
    nextChannel,
    prevChannel,
    jumpToChannelNumber,
    isChannelListOpen,
    setIsChannelListOpen,
  } = useIPTV();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [numInput, setNumInput] = useState<string>('');

  if (!playerSettings.showRemoteOverlay && !isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs shadow-2xl shadow-indigo-600/50 hover:from-purple-500 hover:to-indigo-500 border border-white/20 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
        title="Open Android TV Remote Simulator"
      >
        <Tv className="w-4 h-4" />
        <span>Android TV Remote</span>
      </button>
    );
  }

  const dispatchKey = (key: string, keyCode?: number) => {
    window.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        code: key,
        bubbles: true,
        cancelable: true,
      })
    );
  };

  const handleNumClick = (n: number) => {
    const updated = numInput + n.toString();
    setNumInput(updated);
    if (updated.length >= 3) {
      jumpToChannelNumber(parseInt(updated, 10));
      setNumInput('');
    } else {
      setTimeout(() => {
        if (updated) {
          jumpToChannelNumber(parseInt(updated, 10));
          setNumInput('');
        }
      }, 1000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-72 rounded-3xl bg-[#0e101f] border-2 border-indigo-500/40 shadow-2xl shadow-purple-950/60 p-4 flex flex-col items-center select-none backdrop-blur-xl">
      {/* Remote Header */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-[11px] font-bold tracking-widest text-indigo-300 uppercase">
            Android TV Remote
          </span>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            updatePlayerSettings({ showRemoteOverlay: false });
          }}
          className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Top action row */}
      <div className="w-full grid grid-cols-3 gap-2 mb-4">
        <button
          onClick={() => updatePlayerSettings({ tvMode: !playerSettings.tvMode })}
          className={`py-1.5 px-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
            playerSettings.tvMode
              ? 'bg-indigo-600 text-white border-indigo-400'
              : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
          }`}
        >
          10-FT UI
        </button>
        <button
          onClick={() => setIsChannelListOpen(!isChannelListOpen)}
          className="py-1.5 px-2 rounded-xl bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 text-[10px] font-bold transition-all cursor-pointer"
        >
          EPG GUIDE
        </button>
        <button
          onClick={() => updatePlayerSettings({ muted: !playerSettings.muted })}
          className="py-1.5 px-2 rounded-xl bg-slate-800 text-slate-300 border border-white/10 hover:bg-slate-700 text-[10px] font-bold flex items-center justify-center transition-all cursor-pointer"
        >
          <VolumeX className="w-3.5 h-3.5 text-red-400" />
        </button>
      </div>

      {/* D-PAD Circle */}
      <div className="relative w-44 h-44 rounded-full bg-slate-900 border-2 border-indigo-500/30 flex items-center justify-center shadow-inner my-2">
        {/* UP */}
        <button
          onClick={() => dispatchKey('ArrowUp')}
          className="absolute top-2 w-12 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600/30 rounded-t-full transition-all cursor-pointer active:scale-90"
          title="D-Pad Up"
        >
          <ChevronUp className="w-6 h-6" />
        </button>

        {/* DOWN */}
        <button
          onClick={() => dispatchKey('ArrowDown')}
          className="absolute bottom-2 w-12 h-10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600/30 rounded-b-full transition-all cursor-pointer active:scale-90"
          title="D-Pad Down"
        >
          <ChevronDown className="w-6 h-6" />
        </button>

        {/* LEFT */}
        <button
          onClick={() => dispatchKey('ArrowLeft')}
          className="absolute left-2 w-10 h-12 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600/30 rounded-l-full transition-all cursor-pointer active:scale-90"
          title="D-Pad Left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* RIGHT */}
        <button
          onClick={() => dispatchKey('ArrowRight')}
          className="absolute right-2 w-10 h-12 flex items-center justify-center text-slate-300 hover:text-white hover:bg-indigo-600/30 rounded-r-full transition-all cursor-pointer active:scale-90"
          title="D-Pad Right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* OK / CENTER ENTER BUTTON */}
        <button
          onClick={() => dispatchKey('Enter')}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-indigo-600/50 hover:brightness-110 active:scale-90 transition-all cursor-pointer border border-white/20"
          title="OK Button"
        >
          OK
        </button>
      </div>

      {/* Navigation Buttons: Back, Home */}
      <div className="w-full flex items-center justify-around my-3">
        <button
          onClick={() => dispatchKey('Escape')}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 active:scale-95 transition-all cursor-pointer"
          title="Back (ESC)"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 active:scale-95 transition-all cursor-pointer"
          title="Home"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Channel Rocker & Volume Rocker */}
      <div className="w-full grid grid-cols-2 gap-3 mb-3">
        <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-900 border border-white/5">
          <span className="text-[9px] font-bold text-slate-400 mb-1">CHANNEL</span>
          <div className="flex gap-2">
            <button
              onClick={prevChannel}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold active:scale-90 transition-all cursor-pointer"
            >
              CH -
            </button>
            <button
              onClick={nextChannel}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold active:scale-90 transition-all cursor-pointer"
            >
              CH +
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center p-2 rounded-2xl bg-slate-900 border border-white/5">
          <span className="text-[9px] font-bold text-slate-400 mb-1">VOLUME</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const newVol = Math.max(0, playerSettings.defaultVolume - 10);
                updatePlayerSettings({ defaultVolume: newVol });
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold active:scale-90 transition-all cursor-pointer"
            >
              VOL -
            </button>
            <button
              onClick={() => {
                const newVol = Math.min(100, playerSettings.defaultVolume + 10);
                updatePlayerSettings({ defaultVolume: newVol, muted: false });
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold active:scale-90 transition-all cursor-pointer"
            >
              VOL +
            </button>
          </div>
        </div>
      </div>

      {/* Number Pad for Channel Dialing */}
      <div className="w-full">
        {numInput && (
          <div className="w-full text-center py-1 text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 rounded-lg mb-1 border border-indigo-500/30">
            Channel: {numInput}
          </div>
        )}
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((num, i) => (
            <button
              key={num}
              onClick={() => handleNumClick(num)}
              className={`py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600/40 text-slate-200 text-xs font-mono font-bold border border-white/5 transition-all cursor-pointer active:scale-95 ${
                num === 0 ? 'col-span-3' : ''
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
