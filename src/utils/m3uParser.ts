import { Channel } from '../types/iptv';

// Normalizes category/group-title to Indian channel categories when appropriate
export function normalizeCategory(groupTitle: string, channelName: string): string {
  const text = `${groupTitle} ${channelName}`.toLowerCase();

  if (text.includes('test') || text.includes('sample hls') || text.includes('hls test')) {
    return 'HLS Test Streams';
  }

  if (text.includes('bengal') || text.includes('bangla') || text.includes('kolkata') || text.includes('calcutta')) {
    if (text.includes('news') || text.includes('khabor')) {
      return 'Bengali News';
    }
    return 'Bengali Entertainment';
  }

  if (text.includes('sports') || text.includes('cricket') || text.includes('football') || text.includes('khel')) {
    return 'Sports';
  }

  if (text.includes('kids') || text.includes('cartoon') || text.includes('pogo') || text.includes('child')) {
    return 'Kids';
  }

  if (text.includes('movie') || text.includes('cinema') || text.includes('film')) {
    return 'Movies';
  }

  if (text.includes('music') || text.includes('song') || text.includes('gaana') || text.includes('sangeet')) {
    return 'Music';
  }

  if (
    text.includes('devotion') ||
    text.includes('bhakti') ||
    text.includes('puja') ||
    text.includes('religious') ||
    text.includes('temple') ||
    text.includes('dharma') ||
    text.includes('quran') ||
    text.includes('satsang')
  ) {
    return 'Religious / Devotional';
  }

  if (
    text.includes('education') ||
    text.includes('science') ||
    text.includes('gyan') ||
    text.includes('swayam prabha') ||
    text.includes('vidya') ||
    text.includes('study') ||
    text.includes('docu')
  ) {
    return 'Educational';
  }

  if (text.includes('hindi') || text.includes('india') || text.includes('dd ')) {
    if (text.includes('news') || text.includes('samachar')) {
      return 'Hindi News';
    }
    return 'Hindi Entertainment';
  }

  if (
    text.includes('news') ||
    text.includes('headline') ||
    text.includes('bbc') ||
    text.includes('cnn') ||
    text.includes('al jazeera') ||
    text.includes('dw') ||
    text.includes('france 24')
  ) {
    return 'English News';
  }

  if (
    text.includes('tamil') ||
    text.includes('telugu') ||
    text.includes('malayalam') ||
    text.includes('kannada') ||
    text.includes('marathi') ||
    text.includes('punjabi') ||
    text.includes('gujarati') ||
    text.includes('odia') ||
    text.includes('assamese') ||
    text.includes('regional')
  ) {
    return 'Regional Channels';
  }

  // If group title is valid and not empty, use it cleanly
  if (groupTitle && groupTitle.trim().length > 0 && groupTitle.trim() !== 'Undefined') {
    return groupTitle.trim();
  }

  return 'General Entertainment';
}

/**
 * Parses raw M3U / M3U8 string content into an array of Channel objects
 */
export function parseM3U(content: string): Channel[] {
  const channels: Channel[] = [];
  const lines = content.split(/\r?\n/);

  let currentChannel: Partial<Channel> | null = null;
  let channelCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine) continue;
    const line = rawLine.trim();

    if (line.startsWith('#EXTINF:')) {
      // Parse EXTINF line
      currentChannel = {};

      // Match attributes: key="value" or key=value
      const logoMatch = line.match(/tvg-logo="([^"]*)"/i);
      const nameMatch = line.match(/tvg-name="([^"]*)"/i);
      const idMatch = line.match(/tvg-id="([^"]*)"/i);
      const groupMatch = line.match(/group-title="([^"]*)"/i);
      const chnoMatch = line.match(/tvg-chno="([^"]*)"/i);

      // Channel title is after the last comma
      const commaIndex = line.lastIndexOf(',');
      let title = commaIndex !== -1 ? line.substring(commaIndex + 1).trim() : '';

      if (!title && nameMatch && nameMatch[1]) {
        title = nameMatch[1].trim();
      }
      if (!title) {
        title = `Channel ${channelCounter}`;
      }

      const groupTitle = groupMatch ? groupMatch[1].trim() : '';
      const category = normalizeCategory(groupTitle, title);

      let channelNo = channelCounter;
      if (chnoMatch && chnoMatch[1] && !isNaN(parseInt(chnoMatch[1], 10))) {
        channelNo = parseInt(chnoMatch[1], 10);
      }

      currentChannel = {
        id: `ch_${Date.now()}_${channelCounter}_${Math.random().toString(36).substring(2, 7)}`,
        name: title,
        logo: logoMatch ? logoMatch[1].trim() : '',
        category,
        tvgId: idMatch ? idMatch[1].trim() : undefined,
        tvgName: nameMatch ? nameMatch[1].trim() : undefined,
        channelNumber: channelNo,
        resolution: title.toLowerCase().includes('4k')
          ? '4K'
          : title.toLowerCase().includes('fhd') || title.toLowerCase().includes('1080')
          ? 'FHD'
          : 'HD',
        isLive: false, // Never show as live until stream is actively playing
      };

      channelCounter++;
    } else if (line.startsWith('#EXTGRP:')) {
      // Optional group header
      if (currentChannel && !currentChannel.category) {
        const group = line.replace('#EXTGRP:', '').trim();
        if (group) {
          currentChannel.category = normalizeCategory(group, currentChannel.name || '');
        }
      }
    } else if (line.length > 0 && !line.startsWith('#')) {
      // This is the stream URL line
      if (
        currentChannel &&
        (line.startsWith('http://') || line.startsWith('https://') || line.startsWith('rtmp://') || line.startsWith('rtsp://'))
      ) {
        currentChannel.url = line.trim();

        // If logo is missing, assign a nice fallback badge
        if (!currentChannel.logo) {
          currentChannel.logo = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            currentChannel.name || 'TV'
          )}&background=1e1b4b&color=a5b4fc&bold=true&size=128`;
        }

        channels.push(currentChannel as Channel);
        currentChannel = null;
      }
    }
  }

  return channels;
}

/**
 * Serializes an array of Channels back into standard M3U format for exporting
 */
export function exportToM3U(channels: Channel[], playlistName: string): string {
  let content = `#EXTM3U name="${playlistName}"\n\n`;
  for (const ch of channels) {
    content += `#EXTINF:-1 tvg-id="${ch.tvgId || ''}" tvg-name="${ch.tvgName || ch.name}" tvg-logo="${ch.logo}" group-title="${ch.category}" tvg-chno="${ch.channelNumber || ''}",${ch.name}\n`;
    content += `${ch.url}\n\n`;
  }
  return content;
}
