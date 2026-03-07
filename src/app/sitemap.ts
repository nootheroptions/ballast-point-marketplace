import type { MetadataRoute } from 'next';
import { env } from '@/lib/config/env';
import { searchServices } from '@/actions/services';
import { createBlogService } from '@/lib/services/blogs';
import { createPodcastService } from '@/lib/services/podcasts';

// Revalidate sitemap every hour to pick up new content
export const revalidate = 3600;

const BASE_URL = env.NEXT_PUBLIC_SITE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/home`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/podcast`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Fetch dynamic content
  const [services, blogPosts, podcastFeed] = await Promise.all([
    fetchServices(),
    fetchBlogPosts(),
    fetchPodcastEpisodes(),
  ]);

  // Extract unique providers from services
  const providerSlugs = new Set<string>();
  const servicePages: MetadataRoute.Sitemap = services.map((service) => {
    providerSlugs.add(service.providerSlug);
    return {
      url: `${BASE_URL}/${service.providerSlug}/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    };
  });

  // Provider profile pages
  const providerPages: MetadataRoute.Sitemap = Array.from(providerSlugs).map((slug) => ({
    url: `${BASE_URL}/providers/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${BASE_URL}/post/${post.slug}`,
    lastModified: new Date(post.updatedAt * 1000),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Podcast episode pages
  const podcastPages: MetadataRoute.Sitemap = podcastFeed.map((episode) => ({
    url: `${BASE_URL}/podcast/${episode.slug}`,
    lastModified: episode.publishedAt ? new Date(episode.publishedAt) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...servicePages, ...providerPages, ...blogPages, ...podcastPages];
}

async function fetchServices() {
  try {
    const services = await searchServices();
    return services.map((s) => ({
      slug: s.slug,
      providerSlug: s.providerProfile.slug,
    }));
  } catch {
    return [];
  }
}

async function fetchBlogPosts() {
  try {
    const blogService = createBlogService();
    const response = await blogService.getPosts(1, 100);
    return response.data.map((post) => ({
      slug: post.slug,
      updatedAt: post.updated_at || post.published_at,
    }));
  } catch {
    return [];
  }
}

async function fetchPodcastEpisodes() {
  try {
    const podcastService = createPodcastService();
    const feed = await podcastService.getFeed();
    return feed.episodes.map((ep) => ({
      slug: ep.slug,
      publishedAt: ep.publishedAt,
    }));
  } catch {
    return [];
  }
}
