import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { EpisodeDescription } from '@/components/podcasts/EpisodeDescription';
import { PodcastAudioPlayer } from '@/components/podcasts/PodcastAudioPlayer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { env } from '@/lib/config/env';
import { createPodcastService } from '@/lib/services/podcasts';
import { formatDuration, formatPublishedDate } from '@/lib/utils/podcast';
import { ArrowLeft, Calendar, Clock3, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PodcastEpisodePageProps {
  params: Promise<{
    episodeSlug: string;
  }>;
}

function PodcastPlatformButtons({
  spotifyShowUrl,
  applePodcastsShowUrl,
}: {
  spotifyShowUrl: string;
  applePodcastsShowUrl: string;
}) {
  return (
    <div className="grid gap-3">
      <Button
        asChild
        variant="outline"
        className="border-border/70 bg-background hover:bg-muted/60 h-11 w-full justify-between rounded-lg px-4 text-sm font-medium"
      >
        <Link href={spotifyShowUrl} target="_blank" rel="noreferrer">
          Listen on Spotify
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        asChild
        variant="outline"
        className="border-border/70 bg-background hover:bg-muted/60 h-11 w-full justify-between rounded-lg px-4 text-sm font-medium"
      >
        <Link href={applePodcastsShowUrl} target="_blank" rel="noreferrer">
          Listen on Apple Podcasts
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

export async function generateMetadata({ params }: PodcastEpisodePageProps): Promise<Metadata> {
  const { episodeSlug } = await params;
  const podcastService = createPodcastService();
  const { feed, episode } = await podcastService.getEpisodeBySlug(episodeSlug);

  if (!episode) {
    return {
      title: 'Episode Not Found',
    };
  }

  return {
    title: `${episode.title} | ${feed.title}`,
    description: episode.description || `Listen to ${episode.title}`,
  };
}

export default async function PodcastEpisodePage({ params }: PodcastEpisodePageProps) {
  const { episodeSlug } = await params;

  return (
    <div className="from-primary/10 via-background to-background min-h-screen bg-gradient-to-b">
      <ComingSoonHeader />

      <main className="container mx-auto px-4 pt-6 pb-16 md:pt-10 lg:px-8">
        <Suspense fallback={<EpisodeSkeleton />}>
          <PodcastEpisodeContent episodeSlug={episodeSlug} />
        </Suspense>
      </main>
    </div>
  );
}

async function PodcastEpisodeContent({ episodeSlug }: { episodeSlug: string }) {
  const podcastService = createPodcastService();
  const { feed, episode } = await podcastService.getEpisodeBySlug(episodeSlug);

  if (!episode) {
    notFound();
  }

  const duration = formatDuration(episode.durationSeconds);
  const artworkUrl = episode.imageUrl ?? feed.imageUrl;
  const spotifyShowUrl = env.PODCASTS_SPOTIFY_SHOW_URL;
  const applePodcastsShowUrl = env.PODCASTS_APPLE_PODCASTS_SHOW_URL;

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <Button asChild variant="ghost" className="h-auto p-0 text-sm">
        <Link href="/podcast">
          <ArrowLeft className="h-4 w-4" />
          Back to podcasts
        </Link>
      </Button>

      <Card className="border-border/70 overflow-hidden rounded-2xl shadow-sm">
        <CardContent className="space-y-6 p-4 md:space-y-8 md:p-8 lg:p-10">
          <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
            <div className="mx-auto w-full max-w-[320px] space-y-4 lg:mx-0">
              <div className="bg-muted border-border/70 aspect-square w-full overflow-hidden rounded-2xl border">
                {artworkUrl ? (
                  <div
                    className="h-full w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${artworkUrl}')` }}
                    role="img"
                    aria-label={`Artwork for ${episode.title}`}
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
                    No artwork
                  </div>
                )}
              </div>

              <div className="hidden lg:block">
                <PodcastPlatformButtons
                  spotifyShowUrl={spotifyShowUrl}
                  applePodcastsShowUrl={applePodcastsShowUrl}
                />
              </div>
            </div>

            <div className="min-w-0 space-y-6">
              <h1 className="max-w-3xl text-xl leading-tight font-semibold tracking-tight text-balance sm:text-2xl md:text-4xl">
                {episode.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-border/60 bg-muted/40 text-muted-foreground gap-1 px-3 py-1 text-xs font-medium"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  {formatPublishedDate(episode.publishedAt)}
                </Badge>
                {duration && (
                  <Badge
                    variant="outline"
                    className="border-border/60 bg-muted/40 text-muted-foreground gap-1 px-3 py-1 text-xs font-medium"
                  >
                    <Clock3 className="h-3.5 w-3.5" />
                    {duration}
                  </Badge>
                )}
              </div>

              {episode.audioUrl ? (
                <PodcastAudioPlayer
                  audioUrl={episode.audioUrl}
                  durationSeconds={episode.durationSeconds}
                  episodeSlug={episode.slug}
                  title={episode.title}
                />
              ) : episode.spotifyEpisodeId ? (
                <div className="border-border/70 overflow-hidden rounded-xl border">
                  <iframe
                    src={`https://open.spotify.com/embed/episode/${episode.spotifyEpisodeId}?utm_source=generator`}
                    width="100%"
                    height="152"
                    loading="lazy"
                    title={`Spotify player for ${episode.title}`}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="bg-muted/50 border-border/70 rounded-xl border p-4 text-sm">
                  Audio is unavailable for this episode at the moment.
                </div>
              )}

              {episode.description && (
                <EpisodeDescription
                  description={episode.description}
                  descriptionHtml={episode.descriptionHtml}
                />
              )}
            </div>

            <div className="mx-auto w-full max-w-[320px] lg:hidden">
              <PodcastPlatformButtons
                spotifyShowUrl={spotifyShowUrl}
                applePodcastsShowUrl={applePodcastsShowUrl}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function EpisodeSkeleton() {
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="bg-muted h-5 w-32 animate-pulse rounded" />
      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="grid items-start gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="bg-muted aspect-square w-full max-w-[320px] animate-pulse rounded-2xl" />
            <div className="space-y-4">
              <div className="bg-muted h-10 w-3/4 animate-pulse rounded" />
              <div className="bg-muted h-6 w-1/3 animate-pulse rounded" />
              <div className="bg-muted h-[172px] w-full animate-pulse rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
