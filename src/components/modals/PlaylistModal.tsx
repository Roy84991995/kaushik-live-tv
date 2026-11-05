import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  FileText,
  Sparkles,
  Check,
  Trash2,
  Download,
  RotateCw,
  AlertCircle,
  Plus,
  Tv,
} from 'lucide-react';
import { useIPTV } from '../../context/IPTVContext';
import { PRESET_PLAYLIST_SOURCES } from '../../data/defaultPlaylists';
import { exportToM3U } from '../../utils/m3uParser';

export const PlaylistModal: React.FC = () => {
  const {
    isPlaylistModalOpen,
    setIsPlaylistModalOpen,
    playlists,
    currentPlaylist,
    switchPlaylist,
    deletePlaylist,
    importPlaylistFromM3U,
    importPlaylistFromUrl,
    refreshActivePlaylist,
  } = useIPTV();

  const [activeTab, setActiveTab] = useState<'url' | 'file' | 'presets' | 'manage'>('url');
  const [urlInput, setUrlInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [pasteInput, setPasteInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isPlaylistModalOpen) return null;

  // Handle URL import
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setIsLoading(true);
    setStatusMessage(null);

    const result = await importPlaylistFromUrl(urlInput.trim(), nameInput.trim() || undefined);
    setIsLoading(false);

    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
      setUrlInput('');
      setNameInput('');
      setTimeout(() => {
        setIsPlaylistModalOpen(false);
      }, 1200);
    } else {
      setStatusMessage({ type: 'error', text: result.message });
    }
  };

  // Handle File Upload (.m3u, .m3u8)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setStatusMessage(null);

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        if (!content || content.length < 10) {
          throw new Error('The selected file appears to be empty.');
        }

        const fileName = file.name.replace(/\.(m3u8?|txt)$/i, '');
        importPlaylistFromM3U(nameInput.trim() || fileName, content);
        setIsLoading(false);
        setStatusMessage({ type: 'success', text: `Successfully imported "${file.name}"!` });
        setTimeout(() => setIsPlaylistModalOpen(false), 1200);
      } catch (err: unknown) {
        setIsLoading(false);
        const msg = err instanceof Error ? err.message : 'Error reading M3U file.';
        setStatusMessage({ type: 'error', text: msg });
      }
    };

    reader.onerror = () => {
      setIsLoading(false);
      setStatusMessage({ type: 'error', text: 'Failed to read file from storage.' });
    };

    reader.readAsText(file);
  };

  // Handle Text Paste
  const handlePasteSubmit = () => {
    if (!pasteInput.trim()) return;
    try {
      setIsLoading(true);
      importPlaylistFromM3U(nameInput.trim() || 'Pasted Playlist', pasteInput);
      setIsLoading(false);
      setStatusMessage({ type: 'success', text: 'Playlist parsed and loaded successfully!' });
      setTimeout(() => setIsPlaylistModalOpen(false), 1200);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Parsing failed.';
      setStatusMessage({ type: 'error', text: msg });
    }
  };

  // Export M3U to device
  const handleExportPlaylist = (playlist: typeof currentPlaylist) => {
    const m3uContent = exportToM3U(playlist.channels, playlist.name);
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${playlist.name.replace(/\s+/g, '_')}.m3u`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0c0e1e] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0e1124]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/30">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">M3U / M3U8 Playlist Manager</h2>
              <p className="text-xs text-slate-400">Import remote URL, local storage file, or select legal bouquet</p>
            </div>
          </div>
          <button
            onClick={() => setIsPlaylistModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status notification banner */}
        {statusMessage && (
          <div
            className={`px-5 py-3 text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/80 text-emerald-200 border-b border-emerald-500/30'
                : 'bg-rose-950/80 text-rose-200 border-b border-rose-500/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="px-5 pt-3 border-b border-white/10 flex gap-2 overflow-x-auto no-scrollbar bg-[#090b16]">
          <button
            onClick={() => setActiveTab('url')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
              activeTab === 'url'
                ? 'bg-[#0c0e1e] text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            Add by URL
          </button>

          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
              activeTab === 'file'
                ? 'bg-[#0c0e1e] text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>

          <button
            onClick={() => setActiveTab('presets')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
              activeTab === 'presets'
                ? 'bg-[#0c0e1e] text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Legal Presets
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all cursor-pointer border-t-2 ${
              activeTab === 'manage'
                ? 'bg-[#0c0e1e] text-indigo-400 border-indigo-500'
                : 'text-slate-400 hover:text-white border-transparent'
            }`}
          >
            <Tv className="w-4 h-4" />
            Saved Playlists ({playlists.length})
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: ADD BY URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Playlist Name (Optional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g. My Indian Live Channels"
                  className="w-full px-4 py-2.5 bg-slate-900/90 rounded-xl text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  M3U / M3U8 Stream URL <span className="text-red-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://example.com/playlist.m3u"
                  className="w-full px-4 py-2.5 bg-slate-900/90 rounded-xl text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-hidden focus:border-indigo-500 font-mono text-xs"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Supports remote HTTP and HTTPS links. The parser will extract channel names, stream URLs, tvg-logo, and group-title.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    Fetching & Parsing M3U...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Load & Add Playlist
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 2: UPLOAD FILE */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Playlist Name (Optional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="e.g. Local Storage Backup"
                  className="w-full px-4 py-2.5 bg-slate-900/90 rounded-xl text-sm text-white placeholder-slate-500 border border-white/10 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".m3u,.m3u8,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-indigo-950/10 hover:bg-indigo-950/20"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Click to select M3U / M3U8 from Device</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Upload files directly from your phone or Smart TV local storage. File format: standard .m3u or .m3u8.
                </p>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Or Paste M3U Raw Content
                </label>
                <textarea
                  rows={4}
                  value={pasteInput}
                  onChange={e => setPasteInput(e.target.value)}
                  placeholder="#EXTM3U&#10;#EXTINF:-1 tvg-logo='...' group-title='Bengali News',DD Bangla&#10;https://..."
                  className="w-full p-3 bg-slate-900 rounded-xl text-xs text-slate-200 font-mono border border-white/10 focus:outline-hidden focus:border-indigo-500"
                />
                {pasteInput.trim() && (
                  <button
                    onClick={handlePasteSubmit}
                    disabled={isLoading}
                    className="mt-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Parse Pasted M3U
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LEGAL PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Curated 100% legal, public Free-to-Air (FTA) channel bouquets that you can instantly add and test:
              </p>
              {PRESET_PLAYLIST_SOURCES.map((preset, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/5 hover:border-indigo-500/40 transition-colors flex items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-bold text-white">{preset.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{preset.description}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setIsLoading(true);
                      setStatusMessage(null);
                      const res = await importPlaylistFromUrl(preset.url, preset.name);
                      setIsLoading(false);
                      if (res.success) {
                        setStatusMessage({ type: 'success', text: `Loaded "${preset.name}"!` });
                        setTimeout(() => setIsPlaylistModalOpen(false), 1200);
                      } else {
                        setStatusMessage({ type: 'error', text: res.message });
                      }
                    }}
                    disabled={isLoading}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-semibold shrink-0 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Import Bouquet
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: SAVED PLAYLISTS */}
          {activeTab === 'manage' && (
            <div className="space-y-3">
              {playlists.map(pl => {
                const isActive = pl.id === currentPlaylist.id;
                return (
                  <div
                    key={pl.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isActive
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-600/10'
                        : 'bg-slate-900/60 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{pl.name}</h4>
                        {isActive && (
                          <span className="text-[10px] uppercase font-bold bg-indigo-500 text-white px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>{pl.channelCount} Channels</span>
                        <span>•</span>
                        <span>Updated {new Date(pl.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isActive && (
                        <button
                          onClick={() => {
                            switchPlaylist(pl.id);
                            setIsPlaylistModalOpen(false);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Switch To
                        </button>
                      )}

                      <button
                        onClick={() => handleExportPlaylist(pl)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-colors cursor-pointer"
                        title="Download M3U file"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {pl.isCustom && (
                        <button
                          onClick={() => deletePlaylist(pl.id)}
                          className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-300 text-xs transition-colors cursor-pointer"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
