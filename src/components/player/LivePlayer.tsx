import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings,
  Heart,
  Radio,
  Tv,
  List,
  Check,
  AlertTriangle,
  PictureInPicture2,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { useIPTV } from '../../context/IPTVContext';
import { PlaybackQuality, AudioTrackInfo, PlaybackErrorDetails } from '../../types/iptv';

export const LivePlayer: React.FC = () => {
  const {
    activeChannel,
    nextChannel,
    prevChannel,
    toggleFavorite,
    isFavorite,
    playerSettings,
    updatePlayerSettings,
    isChannelListOpen,
    setIsChannelListOpen,
    playbackStatus,
    setPlaybackStatus,
    playbackErrorDetails,
    setPlaybackErrorDetails,
    playTestStream,
  } = useIPTV();

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(playerSettings.defaultVolume / 100);
  const [isMuted, setIsMuted] = useState<boolean>(playerSettings.muted);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [channelBannerVisible, setChannelBannerVisible] = useState<boolean>(true);

  // Quality & Audio levels
  const [qualities, setQualities] = useState<PlaybackQuality[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = Auto
  const [audioTracks, setAudioTracks] = useState<AudioTrackInfo[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(-1);
  const [showSettingsMenu, setShowSettingsMenu] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bannerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-hide controls
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && playbackStatus === 'playing') {
        setShowControls(false);
        setShowSettingsMenu(false);
      }
    }, 4000);
  }, [isPlaying, playbackStatus]);

  // Show banner temporarily on channel change
  const triggerChannelBanner = useCallback(() => {
    setChannelBannerVisible(true);
    if (bannerTimeoutRef.current) clearTimeout(bannerTimeoutRef.current);
    bannerTimeoutRef.current = setTimeout(() => {
      setChannelBannerVisible(false);
    }, 4500);
  }, []);

  // Main HLS and playback engine
  useEffect(() => {
    if (!activeChannel || !videoRef.current) return;

    setIsLoading(true);
    setPlaybackStatus('connecting');
    setPlaybackErrorDetails(null);
    triggerChannelBanner();

    const video = videoRef.current;
    const streamUrl = activeChannel.url.trim();

    // Destroy previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsStream = streamUrl.includes('.m3u8') || streamUrl.includes('manifest');

    if (isHlsStream && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: playerSettings.lowLatency,
        backBufferLength: playerSettings.bufferLength,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        startLevel: -1, // Auto
        manifestLoadingTimeOut: 12000,
        manifestLoadingMaxRetry: 2,
        levelLoadingTimeOut: 12000,
        fragLoadingTimeOut: 15000,
      });

      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        setIsLoading(false);
        setPlaybackErrorDetails(null);

        // Populate quality levels
        const mappedQualities: PlaybackQuality[] = data.levels.map((lvl, index) => ({
          id: index,
          height: lvl.height,
          width: lvl.width,
          bitrate: lvl.bitrate,
          label: lvl.height ? `${lvl.height}p` : `Stream ${index + 1}`,
        }));
        setQualities(mappedQualities);
        setCurrentQuality(-1);

        if (playerSettings.autoPlay) {
          video.play().catch(() => {
            // Autoplay with sound may be blocked by browser policy; retry muted
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {
              setIsPlaying(false);
              setPlaybackStatus('paused');
            });
          });
        }
      });

      hls.on(Hls.Events.AUDIO_TRACKS_UPDATED, (_, data) => {
        const mappedTracks: AudioTrackInfo[] = data.audioTracks.map(track => ({
          id: track.id,
          name: track.name || track.lang || `Track ${track.id}`,
          lang: track.lang,
        }));
        setAudioTracks(mappedTracks);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
        if (hls.autoLevelEnabled) {
          setCurrentQuality(-1);
        } else {
          setCurrentQuality(data.level);
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        const httpCode = data.response?.code;
        const details = data.details || 'unknown';
        const type = data.type || 'HLS_ERROR';

        if (data.fatal) {
          setIsLoading(false);
          setPlaybackStatus('error');

          let explanation = 'The stream server failed to respond or blocked the connection.';
          if (httpCode === 403) {
            explanation = 'HTTP 403 Forbidden: Source stream requires token authorization or is geo-blocked.';
          } else if (httpCode === 404) {
            explanation = 'HTTP 404 Not Found: Live playlist manifest is currently expired or offline on the broadcaster CDN.';
          } else if (details === 'manifestLoadError') {
            explanation = 'Manifest Load Error: Network connection dropped, DNS failed, or CORS headers are missing.';
          } else if (details === 'bufferAppendError') {
            explanation = 'Media buffer append failed: Codec or segment incompatibility with browser engine.';
          }

          const errorInfo: PlaybackErrorDetails = {
            title: `Playback Error: ${details}`,
            technicalError: `[${type}] ${details} ${httpCode ? `(HTTP ${httpCode})` : ''}`,
            httpStatus: httpCode,
            streamUrl,
            channelName: activeChannel.name,
            category: activeChannel.category,
            timestamp: new Date().toLocaleTimeString(),
            suggestion: 'Use "Reconnect Stream" or switch to the sample HLS test stream to verify player health.',
          };

          setPlaybackErrorDetails(errorInfo);

          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHlsStream) {
      // Native Safari HLS or direct MP4/WebM video
      video.src = streamUrl;
      video.load();

      const handleCanPlay = () => {
        setIsLoading(false);
        setPlaybackErrorDetails(null);
        if (playerSettings.autoPlay) {
          video.play().catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {
              setIsPlaying(false);
              setPlaybackStatus('paused');
            });
          });
        }
      };

      const handleError = () => {
        setIsLoading(false);
        setPlaybackStatus('error');
        const mediaErr = video.error;
        const errorInfo: PlaybackErrorDetails = {
          title: 'Native Media Playback Error',
          technicalError: mediaErr
            ? `MediaError Code ${mediaErr.code}: ${mediaErr.message || 'MEDIA_ERR_SRC_NOT_SUPPORTED'}`
            : 'Direct HTML5 Video Error: Source unavailable or CORS blocked',
          httpStatus: mediaErr?.code,
          streamUrl,
          channelName: activeChannel.name,
          category: activeChannel.category,
          timestamp: new Date().toLocaleTimeString(),
          suggestion: 'Check network connectivity or switch to the verified HLS Test Stream.',
        };
        setPlaybackErrorDetails(errorInfo);
      };

      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
      };
    } else {
      setIsLoading(false);
      setPlaybackStatus('error');
      setPlaybackErrorDetails({
        title: 'HLS Live Media Unsupported',
        technicalError: 'Browser lacks MediaSource Extensions (MSE) and native HLS support.',
        streamUrl,
        channelName: activeChannel.name,
        category: activeChannel.category,
        timestamp: new Date().toLocaleTimeString(),
        suggestion: 'Please use a modern browser such as Chrome, Edge, Firefox, or Safari.',
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [
    activeChannel,
    playerSettings.autoPlay,
    playerSettings.lowLatency,
    playerSettings.bufferLength,
    retryCount,
    triggerChannelBanner,
    setPlaybackStatus,
    setPlaybackErrorDetails,
  ]);

  // Volume & Mute sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Play / Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setPlaybackStatus('playing');
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      setPlaybackStatus('paused');
    }
    resetControlsTimer();
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Picture in Picture
  const togglePiP = async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {
      console.warn('PiP not available', e);
    }
  };

  const handleQualityChange = (levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      setShowSettingsMenu(false);
    }
  };

  const handleAudioTrackChange = (trackIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackIndex;
      setCurrentAudioTrack(trackIndex);
      setShowSettingsMenu(false);
    }
  };

  const handleRetry = () => {
    setPlaybackErrorDetails(null);
    setIsLoading(true);
    setPlaybackStatus('connecting');
    setRetryCount(c => c + 1);
  };

  if (!activeChannel) {
    return (
      <div className="w-full aspect-video max-h-[68vh] bg-[#090b16] rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-white/5">
        <Tv className="w-16 h-16 text-indigo-400/50 mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-white mb-2">No Channel Selected</h3>
        <p className="text-slate-400 text-sm max-w-md">
          Select any channel from the categories below or verify your player using the sample HLS test stream.
        </p>
      </div>
    );
  }

  const isFav = isFavorite(activeChannel.id);
  const isActivelyLive = playbackStatus === 'playing';

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimer}
      onClick={resetControlsTimer}
      className={`relative w-full aspect-video max-h-[72vh] bg-black rounded-2xl overflow-hidden shadow-2xl group border border-white/10 select-none ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none max-h-none h-screen' : ''
      }`}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-contain bg-black"
        onPlay={() => {
          setIsPlaying(true);
          setPlaybackStatus('playing');
        }}
        onPause={() => {
          setIsPlaying(false);
          setPlaybackStatus('paused');
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setPlaybackStatus('playing');
        }}
      />

      {/* Loading Spinner */}
      {isLoading && !playbackErrorDetails && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-xs pointer-events-none z-20">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-purple-500/30 border-b-purple-400 animate-spin animate-reverse" />
          </div>
          <span className="mt-4 text-xs font-semibold tracking-wider text-indigo-300 uppercase animate-pulse">
            Connecting Stream...
          </span>
        </div>
      )}

      {/* Detailed Technical Error Display Overlay */}
      {playbackErrorDetails && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-6 text-center z-30 overflow-y-auto">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h4 className="text-lg font-bold text-white mb-1">{playbackErrorDetails.title}</h4>
          <p className="text-xs text-rose-300 max-w-lg mb-3 font-mono bg-rose-950/60 p-2 rounded-xl border border-rose-500/30 break-all">
            {playbackErrorDetails.technicalError}
          </p>

          <p className="text-xs text-slate-300 max-w-lg mb-2">{playbackErrorDetails.suggestion}</p>

          <div className="text-[11px] text-slate-400 font-mono mb-6 max-w-lg truncate bg-black/60 p-2 rounded-lg border border-white/10">
            Source: <span className="text-slate-300">{playbackErrorDetails.streamUrl}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reconnect Stream
            </button>

            <button
              onClick={playTestStream}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs transition-all shadow-lg shadow-emerald-900/40 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Verify Player with Sample HLS Stream
            </button>

            <button
              onClick={nextChannel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all border border-white/10 cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
              Next Channel
            </button>
          </div>
        </div>
      )}

      {/* Channel Number / Name Info Banner on Channel Switch */}
      {channelBannerVisible && (
        <div className="absolute top-6 left-6 z-20 pointer-events-none transition-all duration-500 ease-out">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-white/15 shadow-2xl">
            {activeChannel.logo ? (
              <img
                src={activeChannel.logo}
                alt={activeChannel.name}
                className="w-10 h-10 object-contain rounded-lg bg-black/40 p-1"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold">
                {activeChannel.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                {activeChannel.channelNumber && (
                  <span className="text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    CH {activeChannel.channelNumber}
                  </span>
                )}
                <h3 className="text-base font-bold text-white tracking-wide">{activeChannel.name}</h3>

                {/* Never show as LIVE unless stream is actually playing */}
                {isActivelyLive ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-live-glow" />
                    LIVE
                  </span>
                ) : playbackStatus === 'connecting' ? (
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    CONNECTING
                  </span>
                ) : playbackStatus === 'error' ? (
                  <span className="text-[10px] uppercase font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                    STREAM OFFLINE
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{activeChannel.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* Player Header Controls (Channel Quick List & Settings) */}
      <div
        className={`absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChannelListOpen(!isChannelListOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-md border border-white/10 transition-all cursor-pointer"
            title="Toggle Live Channel Guide"
          >
            <List className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Channel List</span>
          </button>
          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            Press [ / ] for Channels • 0-9 to dial
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Resolution Badge */}
          <span className="px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold tracking-wider uppercase">
            {activeChannel.resolution || 'HD'}
          </span>

          {/* Favorite Button */}
          <button
            onClick={() => toggleFavorite(activeChannel.id)}
            className={`p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
              isFav
                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                : 'bg-white/10 text-white/70 hover:text-white border-white/10 hover:bg-white/20'
            }`}
            title={isFav ? 'Remove from Favourites' : 'Add to Favourites'}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 p-4 pt-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-3 z-20 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Progress bar / Live timeline */}
        <div className="w-full flex items-center justify-between text-[11px] text-slate-400 px-1">
          <div className="flex items-center gap-2">
            {isActivelyLive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-live-glow" />
                <span className="font-semibold text-slate-200 uppercase tracking-wider">LIVE BROADCAST</span>
              </>
            ) : playbackStatus === 'connecting' ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-semibold text-amber-300 uppercase tracking-wider">CONNECTING STREAM...</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                <span className="font-semibold text-slate-400 uppercase tracking-wider">
                  {playbackStatus.toUpperCase()}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-indigo-300">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>HLS.js / Media3 ExoPlayer Engine</span>
          </div>
        </div>

        {/* Control Buttons Bar */}
        <div className="flex items-center justify-between gap-4">
          {/* Left Buttons: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={prevChannel}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 cursor-pointer"
              title="Previous Channel ([ or PageUp)"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlay}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/40 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            <button
              onClick={nextChannel}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10 cursor-pointer"
              title="Next Channel (] or PageDown)"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-2 ml-2 group/volume">
              <button
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  updatePlayerSettings({ muted: newMuted });
                }}
                className="p-2 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  setIsMuted(false);
                  updatePlayerSettings({ defaultVolume: Math.round(val * 100), muted: false });
                }}
                className="w-16 sm:w-24 h-1.5 bg-slate-700/60 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Right Buttons: Quality/Settings, PiP, Fullscreen */}
          <div className="flex items-center gap-2 relative">
            {/* Stream Settings / Quality Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className={`p-2.5 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
                  showSettingsMenu
                    ? 'bg-indigo-600 text-white border-indigo-400'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                }`}
                title="Playback Quality & Audio Tracks"
              >
                <Settings className="w-5 h-5" />
              </button>

              {/* Quality Dropdown Popup */}
              {showSettingsMenu && (
                <div className="absolute bottom-full right-0 mb-3 w-56 rounded-2xl glass-dropdown p-3 shadow-2xl z-50 text-xs">
                  <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] mb-2 px-2">
                    Video Quality
                  </div>
                  <div className="flex flex-col gap-1 mb-3">
                    <button
                      onClick={() => handleQualityChange(-1)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        currentQuality === -1 ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      <span>Auto (Adaptive HD)</span>
                      {currentQuality === -1 && <Check className="w-3.5 h-3.5" />}
                    </button>
                    {qualities.map(q => (
                      <button
                        key={q.id}
                        onClick={() => handleQualityChange(q.id)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                          currentQuality === q.id ? 'bg-indigo-600 text-white font-bold' : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span>{q.label}</span>
                        {currentQuality === q.id && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>

                  {audioTracks.length > 1 && (
                    <>
                      <div className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] mb-2 px-2 border-t border-white/10 pt-2">
                        Audio Track
                      </div>
                      <div className="flex flex-col gap-1">
                        {audioTracks.map(track => (
                          <button
                            key={track.id}
                            onClick={() => handleAudioTrackChange(track.id)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                              currentAudioTrack === track.id
                                ? 'bg-indigo-600 text-white font-bold'
                                : 'text-slate-300 hover:bg-white/5'
                            }`}
                          >
                            <span>{track.name}</span>
                            {currentAudioTrack === track.id && <Check className="w-3.5 h-3.5" />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* PiP */}
            <button
              onClick={togglePiP}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all hidden sm:flex cursor-pointer"
              title="Picture-in-Picture"
            >
              <PictureInPicture2 className="w-5 h-5" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-all cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F)'}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
