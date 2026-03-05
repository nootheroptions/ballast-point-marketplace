import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  createBlogService,
  calculateReadTime,
  formatBlogDate,
  type BlogPost,
} from '@/lib/services/blogs';
import { BlogCardImage } from '@/components/blogs/BlogCardImage';
import { ArrowUpRight, Calendar, Clock3 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Blog',
  description:
    'Articles, insights, and guides for architects and homeowners. Learn about architecture trends, design tips, and how to grow your practice.',
  openGraph: {
    title: 'Blog | Buildipedia',
    description:
      'Articles, insights, and guides for architects and homeowners. Learn about architecture trends, design tips, and how to grow your practice.',
  },
} satisfies Metadata;

function getPostSummary(description: string | null): string {
  if (!description) {
    return 'No summary available.';
  }

  const trimmed = description.trim();
  if (trimmed.length <= 180) {
    return trimmed;
  }

  return `${trimmed.slice(0, 177)}...`;
}

export default function BlogsPage() {
  return (
    <div className="bg-background min-h-screen px-1 md:px-3 lg:px-4">
      <div className="mx-auto w-full max-w-[78rem]">
        <div className="bg-background px-4 py-3 md:px-10 md:py-4 lg:px-12">
          <div className="bg-primary rounded-2xl">
            <ComingSoonHeader />
          </div>
        </div>

        <main className="px-4 pt-9 pb-16 md:px-10 md:pt-12 lg:px-12">
          <Suspense fallback={<BlogListSkeleton />}>
            <BlogList />
          </Suspense>
        </main>
      </div>
    </div>
  );
}

async function BlogList() {
  const blogService = createBlogService();
  let postsResponse: Awaited<ReturnType<typeof blogService.getPosts>> | null = null;

  try {
    postsResponse = await blogService.getPosts();
  } catch {
    return (
      <section className="mx-auto max-w-[74rem]">
        <Card>
          <CardContent className="space-y-2 p-6">
            <h2 className="text-xl font-semibold">Blog unavailable</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              We could not load the blog right now. Please try again shortly.
            </p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const posts = postsResponse.data;

  return (
    <section className="mx-auto max-w-[74rem] space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post: BlogPost) => {
          const readTime = calculateReadTime(post.words);
          const primaryTag = post.tags[0];

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group border-border/60 bg-background/90 hover:border-primary/40 flex h-full flex-col overflow-hidden rounded-xl border transition-all hover:shadow-md"
            >
              <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden">
                {post.featured_image_url ? (
                  <BlogCardImage
                    src={post.featured_image_url}
                    alt={post.title}
                    className="group-hover:scale-105"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col space-y-3 p-4">
                {primaryTag && (
                  <Badge variant="secondary" className="w-fit text-xs">
                    {primaryTag.name}
                  </Badge>
                )}

                <h2 className="group-hover:text-primary line-clamp-2 text-lg leading-snug font-semibold transition-colors">
                  {post.title}
                </h2>

                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatBlogDate(post.published_at)}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Clock3 className="h-3 w-3" />
                    {readTime}
                  </Badge>
                </div>

                <p className="text-muted-foreground line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed">
                  {getPostSummary(post.description)}
                </p>

                <div className="text-muted-foreground mt-auto inline-flex items-center gap-1 pt-1 text-sm font-medium">
                  Read article
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function BlogListSkeleton() {
  return (
    <section className="mx-auto max-w-[74rem]">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="border-border/60 bg-background/90 flex h-full flex-col overflow-hidden rounded-xl border"
          >
            <div className="bg-muted aspect-[16/9] w-full animate-pulse" />
            <div className="flex flex-1 flex-col space-y-3 p-4">
              <div className="bg-muted h-5 w-16 animate-pulse rounded" />
              <div className="bg-muted h-6 w-full animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="bg-muted h-5 w-24 animate-pulse rounded" />
                <div className="bg-muted h-5 w-20 animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="bg-muted h-4 w-full animate-pulse rounded" />
                <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
                <div className="bg-muted h-4 w-3/5 animate-pulse rounded" />
              </div>
              <div className="bg-muted mt-auto h-4 w-28 animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
