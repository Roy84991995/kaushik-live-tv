import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Channel, Playlist, PlayerSettings, WatchHistoryItem, PlaybackStatus, PlaybackErrorDetails } from '../types/iptv';
import { DEFAULT_PLAYLIST } from '../data/defaultPlaylists';
import { parseM3U } from '../utils/m3uParser';

interface IPTVContextType {
  currentPlaylist: Playlist;
  playlists: Playlist[];
  activeChannel: Channel | null;
  favoriteIds: string[];
  history: WatchHistoryItem[];
  searchQuery: string;
  selectedCategory: string;
  playerSettings: PlayerSettings;
  filteredChannels: Channel[];
  isChannelListOpen: boolean;
  isPlaylistModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isAndroidProjectModalOpen: boolean;
  categories: string[];
  playbackStatus: PlaybackStatus;
  playbackErrorDetails: PlaybackErrorDetails | null;

  // Actions
  playChannel: (channel: Channel) => void;
  playTestStream: () => void;
  stopPlayback: () => void;
  setPlaybackStatus: (status: PlaybackStatus) => void;
  setPlaybackErrorDetails: (error: PlaybackErrorDetails | null) => void;
  nextChannel: () => void;
  prevChannel: () => void;
  jumpToChannelNumber: (num: number) => boolean;
  toggleFavorite: (channelId: string) => void;
  isFavorite: (channelId: string) => boolean;
  importPlaylistFromM3U: (name: string, content: string, url?: string) => Playlist;
  importPlaylistFromUrl: (url: string, name?: string) => Promise<{ success: boolean; message: string }>;
  switchPlaylist: (playlistId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  refreshActivePlaylist: () => Promise<void>;
  clearHistory: () => void;
  clearCache: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  updatePlayerSettings: (settings: Partial<PlayerSettings>) => void;
  setIsChannelListOpen: (open: boolean) => void;
  setIsPlaylistModalOpen: (open: boolean) => void;
  setIsSettingsModalOpen: (open: boolean) => void;
  setIsAndroidProjectModalOpen: (open: boolean) => void;
}

const DEFAULT_SETTINGS: PlayerSettings = {
  autoPlay: true,
  defaultVolume: 85,
  muted: false,
  lowLatency: true,
  bufferLength: 15,
  preferredQuality: 'Auto',
  tvMode: false,
  showRemoteOverlay: false,
};

const IPTV_CACHE_VERSION = 'v2_verified_streams';

const IPTVContext = createContext<IPTVContextType | undefined>(undefined);

export const IPTVProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved playlists or default
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    try {
      const cacheVersion = localStorage.getItem('kaushik_iptv_cache_version');
      if (cacheVersion !== IPTV_CACHE_VERSION) {
        // Upgrade cache to ensure user gets verified streams
        localStorage.setItem('kaushik_iptv_cache_version', IPTV_CACHE_VERSION);
        localStorage.removeItem('kaushik_iptv_last_channel_id');
        return [DEFAULT_PLAYLIST];
      }

      const saved = localStorage.getItem('kaushik_iptv_playlists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure the default playlist reflects current verified streams
          const hasCustom = parsed.filter((p: Playlist) => p.id !== DEFAULT_PLAYLIST.id);
          return [DEFAULT_PLAYLIST, ...hasCustom];
        }
      }
    } catch {
      // ignore
    }
    return [DEFAULT_PLAYLIST];
  });

  const [currentPlaylistId, setCurrentPlaylistId] = useState<string>(() => {
    try {
      return localStorage.getItem('kaushik_iptv_active_playlist_id') || DEFAULT_PLAYLIST.id;
    } catch {
      return DEFAULT_PLAYLIST.id;
    }
  });

  const currentPlaylist = useMemo(() => {
    return playlists.find(p => p.id === currentPlaylistId) || playlists[0] || DEFAULT_PLAYLIST;
  }, [playlists, currentPlaylistId]);

  // Active channel
  const [activeChannel, setActiveChannel] = useState<Channel | null>(() => {
    try {
      const lastId = localStorage.getItem('kaushik_iptv_last_channel_id');
      if (lastId && currentPlaylist) {
        const found = currentPlaylist.channels.find(c => c.id === lastId);
        if (found) return found;
      }
    } catch {
      // ignore
    }
    return currentPlaylist.channels[0] || null;
  });

  // Playback status and exact technical error state
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>('idle');
  const [playbackErrorDetails, setPlaybackErrorDetails] = useState<PlaybackErrorDetails | null>(null);

  // Favorites
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('kaushik_iptv_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // History
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('kaushik_iptv_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Player settings
  const [playerSettings, setPlayerSettings] = useState<PlayerSettings>(() => {
    try {
      const saved = localStorage.getItem('kaushik_iptv_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Channels');

  // Modals & Panels
  const [isChannelListOpen, setIsChannelListOpen] = useState(false);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAndroidProjectModalOpen, setIsAndroidProjectModalOpen] = useState(false);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('kaushik_iptv_playlists', JSON.stringify(playlists));
    } catch {
      // ignore
    }
  }, [playlists]);

  useEffect(() => {
    try {
      localStorage.setItem('kaushik_iptv_active_playlist_id', currentPlaylistId);
    } catch {
      // ignore
    }
  }, [currentPlaylistId]);

  useEffect(() => {
    try {
      localStorage.setItem('kaushik_iptv_favorites', JSON.stringify(favoriteIds));
    } catch {
      // ignore
    }
  }, [favoriteIds]);

  useEffect(() => {
    try {
      localStorage.setItem('kaushik_iptv_history', JSON.stringify(history.slice(0, 30)));
    } catch {
      // ignore
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('kaushik_iptv_settings', JSON.stringify(playerSettings));
    } catch {
      // ignore
    }
  }, [playerSettings]);

  useEffect(() => {
    if (activeChannel) {
      try {
        localStorage.setItem('kaushik_iptv_last_channel_id', activeChannel.id);
      } catch {
        // ignore
      }
    }
  }, [activeChannel]);

  // Record playback into history and reset error state
  const playChannel = useCallback((channel: Channel) => {
    setActiveChannel(channel);
    setPlaybackErrorDetails(null);
    setPlaybackStatus('connecting');

    setHistory(prev => {
      const filtered = prev.filter(item => item.channel.id !== channel.id);
      return [{ channel, watchedAt: Date.now(), durationWatchedSec: 0 }, ...filtered].slice(0, 30);
    });
  }, []);

  // Quick action to play the verified HLS test stream
  const playTestStream = useCallback(() => {
    const testChannel =
      currentPlaylist.channels.find(c => c.category === 'HLS Test Streams') ||
      DEFAULT_PLAYLIST.channels[0];
    if (testChannel) {
      playChannel(testChannel);
    }
  }, [currentPlaylist, playChannel]);

  const stopPlayback = useCallback(() => {
    setActiveChannel(null);
    setPlaybackStatus('idle');
    setPlaybackErrorDetails(null);
  }, []);

  const isFavorite = useCallback(
    (channelId: string) => {
      return favoriteIds.includes(channelId);
    },
    [favoriteIds]
  );

  const toggleFavorite = useCallback((channelId: string) => {
    setFavoriteIds(prev =>
      prev.includes(channelId) ? prev.filter(id => id !== channelId) : [...prev, channelId]
    );
  }, []);

  // Ordered categories list with HLS Test Streams at top for quick player verification
  const categories = useMemo(() => {
    const desiredOrder = [
      'All Channels',
      'HLS Test Streams',
      'Bengali Entertainment',
      'Bengali News',
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
      'Favourites',
    ];

    const actualCats = new Set<string>();
    currentPlaylist.channels.forEach(ch => {
      if (ch.category) actualCats.add(ch.category);
    });

    const ordered: string[] = [];
    desiredOrder.forEach(cat => {
      if (cat === 'All Channels' || cat === 'Favourites' || actualCats.has(cat)) {
        ordered.push(cat);
      }
    });

    // Add any extra categories from user custom M3U
    actualCats.forEach(cat => {
      if (!ordered.includes(cat)) {
        ordered.push(cat);
      }
    });

    return ordered;
  }, [currentPlaylist]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    let list = currentPlaylist.channels;

    if (selectedCategory === 'Favourites') {
      list = list.filter(ch => favoriteIds.includes(ch.id));
    } else if (selectedCategory !== 'All Channels') {
      list = list.filter(ch => ch.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        ch =>
          ch.name.toLowerCase().includes(q) ||
          ch.category.toLowerCase().includes(q) ||
          (ch.channelNumber && ch.channelNumber.toString().includes(q))
      );
    }

    return list;
  }, [currentPlaylist, selectedCategory, searchQuery, favoriteIds]);

  // Channel switching actions
  const nextChannel = useCallback(() => {
    if (!activeChannel || currentPlaylist.channels.length === 0) return;
    const currentIndex = currentPlaylist.channels.findIndex(c => c.id === activeChannel.id);
    const nextIndex = (currentIndex + 1) % currentPlaylist.channels.length;
    playChannel(currentPlaylist.channels[nextIndex]);
  }, [activeChannel, currentPlaylist, playChannel]);

  const prevChannel = useCallback(() => {
    if (!activeChannel || currentPlaylist.channels.length === 0) return;
    const currentIndex = currentPlaylist.channels.findIndex(c => c.id === activeChannel.id);
    const prevIndex = (currentIndex - 1 + currentPlaylist.channels.length) % currentPlaylist.channels.length;
    playChannel(currentPlaylist.channels[prevIndex]);
  }, [activeChannel, currentPlaylist, playChannel]);

  const jumpToChannelNumber = useCallback(
    (num: number): boolean => {
      const found = currentPlaylist.channels.find(c => c.channelNumber === num);
      if (found) {
        playChannel(found);
        return true;
      }
      return false;
    },
    [currentPlaylist, playChannel]
  );

  // Playlist management
  const importPlaylistFromM3U = useCallback(
    (name: string, content: string, url?: string): Playlist => {
      const channels = parseM3U(content);
      if (channels.length === 0) {
        throw new Error('No valid streams or EXTINF channels could be found in the provided M3U file.');
      }

      const newPlaylist: Playlist = {
        id: `pl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: name.trim() || `Playlist (${channels.length} Channels)`,
        url,
        isCustom: true,
        channelCount: channels.length,
        channels,
        updatedAt: new Date().toISOString(),
      };

      setPlaylists(prev => [newPlaylist, ...prev]);
      setCurrentPlaylistId(newPlaylist.id);
      if (channels.length > 0) {
        playChannel(channels[0]);
      }

      return newPlaylist;
    },
    [playChannel]
  );

  const importPlaylistFromUrl = useCallback(
    async (url: string, name?: string) => {
      try {
        const trimmedUrl = url.trim();
        if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
          return { success: false, message: 'Please provide a valid HTTP or HTTPS playlist URL.' };
        }

        let response: Response;
        try {
          response = await fetch(trimmedUrl);
        } catch {
          // Fallback to CORS proxy
          const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(trimmedUrl)}`;
          response = await fetch(corsProxyUrl);
        }

        if (!response.ok) {
          return {
            success: false,
            message: `Server returned HTTP status ${response.status}. Unable to download playlist.`,
          };
        }

        const text = await response.text();
        if (!text || text.length < 10) {
          return { success: false, message: 'Playlist file was empty or could not be read.' };
        }

        const playlistTitle =
          name?.trim() || trimmedUrl.split('/').pop()?.replace(/(\.m3u8?)$/i, '') || 'Remote Live M3U';
        importPlaylistFromM3U(playlistTitle, text, trimmedUrl);

        return { success: true, message: `Successfully loaded playlist with live channels!` };
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : 'Network error';
        return { success: false, message: `Error loading playlist: ${errMsg}` };
      }
    },
    [importPlaylistFromM3U]
  );

  const switchPlaylist = useCallback(
    (playlistId: string) => {
      const pl = playlists.find(p => p.id === playlistId);
      if (pl) {
        setCurrentPlaylistId(playlistId);
        if (pl.channels.length > 0) {
          playChannel(pl.channels[0]);
        }
      }
    },
    [playlists, playChannel]
  );

  const deletePlaylist = useCallback(
    (playlistId: string) => {
      if (playlistId === DEFAULT_PLAYLIST.id) {
        alert('The default test playlist cannot be deleted.');
        return;
      }
      setPlaylists(prev => {
        const filtered = prev.filter(p => p.id !== playlistId);
        return filtered.length > 0 ? filtered : [DEFAULT_PLAYLIST];
      });
      if (currentPlaylistId === playlistId) {
        setCurrentPlaylistId(DEFAULT_PLAYLIST.id);
        if (DEFAULT_PLAYLIST.channels.length > 0) {
          playChannel(DEFAULT_PLAYLIST.channels[0]);
        }
      }
    },
    [currentPlaylistId, playChannel]
  );

  const refreshActivePlaylist = useCallback(async () => {
    if (!currentPlaylist.url) return;
    await importPlaylistFromUrl(currentPlaylist.url, currentPlaylist.name);
  }, [currentPlaylist, importPlaylistFromUrl]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem('kaushik_iptv_history');
    } catch {
      // ignore
    }
  }, []);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem('kaushik_iptv_favorites');
      localStorage.removeItem('kaushik_iptv_history');
      localStorage.removeItem('kaushik_iptv_settings');
      localStorage.removeItem('kaushik_iptv_last_channel_id');
      localStorage.removeItem('kaushik_iptv_playlists');
      localStorage.setItem('kaushik_iptv_cache_version', IPTV_CACHE_VERSION);
      setFavoriteIds([]);
      setHistory([]);
      setPlaylists([DEFAULT_PLAYLIST]);
      setCurrentPlaylistId(DEFAULT_PLAYLIST.id);
      setActiveChannel(DEFAULT_PLAYLIST.channels[0] || null);
      setPlayerSettings(DEFAULT_SETTINGS);
    } catch {
      // ignore
    }
  }, []);

  const updatePlayerSettings = useCallback((newSettings: Partial<PlayerSettings>) => {
    setPlayerSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Global Remote Control Keybindings
  useEffect(() => {
    let numberBuffer = '';
    let numberTimeout: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        numberBuffer += e.key;
        if (numberTimeout) clearTimeout(numberTimeout);

        numberTimeout = setTimeout(() => {
          const chNum = parseInt(numberBuffer, 10);
          jumpToChannelNumber(chNum);
          numberBuffer = '';
        }, 800);
        return;
      }

      switch (e.key) {
        case 'ChannelUp':
        case 'PageUp':
        case ']':
          e.preventDefault();
          nextChannel();
          break;
        case 'ChannelDown':
        case 'PageDown':
        case '[':
          e.preventDefault();
          prevChannel();
          break;
        case 'm':
        case 'M':
          updatePlayerSettings({ muted: !playerSettings.muted });
          break;
        case 't':
        case 'T':
          updatePlayerSettings({ tvMode: !playerSettings.tvMode });
          break;
        case 'Escape':
        case 'Backspace':
          if (isChannelListOpen) setIsChannelListOpen(false);
          else if (isPlaylistModalOpen) setIsPlaylistModalOpen(false);
          else if (isSettingsModalOpen) setIsSettingsModalOpen(false);
          else if (isAndroidProjectModalOpen) setIsAndroidProjectModalOpen(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (numberTimeout) clearTimeout(numberTimeout);
    };
  }, [
    nextChannel,
    prevChannel,
    jumpToChannelNumber,
    playerSettings.muted,
    playerSettings.tvMode,
    isChannelListOpen,
    isPlaylistModalOpen,
    isSettingsModalOpen,
    isAndroidProjectModalOpen,
    updatePlayerSettings,
  ]);

  return (
    <IPTVContext.Provider
      value={{
        currentPlaylist,
        playlists,
        activeChannel,
        favoriteIds,
        history,
        searchQuery,
        selectedCategory,
        playerSettings,
        filteredChannels,
        isChannelListOpen,
        isPlaylistModalOpen,
        isSettingsModalOpen,
        isAndroidProjectModalOpen,
        categories,
        playbackStatus,
        playbackErrorDetails,
        playChannel,
        playTestStream,
        stopPlayback,
        setPlaybackStatus,
        setPlaybackErrorDetails,
        nextChannel,
        prevChannel,
        jumpToChannelNumber,
        toggleFavorite,
        isFavorite,
        importPlaylistFromM3U,
        importPlaylistFromUrl,
        switchPlaylist,
        deletePlaylist,
        refreshActivePlaylist,
        clearHistory,
        clearCache,
        setSearchQuery,
        setSelectedCategory,
        updatePlayerSettings,
        setIsChannelListOpen,
        setIsPlaylistModalOpen,
        setIsSettingsModalOpen,
        setIsAndroidProjectModalOpen,
      }}
    >
      {children}
    </IPTVContext.Provider>
  );
};

export const useIPTV = () => {
  const context = useContext(IPTVContext);
  if (!context) {
    throw new Error('useIPTV must be used within an IPTVProvider');
  }
  return context;
};
