export interface Channel {
  id: string;
  name: string;
  logo: string;
  url: string;
  category: string;
  tvgId?: string;
  tvgName?: string;
  channelNumber?: number;
  country?: string;
  language?: string;
  resolution?: 'HD' | 'FHD' | '4K' | 'SD';
  isLive?: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  url?: string;
  isCustom?: boolean;
  channelCount: number;
  channels: Channel[];
  updatedAt: string;
}

export type IndianCategory =
  | 'All Channels'
  | 'HLS Test Streams'
  | 'Bengali Entertainment'
  | 'Bengali News'
  | 'Hindi Entertainment'
  | 'Hindi News'
  | 'English News'
  | 'Sports'
  | 'Movies'
  | 'Music'
  | 'Kids'
  | 'Religious / Devotional'
  | 'Educational'
  | 'Regional Channels'
  | 'Favourites';

export interface PlaybackQuality {
  id: number;
  height: number;
  width?: number;
  bitrate?: number;
  label: string;
}

export interface AudioTrackInfo {
  id: number;
  name: string;
  lang?: string;
}

export interface PlayerSettings {
  autoPlay: boolean;
  defaultVolume: number;
  muted: boolean;
  lowLatency: boolean;
  bufferLength: number; // in seconds
  preferredQuality: string;
  tvMode: boolean; // 10-foot Android TV mode
  showRemoteOverlay: boolean;
}

export interface WatchHistoryItem {
  channel: Channel;
  watchedAt: number;
  durationWatchedSec: number;
}

export type PlaybackStatus = 'idle' | 'connecting' | 'playing' | 'paused' | 'error';

export interface PlaybackErrorDetails {
  title: string;
  technicalError: string;
  httpStatus?: number | string;
  streamUrl: string;
  channelName: string;
  category: string;
  timestamp: string;
  suggestion: string;
}
