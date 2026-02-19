import 'server-only';

import { env } from '@/lib/config/env';
import { generateSlug } from '@/lib/utils/slug';
import type { PodcastEpisode, PodcastFeed } from './types';

const ENTITY_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(
      /&([a-z]+);/gi,
      (match: string, name: string) => ENTITY_MAP[name.toLowerCase()] ?? match
    );
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, ' ');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function unwrapCdata(value: string): string {
  const match = value.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i);
  return match?.[1] ?? value;
}

function cleanValue(value: string): string {
  return normalizeWhitespace(decodeXmlEntities(unwrapCdata(value).trim()));
}

function cleanRichValue(value: string): string {
  return decodeXmlEntities(unwrapCdata(value).trim());
}

function extractTagValue(xml: string, tagNames: string[]): string | null {
  for (const tagName of tagNames) {
    const escapedTagName = escapeRegExp(tagName);
    const tagPattern = new RegExp(
      `<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`,
      'i'
    );
    const tagMatch = xml.match(tagPattern);
    if (tagMatch?.[1]) {
      return cleanValue(tagMatch[1]);
    }
  }

  return null;
}

function extractTagValueRaw(xml: string, tagNames: string[]): string | null {
  for (const tagName of tagNames) {
    const escapedTagName = escapeRegExp(tagName);
    const tagPattern = new RegExp(
      `<${escapedTagName}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTagName}>`,
      'i'
    );
    const tagMatch = xml.match(tagPattern);
    if (tagMatch?.[1]) {
      return cleanRichValue(tagMatch[1]);
    }
  }

  return null;
}

function extractAttributeValue(
  xml: string,
  tagNames: string[],
  attributeName: string
): string | null {
  for (const tagName of tagNames) {
    const escapedTagName = escapeRegExp(tagName);
    const escapedAttributeName = escapeRegExp(attributeName);
    const tagPattern = new RegExp(
      `<${escapedTagName}\\s[^>]*${escapedAttributeName}=["']([^"']+)["'][^>]*\\/?\\s*>`,
      'i'
    );
    const tagMatch = xml.match(tagPattern);
    if (tagMatch?.[1]) {
      return cleanValue(tagMatch[1]);
    }
  }

  return null;
}

function extractItemBlocks(xml: string): string[] {
  const itemPattern = /<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi;
  const matches = [...xml.matchAll(itemPattern)];

  return matches.map((match) => match[1]).filter(Boolean);
}

function extractChannelXml(xml: string): string {
  const channelMatch = xml.match(/<channel(?:\s[^>]*)?>([\s\S]*?)<\/channel>/i);
  return channelMatch?.[1] ?? xml;
}

function extractSpotifyEpisodeId(values: Array<string | null>): string | null {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const spotifyUriMatch = value.match(/spotify:episode:([a-zA-Z0-9]+)/i);
    if (spotifyUriMatch?.[1]) {
      return spotifyUriMatch[1];
    }

    const spotifyUrlMatch = value.match(/open\.spotify\.com\/episode\/([a-zA-Z0-9]+)/i);
    if (spotifyUrlMatch?.[1]) {
      return spotifyUrlMatch[1];
    }
  }

  return null;
}

function parseDurationToSeconds(value: string | null): number | null {
  if (!value) {
    return null;
  }

  if (/^\d+$/.test(value)) {
    return Number.parseInt(value, 10);
  }

  const parts = value.split(':').map((part) => Number.parseInt(part, 10));
  if (parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  if (parts.length === 3) {
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  return null;
}

function createEpisodeId(
  itemXml: string,
  fallbackTitle: string,
  fallbackDate: string | null
): string {
  const guid = extractTagValue(itemXml, ['guid']);
  if (guid) {
    return guid;
  }

  const episodeUrl = extractTagValue(itemXml, ['link']);
  if (episodeUrl) {
    return episodeUrl;
  }

  return `${fallbackTitle}-${fallbackDate ?? 'unknown-date'}`;
}

function hashValue(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

function createEpisodeSlug(title: string, id: string): string {
  const titleSlug = generateSlug(title) || 'episode';
  const idHash = hashValue(id).slice(0, 8);
  return `${titleSlug}-${idHash}`;
}

function toIsoDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString();
}

const ALLOWED_DESCRIPTION_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
  'code',
  'pre',
]);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeDescriptionHtml(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
    return escapeHtml(trimmed).replace(/\r\n|\r|\n/g, '<br />');
  }

  let sanitized = trimmed
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(
      /<(script|style|iframe|object|embed|form|input|button|textarea|select|meta|link)[^>]*>[\s\S]*?<\/\1>/gi,
      ''
    )
    .replace(
      /<(script|style|iframe|object|embed|form|input|button|textarea|select|meta|link)\b[^>]*\/?>/gi,
      ''
    );

  sanitized = sanitized.replace(
    /<\s*(\/?)\s*([a-z0-9:-]+)([^>]*)>/gi,
    (_, slash: string, tag: string, attrs: string) => {
      const normalizedTag = tag.toLowerCase();
      if (!ALLOWED_DESCRIPTION_TAGS.has(normalizedTag)) {
        return '';
      }

      if (slash) {
        return `</${normalizedTag}>`;
      }

      if (normalizedTag === 'br') {
        return '<br />';
      }

      if (normalizedTag === 'a') {
        const hrefMatch = attrs.match(/\shref\s*=\s*(['"])(.*?)\1/i);
        const hrefValue = hrefMatch?.[2]?.trim();
        const safeHref = hrefValue && /^(https?:|mailto:|tel:)/i.test(hrefValue) ? hrefValue : null;

        if (!safeHref) {
          return '<a>';
        }

        return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noreferrer noopener">`;
      }

      return `<${normalizedTag}>`;
    }
  );

  return sanitized.trim() || null;
}

function parseEpisode(itemXml: string): PodcastEpisode {
  const title = extractTagValue(itemXml, ['title']) ?? 'Untitled Episode';
  const descriptionRaw =
    extractTagValueRaw(itemXml, ['content:encoded', 'itunes:summary', 'description']) ?? '';
  const description = normalizeWhitespace(stripHtml(descriptionRaw));
  const descriptionHtml = sanitizeDescriptionHtml(descriptionRaw);
  const pubDate = extractTagValue(itemXml, ['pubDate', 'dc:date']);
  const publishedAt = toIsoDate(pubDate);
  const episodeUrl = extractTagValue(itemXml, ['link']);
  const spotifyEpisodeId = extractSpotifyEpisodeId([
    extractTagValue(itemXml, ['spotify:uri']),
    episodeUrl,
    extractTagValue(itemXml, ['guid']),
  ]);
  const audioUrl = extractAttributeValue(itemXml, ['enclosure'], 'url');
  const durationSeconds = parseDurationToSeconds(extractTagValue(itemXml, ['itunes:duration']));
  const imageBlock = extractTagValue(itemXml, ['image']);
  const imageUrl =
    extractAttributeValue(itemXml, ['itunes:image'], 'href') ??
    (imageBlock ? extractTagValue(imageBlock, ['url']) : null);
  const id = createEpisodeId(itemXml, title, publishedAt);

  return {
    id,
    slug: createEpisodeSlug(title, id),
    title,
    description,
    descriptionHtml,
    publishedAt,
    spotifyEpisodeId,
    audioUrl,
    episodeUrl,
    durationSeconds,
    imageUrl,
  };
}

function parseFeed(rssXml: string): PodcastFeed {
  const channelXml = extractChannelXml(rssXml);

  const title = extractTagValue(channelXml, ['title']) ?? 'Podcast';
  const descriptionRaw = extractTagValue(channelXml, ['description']) ?? '';
  const description = normalizeWhitespace(stripHtml(descriptionRaw));
  const link = extractTagValue(channelXml, ['link']);
  const imageBlock = extractTagValue(channelXml, ['image']);
  const imageUrl =
    extractAttributeValue(channelXml, ['itunes:image'], 'href') ??
    (imageBlock ? extractTagValue(imageBlock, ['url']) : null);

  const episodes = extractItemBlocks(rssXml)
    .map(parseEpisode)
    .sort((a, b) => {
      if (!a.publishedAt || !b.publishedAt) {
        return 0;
      }

      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });

  return {
    title,
    description,
    imageUrl,
    link,
    episodes,
  };
}

export interface PodcastService {
  getFeed(): Promise<PodcastFeed>;
  getEpisodeBySlug(slug: string): Promise<{ feed: PodcastFeed; episode: PodcastEpisode | null }>;
}

export function createPodcastService(): PodcastService {
  return {
    async getFeed(): Promise<PodcastFeed> {
      const response = await fetch(env.PODCASTS_RSS_FEED_URL, {
        next: {
          revalidate: 300,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch podcast feed (status ${response.status})`);
      }

      const rssXml = await response.text();
      return parseFeed(rssXml);
    },

    async getEpisodeBySlug(
      slug: string
    ): Promise<{ feed: PodcastFeed; episode: PodcastEpisode | null }> {
      const feed = await this.getFeed();
      const episode = feed.episodes.find((item) => item.slug === slug) ?? null;

      return { feed, episode };
    },
  };
}
