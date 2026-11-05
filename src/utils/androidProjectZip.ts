import JSZip from 'jszip';
import { SAMPLE_LEGAL_CHANNELS } from '../data/defaultPlaylists';
import { exportToM3U } from './m3uParser';

export async function generateAndroidStudioProjectZip(): Promise<Blob> {
  const zip = new JSZip();

  // Root project files
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "KaushikLiveTV"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
`
  );

  // App module build.gradle.kts
  zip.file(
    'app/build.gradle.kts',
    `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.streamz.kaushiklivetv"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.streamz.kaushiklivetv"
        minSdk = 26 // Android 8.0 Oreo and above
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Jetpack Compose BOM & UI
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Android TV Compose & Leanback
    implementation("androidx.tv:tv-foundation:1.0.0-alpha10")
    implementation("androidx.tv:tv-material:1.0.0-alpha10")
    implementation("androidx.leanback:leanback:1.0.0")

    // AndroidX Media3 ExoPlayer (Latest Live Streaming Engine)
    implementation("androidx.media3:media3-exoplayer:1.3.0")
    implementation("androidx.media3:media3-exoplayer-hls:1.3.0")
    implementation("androidx.media3:media3-ui:1.3.0")
    implementation("androidx.media3:media3-common:1.3.0")

    // Coil for Channel Logo Image Loading
    implementation("io.coil-kt:coil-compose:2.6.0")

    // Coroutines & OkHttp for M3U downloading
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}
`
  );

  // AndroidManifest.xml
  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions required for IPTV streaming and TV storage -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

    <!-- Android TV compatibility features -->
    <uses-feature
        android:name="android.hardware.touchscreen"
        android:required="false" />
    <uses-feature
        android:name="android.software.leanback"
        android:required="false" />

    <application
        android:allowBackup="true"
        android:banner="@drawable/tv_banner"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.KaushikLiveTV"
        android:usesCleartextTraffic="true"
        tools:targetApi="34">

        <!-- Mobile Entry Point Activity -->
        <activity
            android:name=".MainActivity"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:exported="true"
            android:theme="@style/Theme.KaushikLiveTV">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Dedicated Android Smart TV Leanback Activity -->
        <activity
            android:name=".TvMainActivity"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:exported="true"
            android:theme="@style/Theme.KaushikLiveTV.Tv">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LEANBACK_LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- Fullscreen Live Player Activity -->
        <activity
            android:name=".PlayerActivity"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:exported="false"
            android:screenOrientation="sensorLandscape"
            android:theme="@style/Theme.KaushikLiveTV.Fullscreen" />
    </application>

</manifest>
`
  );

  // Channel.kt
  zip.file(
    'app/src/main/java/com/streamz/kaushiklivetv/model/Channel.kt',
    `package com.streamz.kaushiklivetv.model

data class Channel(
    val id: String,
    val name: String,
    val logo: String,
    val url: String,
    val category: String,
    val channelNumber: Int = 0,
    val tvgId: String? = null,
    val resolution: String = "HD",
    val isLive: Boolean = true
)
`
  );

  // M3uParser.kt
  zip.file(
    'app/src/main/java/com/streamz/kaushiklivetv/parser/M3uParser.kt',
    `package com.streamz.kaushiklivetv.parser

import com.streamz.kaushiklivetv.model.Channel
import java.util.UUID

object M3uParser {
    fun parse(content: String): List<Channel> {
        val channels = mutableListOf<Channel>()
        val lines = content.lines()
        var currentChannel: Channel? = null
        var counter = 1

        val logoRegex = Regex("""tvg-logo="([^"]*)"""", RegexOption.IGNORE_CASE)
        val nameRegex = Regex("""tvg-name="([^"]*)"""", RegexOption.IGNORE_CASE)
        val groupRegex = Regex("""group-title="([^"]*)"""", RegexOption.IGNORE_CASE)
        val chnoRegex = Regex("""tvg-chno="([^"]*)"""", RegexOption.IGNORE_CASE)

        for (rawLine in lines) {
            val line = rawLine.trim()
            if (line.startsWith("#EXTINF:")) {
                val logo = logoRegex.find(line)?.groupValues?.get(1) ?: ""
                val groupTitle = groupRegex.find(line)?.groupValues?.get(1) ?: "General"
                val chNoStr = chnoRegex.find(line)?.groupValues?.get(1)
                val chNumber = chNoStr?.toIntOrNull() ?: counter

                val commaIndex = line.lastIndexOf(',')
                val title = if (commaIndex != -1) line.substring(commaIndex + 1).trim() else "Channel \$counter"

                currentChannel = Channel(
                    id = UUID.randomUUID().toString(),
                    name = title,
                    logo = logo,
                    url = "",
                    category = groupTitle,
                    channelNumber = chNumber,
                    resolution = if (title.contains("4K", true)) "4K" else if (title.contains("FHD", true) || title.contains("1080", true)) "FHD" else "HD"
                )
                counter++
            } else if (line.isNotEmpty() && !line.startsWith("#")) {
                if (currentChannel != null && (line.startsWith("http://") || line.startsWith("https://"))) {
                    channels.add(currentChannel.copy(url = line))
                    currentChannel = null
                }
            }
        }
        return channels
    }
}
`
  );

  // ExoPlayerManager.kt
  zip.file(
    'app/src/main/java/com/streamz/kaushiklivetv/player/ExoPlayerManager.kt',
    `package com.streamz.kaushiklivetv.player

import android.content.Context
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.util.UnstableApi
import androidx.media3.exoplayer.DefaultLoadControl
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.datasource.DefaultHttpDataSource

@OptIn(UnstableApi::class)
class ExoPlayerManager(private val context: Context) {
    var player: ExoPlayer? = null
        private set

    fun initializePlayer(): ExoPlayer {
        val loadControl = DefaultLoadControl.Builder()
            .setBufferDurationsMs(
                5000,   // Min buffer ms
                15000,  // Max buffer ms
                1500,   // Buffer for playback ms
                2500    // Buffer for playback after rebuffer ms
            )
            .build()

        player = ExoPlayer.Builder(context)
            .setLoadControl(loadControl)
            .build()

        return player!!
    }

    fun playStream(url: String) {
        val exo = player ?: initializePlayer()
        val dataSourceFactory = DefaultHttpDataSource.Factory()
            .setAllowCrossProtocolRedirects(true)
            .setUserAgent("KAUSHIK-LIVE-TV-AndroidExo/1.0")

        val mediaSource = HlsMediaSource.Factory(dataSourceFactory)
            .createMediaSource(MediaItem.fromUri(url))

        exo.setMediaSource(mediaSource)
        exo.prepare()
        exo.playWhenReady = true
    }

    fun release() {
        player?.release()
        player = null
    }
}
`
  );

  // MainActivity.kt (Mobile Jetpack Compose UI)
  zip.file(
    'app/src/main/java/com/streamz/kaushiklivetv/MainActivity.kt',
    `package com.streamz.kaushiklivetv

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.ui.PlayerView
import com.streamz.kaushiklivetv.model.Channel
import com.streamz.kaushiklivetv.parser.M3uParser
import com.streamz.kaushiklivetv.player.ExoPlayerManager

class MainActivity : ComponentActivity() {
    private lateinit var playerManager: ExoPlayerManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        playerManager = ExoPlayerManager(this)

        // Read bundled sample playlist from assets
        val sampleM3u = assets.open("sample_playlist.m3u").bufferedReader().use { it.readText() }
        val channels = M3uParser.parse(sampleM3u)

        setContent {
            var activeChannel by remember { mutableStateOf(channels.firstOrNull()) }

            LaunchedEffect(activeChannel) {
                activeChannel?.let { playerManager.playStream(it.url) }
            }

            Surface(
                modifier = Modifier.fillMaxSize(),
                color = Color(0xFF07070E)
            ) {
                Column(modifier = Modifier.fillMaxSize()) {
                    // Top App Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "KAUSHIK LIVE TV",
                            style = MaterialTheme.typography.titleLarge,
                            color = Color.White
                        )
                    }

                    // ExoPlayer Video View
                    AndroidView(
                        factory = { ctx ->
                            PlayerView(ctx).apply {
                                player = playerManager.initializePlayer()
                                useController = true
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .aspectRatio(16f / 9f)
                            .background(Color.Black)
                    )

                    // Channels List
                    Text(
                        text = "Current: \${activeChannel?.name ?: "No Channel"}",
                        color = Color.Cyan,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        playerManager.release()
    }
}
`
  );

  // TvMainActivity.kt (Dedicated Smart TV D-Pad navigation UI)
  zip.file(
    'app/src/main/java/com/streamz/kaushiklivetv/TvMainActivity.kt',
    `package com.streamz.kaushiklivetv

import android.os.Bundle
import android.view.KeyEvent
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.ui.PlayerView
import com.streamz.kaushiklivetv.model.Channel
import com.streamz.kaushiklivetv.parser.M3uParser
import com.streamz.kaushiklivetv.player.ExoPlayerManager

class TvMainActivity : ComponentActivity() {
    private lateinit var playerManager: ExoPlayerManager
    private var channels: List<Channel> = emptyList()
    private var currentIndex = 0

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        playerManager = ExoPlayerManager(this)

        val sampleM3u = assets.open("sample_playlist.m3u").bufferedReader().use { it.readText() }
        channels = M3uParser.parse(sampleM3u)

        setContent {
            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = playerManager.initializePlayer()
                        useController = true
                    }
                },
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black)
            )
        }

        if (channels.isNotEmpty()) {
            playerManager.playStream(channels[0].url)
        }
    }

    // Android TV Remote D-Pad & Channel Key handling
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        return when (keyCode) {
            KeyEvent.KEYCODE_CHANNEL_UP, KeyEvent.KEYCODE_PAGE_UP -> {
                switchChannel(1)
                true
            }
            KeyEvent.KEYCODE_CHANNEL_DOWN, KeyEvent.KEYCODE_PAGE_DOWN -> {
                switchChannel(-1)
                true
            }
            else -> super.onKeyDown(keyCode, event)
        }
    }

    private fun switchChannel(delta: Int) {
        if (channels.isEmpty()) return
        currentIndex = (currentIndex + delta + channels.size) % channels.size
        playerManager.playStream(channels[currentIndex].url)
    }

    override fun onDestroy() {
        super.onDestroy()
        playerManager.release()
    }
}
`
  );

  // Bundled sample M3U in Android assets
  const sampleM3uText = exportToM3U(SAMPLE_LEGAL_CHANNELS, 'KAUSHIK_LIVE_TV_PRESET');
  zip.file('app/src/main/assets/sample_playlist.m3u', sampleM3uText);

  // Strings.xml
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">KAUSHIK LIVE TV</string>
    <string name="app_brand">STREAMZ WORLD</string>
    <string name="access_model">100% Free Forever</string>
</resources>
`
  );

  // Themes.xml
  zip.file(
    'app/src/main/res/values/themes.xml',
    `<resources>
    <style name="Theme.KaushikLiveTV" parent="android:Theme.Material.NoActionBar">
        <item name="android:statusBarColor">#07070E</item>
        <item name="android:navigationBarColor">#07070E</item>
    </style>

    <style name="Theme.KaushikLiveTV.Tv" parent="Theme.Leanback">
        <item name="android:windowBackground">#07070E</item>
    </style>

    <style name="Theme.KaushikLiveTV.Fullscreen" parent="android:Theme.Material.NoActionBar.Fullscreen">
        <item name="android:windowBackground">#000000</item>
    </style>
</resources>
`
  );

  // README with build instructions
  zip.file(
    'README.md',
    `# KAUSHIK LIVE TV — STREAMZ WORLD
### 100% Free Live IPTV Streaming Application for Android Mobile and Android Smart TV

Built with:
- **Language**: Kotlin
- **Player**: AndroidX Media3 ExoPlayer with HLS (.m3u8) streaming
- **UI Framework**: Jetpack Compose & Android TV Compose (Leanback)
- **Navigation**: D-pad remote control (Up/Down/Left/Right/OK) and Mobile touch
- **Playlist Engine**: M3U & M3U8 parser with EXTINF metadata support
- **Licensing**: 100% Free Forever, No Subscription, No Paywalls

---

## How to Build the Android APK in Android Studio

1. **Extract this ZIP file** to your development folder.
2. Open **Android Studio Hedgehog / Iguana / Jellyfish** (or later).
3. Select **File > Open** and choose this project directory.
4. Let Gradle sync project dependencies.
5. **Build APK**:
   - In terminal, execute:
     \`\`\`bash
     ./gradlew assembleDebug
     \`\`\`
   - Or in the menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
6. The compiled APK will be located at:
   \`app/build/outputs/apk/debug/app-debug.apk\`
7. **Install on Android Mobile / Smart TV**:
   - Transfer \`app-debug.apk\` to your device via USB or ADB:
     \`\`\`bash
     adb install -r app/build/outputs/apk/debug/app-debug.apk
     \`\`\`

---
© STREAMZ WORLD — KAUSHIK LIVE TV.
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
