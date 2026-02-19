export interface BlogAuthor {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  pic_url: string | null;
  url: string;
  social: Record<string, string>;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  url: string;
  posts_count: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  content: string;
  url: string;
  featured_image_url: string | null;
  published_at: number;
  created_at: number;
  updated_at: number;
  is_featured: boolean;
  is_page: boolean;
  words: number;
  authors: BlogAuthor[];
  tags: BlogTag[];
  canonical_url: string | null;
}

export interface BlogInfo {
  name: string;
  description: string | null;
  logo_url: string | null;
  favicon_url: string | null;
  language: string;
  url: string;
}

export interface BlogPostsResponse {
  data: BlogPost[];
  pagination: {
    total: number;
    pages: number;
    limit: number;
    page: number;
    page_prev: number | null;
    page_next: number | null;
  };
}
