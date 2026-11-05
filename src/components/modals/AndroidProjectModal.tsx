import React, { useState } from 'react';
import {
  X,
  Download,
  FolderGit2,
  Check,
  Tv,
  Smartphone,
  Code2,
  Terminal,
  FileCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useIPTV } from '../../context/IPTVContext';
import { generateAndroidStudioProjectZip } from '../../utils/androidProjectZip';

export const AndroidProjectModal: React.FC = () => {
  const { isAndroidProjectModalOpen, setIsAndroidProjectModalOpen } = useIPTV();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'exoplayer' | 'manifest' | 'tvactivity' | 'parser'>('exoplayer');

  if (!isAndroidProjectModalOpen) return null;

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateAndroidStudioProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'KaushikLiveTV-AndroidStudio-Media3ExoPlayer.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0c0e1e] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#0e1124]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/30">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Android Studio Project & APK Deliverables</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Kotlin + Media3
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Complete production codebase for Android Mobile & Smart TV (ExoPlayer + Leanback)
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAndroidProjectModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Top Download Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-teal-950/40 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" /> Ready for Compilation
              </div>
              <h3 className="text-base font-bold text-white">Complete Android Studio Source Package (.ZIP)</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Includes Gradle build system, AndroidX Media3 ExoPlayer HLS module, Jetpack Compose UI,
                TV Leanback remote handlers, M3U parser, and bundled Indian FTA channels.
              </p>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isDownloading ? (
                <span>Packing ZIP...</span>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download Project (.ZIP)
                </>
              )}
            </button>
          </div>

          {/* Architecture Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                <Smartphone className="w-4 h-4" />
                <span>Android Mobile</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Jetpack Compose UI with adaptive portrait and landscape fullscreen player, touch gestures and bottom guide.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                <Tv className="w-4 h-4" />
                <span>Android Smart TV</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Dedicated Leanback launcher intent, D-Pad focus borders, OK button play, and remote channel switching.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/5">
              <div className="flex items-center gap-2 text-teal-400 text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Media3 ExoPlayer</span>
              </div>
              <p className="text-[11px] text-slate-400">
                HlsMediaSource with DefaultLoadControl, auto-reconnect, multi-bitrate level switching, and low latency buffer.
              </p>
            </div>
          </div>

          {/* Quick APK Build Terminal Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Build APK in 2 Minutes
            </h4>
            <div className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-slate-300 space-y-2">
              <p className="text-slate-500"># 1. Unzip and navigate to project folder</p>
              <p className="text-indigo-400">cd KaushikLiveTV</p>
              <p className="text-slate-500"># 2. Build debug APK directly via Gradle</p>
              <p className="text-emerald-400">./gradlew assembleDebug</p>
              <p className="text-slate-500"># 3. Output APK location</p>
              <p className="text-slate-300">app/build/outputs/apk/debug/app-debug.apk</p>
              <p className="text-slate-500"># 4. Install onto Android Mobile or Android TV via ADB</p>
              <p className="text-amber-300">adb install -r app/build/outputs/apk/debug/app-debug.apk</p>
            </div>
          </div>

          {/* Code Viewer Preview Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-400" />
                Kotlin Source Files Included
              </h4>
            </div>

            <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveCodeTab('exoplayer')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeCodeTab === 'exoplayer'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                ExoPlayerManager.kt
              </button>
              <button
                onClick={() => setActiveCodeTab('tvactivity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeCodeTab === 'tvactivity'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                TvMainActivity.kt
              </button>
              <button
                onClick={() => setActiveCodeTab('parser')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeCodeTab === 'parser'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                M3uParser.kt
              </button>
              <button
                onClick={() => setActiveCodeTab('manifest')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                  activeCodeTab === 'manifest'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                AndroidManifest.xml
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black border border-white/10 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto">
              {activeCodeTab === 'exoplayer' && (
                <pre>{`class ExoPlayerManager(private val context: Context) {
    var player: ExoPlayer? = null
        private set

    fun initializePlayer(): ExoPlayer {
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(5000, 15000, 1500, 2500)
            .build()

        player = ExoPlayer.Builder(context)
            .setLoadControl(loadControl)
            .build()
        return player!!
    }

    fun playStream(url: String) {
        val exo = player ?: initializePlayer()
        val mediaSource = HlsMediaSource.Factory(DefaultHttpDataSource.Factory())
            .createMediaSource(MediaItem.fromUri(url))
        exo.setMediaSource(mediaSource)
        exo.prepare()
        exo.playWhenReady = true
    }
}`}</pre>
              )}

              {activeCodeTab === 'tvactivity' && (
                <pre>{`class TvMainActivity : ComponentActivity() {
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_CHANNEL_UP, KeyEvent.KEYCODE_PAGE_UP -> {
                switchChannel(1); true
            }
            KeyEvent.KEYCODE_CHANNEL_DOWN, KeyEvent.KEYCODE_PAGE_DOWN -> {
                switchChannel(-1); true
            }
            else -> super.onKeyDown(keyCode, event)
        }
    }
}`}</pre>
              )}

              {activeCodeTab === 'parser' && (
                <pre>{`object M3uParser {
    fun parse(content: String): List<Channel> {
        val channels = mutableListOf<Channel>()
        // Parses #EXTINF, tvg-logo, group-title, tvg-chno, and live streams
        ...
        return channels
    }
}`}</pre>
              )}

              {activeCodeTab === 'manifest' && (
                <pre>{`<manifest ...>
    <uses-feature android:name="android.software.leanback" android:required="false" />
    <uses-feature android:name="android.hardware.touchscreen" android:required="false" />
    <activity android:name=".TvMainActivity">
        <intent-filter>
            <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
        </intent-filter>
    </activity>
</manifest>`}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
