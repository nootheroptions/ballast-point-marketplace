import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BlogComments } from '@/components/blogs/BlogComments';
import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { env } from '@/lib/config/env';
import {
  createBlogService,
  calculateReadTime,
  formatBlogDate,
  type BlogAuthor,
  type BlogPost,
} from '@/lib/services/blogs';
import { ArrowLeft, ArrowRight, Calendar, Clock3, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blogService = createBlogService();
  const post = await blogService.getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description || `Read ${post.title}`,
    openGraph: post.featured_image_url
      ? {
          images: [{ url: post.featured_image_url }],
        }
      : undefined,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  return (
    <div className="from-primary/20 via-primary/10 to-primary/5 min-h-screen bg-gradient-to-b">
      <ComingSoonHeader />

      <main className="container mx-auto px-4 pt-6 pb-16 md:pt-10 lg:px-8">
        <Suspense fallback={<PostSkeleton />}>
          <BlogPostContent slug={slug} />
        </Suspense>
      </main>
    </div>
  );
}

async function BlogPostContent({ slug }: { slug: string }) {
  const blogService = createBlogService();
  const [post, blogInfo] = await Promise.all([
    blogService.getPostBySlug(slug),
    blogService.getInfo(),
  ]);

  if (!post) {
    notFound();
  }

  let recentPosts: BlogPost[] = [];

  try {
    const postsResponse = await blogService.getPosts(1, 6);
    recentPosts = postsResponse.data
      .filter((candidate) => candidate.slug !== post.slug)
      .slice(0, 3);
  } catch {
    recentPosts = [];
  }

  const readTime = calculateReadTime(post.words);
  const primaryAuthor = post.authors[0];
  const primaryAuthorImageUrl = getAuthorImageUrl(primaryAuthor, blogInfo.url);
  const featuredImageUrl = resolveImageUrl(post.featured_image_url, blogInfo.url);
  const hasInlineComments = /<hyvor-talk-comments/i.test(post.content);

  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <Button asChild variant="ghost" className="h-auto p-0 text-sm">
        <Link href="/blog">
          <ArrowLeft className="h-4 w-4" />
          Back to blogs
        </Link>
      </Button>

      <Card className="border-primary/20 overflow-hidden rounded-2xl bg-white/80 shadow-sm backdrop-blur-sm">
        <CardContent className="space-y-8 p-6 md:p-8 lg:p-10">
          <header className="space-y-4">
            <h1 className="text-2xl leading-tight font-bold tracking-tight text-balance sm:text-3xl md:text-4xl">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className="border-border/60 bg-muted/40 text-muted-foreground gap-1 px-3 py-1 text-xs font-medium"
              >
                <Calendar className="h-3.5 w-3.5" />
                {formatBlogDate(post.published_at)}
              </Badge>
              <Badge
                variant="outline"
                className="border-border/60 bg-muted/40 text-muted-foreground gap-1 px-3 py-1 text-xs font-medium"
              >
                <Clock3 className="h-3.5 w-3.5" />
                {readTime}
              </Badge>
            </div>

            {primaryAuthor && (
              <div className="flex items-center gap-3 pt-2">
                <Avatar className="size-10">
                  {primaryAuthorImageUrl ? (
                    <AvatarImage src={primaryAuthorImageUrl} alt={primaryAuthor.name} />
                  ) : null}
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{primaryAuthor.name}</p>
                  {primaryAuthor.bio && (
                    <p className="text-muted-foreground text-xs">{primaryAuthor.bio}</p>
                  )}
                </div>
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          {featuredImageUrl && (
            <div className="border-primary/15 relative aspect-[2/1] w-full overflow-hidden rounded-xl border">
              <Image
                src={featuredImageUrl}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div
            className="[&_a]:text-primary [&_a:hover]:text-primary/80 [&_a.bookmark]:border-primary/20 [&_a.bookmark:hover]:bg-primary/5 [&_hr]:bg-primary/20 [&_:not(pre)_code]:bg-primary/5 [&_pre]:bg-muted [&_figcaption]:text-muted-foreground [&_table]:border-border [&_th]:bg-muted [&_td]:border-border flex w-full flex-col gap-6 text-lg text-gray-900 [&_.bookmark-description]:mt-4 [&_.bookmark-description]:text-sm [&_.bookmark-details]:flex-[2] [&_.bookmark-details]:p-5 [&_.bookmark-domain]:mt-6 [&_.bookmark-domain]:text-sm [&_.bookmark-domain]:font-medium [&_.bookmark-thumbnail]:max-w-[185px] [&_.bookmark-thumbnail]:flex-1 [&_.bookmark-thumbnail_img]:h-full [&_.bookmark-thumbnail_img]:w-full [&_.bookmark-thumbnail_img]:rounded-none [&_.bookmark-thumbnail_img]:object-cover [&_.bookmark-title]:text-base [&_.bookmark-title]:font-bold [&_.has-line-numbers_.line]:pl-6 [&_.toc]:mt-10 [&_:not(pre)_code]:rounded [&_:not(pre)_code]:px-1.5 [&_:not(pre)_code]:py-0.5 [&_a.bookmark]:flex [&_a.bookmark]:overflow-hidden [&_a.bookmark]:rounded [&_a.bookmark]:border [&_a.bookmark]:no-underline [&_a.bookmark]:transition-colors [&_aside]:flex [&_aside]:items-center [&_aside]:gap-2 [&_aside]:rounded [&_aside]:p-4 [&_aside_span:first-child]:text-2xl [&_audio]:w-full [&_blockquote]:ml-1 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-900 [&_blockquote]:px-7 [&_blockquote]:py-3 [&_blockquote>*:not(:last-child)]:text-xl [&_blockquote>*:not(:last-child)]:font-semibold [&_blockquote>*:nth-last-child(2)]:mb-3 [&_code]:font-mono [&_code]:text-sm [&_figcaption]:text-center [&_figcaption]:text-sm [&_figure]:my-6 [&_h1]:mt-5 [&_h1]:text-[2rem] [&_h1]:leading-tight [&_h1]:font-bold [&_h1_a[href^='#']]:no-underline [&_h2]:mt-6 [&_h2]:text-[1.75rem] [&_h2]:leading-tight [&_h2]:font-bold [&_h2_a[href^='#']]:no-underline [&_h3]:mt-5 [&_h3]:text-xl [&_h3]:font-bold [&_h3_a[href^='#']]:no-underline [&_h4]:mt-4 [&_h4]:text-[1.375rem] [&_h4]:font-bold [&_h4_a[href^='#']]:no-underline [&_h5]:mt-3 [&_h5]:text-xl [&_h5]:font-bold [&_h5_a[href^='#']]:no-underline [&_h6]:mt-2 [&_h6]:text-lg [&_h6]:font-bold [&_h6_a[href^='#']]:no-underline [&_hr]:my-6 [&_hr]:h-px [&_hr]:w-full [&_hr]:border-0 [&_iframe]:my-6 [&_iframe]:w-full [&_iframe]:rounded-lg [&_img]:my-4 [&_img]:rounded-lg [&_li]:mb-2 [&_li_p]:mb-2 [&_ol]:pl-8 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:py-4 [&_pre_code]:block [&_pre_code]:w-max [&_pre_code]:min-w-full [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_td]:border [&_td]:p-3 [&_th]:p-3 [&_th]:text-left [&_th]:font-semibold [&_ul]:pl-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {recentPosts.length > 0 && (
            <RecentPostsSection posts={recentPosts} baseUrl={blogInfo.url} />
          )}

          {env.NEXT_PUBLIC_HYVOR_TALK_WEBSITE_ID && !hasInlineComments && (
            <div className="border-border/50 border-t pt-8">
              <BlogComments pageId={post.id.toString()} pageTitle={post.title} pageUrl={post.url} />
            </div>
          )}
        </CardContent>
      </Card>
    </article>
  );
}

function RecentPostsSection({ posts, baseUrl }: { posts: BlogPost[]; baseUrl: string | null }) {
  return (
    <section className="border-border/50 space-y-4 border-t pt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold md:text-2xl">Recent posts</h2>
        <Button asChild variant="ghost" size="sm" className="h-auto p-0 text-sm">
          <Link href="/blog">
            View all posts
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => {
          const postImageUrl = resolveImageUrl(post.featured_image_url, baseUrl);

          return (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group border-border/60 bg-background/90 hover:border-primary/40 overflow-hidden rounded-xl border transition-all hover:shadow-md"
            >
              <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden">
                {postImageUrl ? (
                  <Image
                    src={postImageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <h3 className="group-hover:text-primary line-clamp-2 text-base leading-snug font-semibold transition-colors">
                  {post.title}
                </h3>

                {post.description && (
                  <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
                    {post.description}
                  </p>
                )}

                <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Calendar className="h-3 w-3" />
                    {formatBlogDate(post.published_at)}
                  </Badge>
                  <Badge variant="outline" className="gap-1 text-xs">
                    <Clock3 className="h-3 w-3" />
                    {calculateReadTime(post.words)}
                  </Badge>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function getAuthorImageUrl(author: BlogAuthor | undefined, baseUrl: string | null): string | null {
  if (!author) {
    return null;
  }

  const authorWithFallbackFields = author as BlogAuthor & {
    profile_image?: string | null;
    picture_url?: string | null;
    picture?: string | null;
    avatar_url?: string | null;
    avatar?: string | null;
  };

  const candidateImageUrls = [
    authorWithFallbackFields.pic_url,
    authorWithFallbackFields.profile_image,
    authorWithFallbackFields.picture_url,
    authorWithFallbackFields.picture,
    authorWithFallbackFields.avatar_url,
    authorWithFallbackFields.avatar,
  ];

  for (const candidateImageUrl of candidateImageUrls) {
    const resolvedImageUrl = resolveImageUrl(candidateImageUrl, baseUrl);
    if (resolvedImageUrl) {
      return resolvedImageUrl;
    }
  }

  return null;
}

function resolveImageUrl(
  imageUrl: string | null | undefined,
  baseUrl: string | null
): string | null {
  if (!imageUrl) {
    return null;
  }

  const trimmedImageUrl = imageUrl.trim();
  if (!trimmedImageUrl) {
    return null;
  }

  if (trimmedImageUrl.startsWith('//')) {
    return `https:${trimmedImageUrl}`;
  }

  try {
    const parsedImageUrl = new URL(trimmedImageUrl);
    if (parsedImageUrl.protocol === 'http:') {
      parsedImageUrl.protocol = 'https:';
    }
    return parsedImageUrl.toString();
  } catch {
    if (!baseUrl) {
      return null;
    }

    try {
      const parsedImageUrl = new URL(trimmedImageUrl, baseUrl);
      if (parsedImageUrl.protocol === 'http:') {
        parsedImageUrl.protocol = 'https:';
      }
      return parsedImageUrl.toString();
    } catch {
      return null;
    }
  }
}

function PostSkeleton() {
  return (
    <article className="mx-auto max-w-4xl space-y-6">
      <div className="bg-muted h-5 w-32 animate-pulse rounded" />
      <Card>
        <CardContent className="space-y-8 p-6 md:p-8">
          <div className="space-y-4">
            <div className="bg-muted h-6 w-20 animate-pulse rounded" />
            <div className="bg-muted h-10 w-3/4 animate-pulse rounded" />
            <div className="flex gap-2">
              <div className="bg-muted h-6 w-28 animate-pulse rounded" />
              <div className="bg-muted h-6 w-24 animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-muted h-10 w-10 animate-pulse rounded-full" />
              <div className="bg-muted h-5 w-32 animate-pulse rounded" />
            </div>
          </div>
          <div className="bg-muted aspect-[2/1] w-full animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-5/6 animate-pulse rounded" />
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
