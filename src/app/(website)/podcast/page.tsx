import { Suspense } from 'react';
import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { env } from '@/lib/config/env';
import { createPodcastService, type PodcastEpisode } from '@/lib/services/podcasts';
import { formatDuration, formatPublishedDate } from '@/lib/utils/podcast';
import { ArrowUpRight, Calendar, Clock3, ExternalLink } from 'lucide-react';
import Link from 'next/link';

function getEpisodeSummary(description: string): string {
  const trimmed = description.trim();
  if (!trimmed) {
    return 'No episode summary is available yet.';
  }

  if (trimmed.length <= 240) {
    return trimmed;
  }

  return `${trimmed.slice(0, 237)}...`;
}

export default function PodcastsPage() {
  return (
    <div className="from-primary/10 via-background to-background min-h-screen bg-gradient-to-b">
      <ComingSoonHeader />

      <main className="container mx-auto px-4 pt-10 pb-16 lg:px-8">
        <Suspense fallback={<PodcastListSkeleton />}>
          <PodcastList />
        </Suspense>
      </main>
    </div>
  );
}

async function PodcastList() {
  const podcastService = createPodcastService();
  let feed: Awaited<ReturnType<typeof podcastService.getFeed>> | null = null;

  try {
    feed = await podcastService.getFeed();
  } catch {
    return (
      <section className="mx-auto max-w-5xl">
        <Card>
          <CardContent className="space-y-2 p-6">
            <h2 className="text-xl font-semibold">Podcast feed unavailable</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              We could not load the RSS feed right now. Please try again shortly.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const spotifyShowUrl = env.PODCASTS_SPOTIFY_SHOW_URL;
  const applePodcastsShowUrl = env.PODCASTS_APPLE_PODCASTS_SHOW_URL;

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <Card className="border-primary/20 bg-card/80 overflow-hidden backdrop-blur-sm">
        <CardContent className="p-6 md:p-8">
          <div className="grid items-start gap-6 md:grid-cols-[144px_minmax(0,1fr)] md:gap-8">
            <div className="bg-muted border-border h-36 w-36 overflow-hidden rounded-xl border">
              {feed.imageUrl ? (
                <div
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${feed.imageUrl}')` }}
                  role="img"
                  aria-label={`${feed.title} artwork`}
                />
              ) : (
                <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
                  No artwork
                </div>
              )}
            </div>

            <div className="space-y-4">
              <CardTitle className="text-3xl leading-tight font-semibold md:text-4xl">
                {feed.title}
              </CardTitle>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{feed.episodes.length} episodes</Badge>
              </div>

              {feed.description && (
                <p className="text-muted-foreground max-w-3xl text-base">{feed.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={spotifyShowUrl} target="_blank" rel="noreferrer">
                    Spotify
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={applePodcastsShowUrl} target="_blank" rel="noreferrer">
                    Apple Podcasts
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {feed.episodes.map((episode: PodcastEpisode) => {
          const duration = formatDuration(episode.durationSeconds);
          const episodeArtworkUrl = episode.imageUrl ?? feed.imageUrl;

          return (
            <Link key={episode.id} href={`/podcast/${episode.slug}`} className="group block">
              <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
                <CardContent className="space-y-5 p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-5">
                    <div className="bg-muted border-border h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border md:h-28 md:w-28">
                      {episodeArtworkUrl ? (
                        <div
                          className="h-full w-full bg-cover bg-center"
                          style={{ backgroundImage: `url('${episodeArtworkUrl}')` }}
                          role="img"
                          aria-label={`Artwork for ${episode.title}`}
                        />
                      ) : (
                        <div className="text-muted-foreground flex h-full w-full items-center justify-center text-[10px]">
                          No artwork
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <h2 className="text-xl leading-snug font-semibold md:text-2xl">
                        {episode.title}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatPublishedDate(episode.publishedAt)}
                        </Badge>
                        {duration && (
                          <Badge variant="secondary" className="gap-1">
                            <Clock3 className="h-3.5 w-3.5" />
                            {duration}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
                        {getEpisodeSummary(episode.description)}
                      </p>
                    </div>
                  </div>

                  <div className="text-muted-foreground inline-flex items-center gap-1 text-sm font-medium">
                    Open episode
                    <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function PodcastListSkeleton() {
  return (
    <section className="mx-auto max-w-5xl space-y-5">
      {[...Array(3)].map((_, index) => (
        <Card key={index}>
          <CardContent className="space-y-4 p-5 md:p-6">
            <div className="bg-muted h-4 w-48 animate-pulse rounded" />
            <div className="bg-muted h-7 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-20 w-full animate-pulse rounded" />
            <div className="bg-muted h-[152px] w-full animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
