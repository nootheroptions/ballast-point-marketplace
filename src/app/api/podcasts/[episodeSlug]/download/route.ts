import { createPodcastService } from '@/lib/services/podcasts';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{
    episodeSlug: string;
  }>;
}

function sanitizeFilenamePart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getExtensionFromContentType(contentType: string | null): string {
  const normalized = contentType?.split(';')[0]?.trim().toLowerCase();

  switch (normalized) {
    case 'audio/mpeg':
      return 'mp3';
    case 'audio/mp4':
    case 'audio/x-m4a':
      return 'm4a';
    case 'audio/aac':
      return 'aac';
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav';
    case 'audio/ogg':
      return 'ogg';
    default:
      return 'mp3';
  }
}

function buildDownloadFileName(title: string, contentType: string | null): string {
  const safeTitle = sanitizeFilenamePart(title) || 'podcast-episode';
  const extension = getExtensionFromContentType(contentType);
  return `${safeTitle}.${extension}`;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { episodeSlug } = await params;
  const podcastService = createPodcastService();
  const { episode } = await podcastService.getEpisodeBySlug(episodeSlug);

  if (!episode?.audioUrl) {
    return NextResponse.json({ error: 'Episode audio unavailable.' }, { status: 404 });
  }

  const upstreamResponse = await fetch(episode.audioUrl, { cache: 'no-store' });
  if (!upstreamResponse.ok || !upstreamResponse.body) {
    return NextResponse.json({ error: 'Unable to fetch episode audio.' }, { status: 502 });
  }

  const contentType = upstreamResponse.headers.get('content-type') ?? 'audio/mpeg';
  const contentLength = upstreamResponse.headers.get('content-length');
  const fileName = buildDownloadFileName(episode.title, contentType);
  const encodedFileName = encodeURIComponent(fileName);

  const headers = new Headers();
  headers.set('Content-Type', contentType);
  headers.set(
    'Content-Disposition',
    `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`
  );
  headers.set('Cache-Control', 'private, max-age=600');

  if (contentLength) {
    headers.set('Content-Length', contentLength);
  }

  return new NextResponse(upstreamResponse.body, {
    status: 200,
    headers,
  });
}
