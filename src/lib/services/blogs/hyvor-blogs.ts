import 'server-only';

import { env } from '@/lib/config/env';
import type { BlogInfo, BlogPost, BlogPostsResponse } from './types';

const HYVOR_BLOGS_API_BASE = 'https://blogs.hyvor.com/api/data/v0';
const CACHE_TAG = 'hyvor-blogs';

function getApiUrl(endpoint: string): string {
  return `${HYVOR_BLOGS_API_BASE}/${env.HYVOR_BLOGS_SUBDOMAIN}${endpoint}`;
}

export interface BlogService {
  getPosts(page?: number, limit?: number): Promise<BlogPostsResponse>;
  getPostBySlug(slug: string): Promise<BlogPost | null>;
  getInfo(): Promise<BlogInfo>;
}

export function createBlogService(): BlogService {
  return {
    async getPosts(page = 1, limit = 25): Promise<BlogPostsResponse> {
      const url = getApiUrl(`/posts?page=${page}&limit=${limit}`);

      const response = await fetch(url, {
        next: {
          tags: [CACHE_TAG],
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blog posts (status ${response.status})`);
      }

      return response.json() as Promise<BlogPostsResponse>;
    },

    async getPostBySlug(slug: string): Promise<BlogPost | null> {
      const url = getApiUrl(`/post?slug=${encodeURIComponent(slug)}`);

      const response = await fetch(url, {
        next: {
          tags: [CACHE_TAG],
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch blog post (status ${response.status})`);
      }

      return response.json() as Promise<BlogPost>;
    },

    async getInfo(): Promise<BlogInfo> {
      const url = getApiUrl('/blog');

      const response = await fetch(url, {
        next: {
          tags: [CACHE_TAG],
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch blog info (status ${response.status})`);
      }

      return response.json() as Promise<BlogInfo>;
    },
  };
}

export function calculateReadTime(words: number): string {
  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

export function formatBlogDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export { CACHE_TAG };
