export interface PodcastEpisode {
  id: string;
  slug: string;
  title: string;
  description: string;
  descriptionHtml: string | null;
  publishedAt: string | null;
  spotifyEpisodeId: string | null;
  audioUrl: string | null;
  episodeUrl: string | null;
  durationSeconds: number | null;
  imageUrl: string | null;
}

export interface PodcastFeed {
  title: string;
  description: string;
  imageUrl: string | null;
  link: string | null;
  episodes: PodcastEpisode[];
}
