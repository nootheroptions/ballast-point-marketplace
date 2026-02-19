import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { env } from '@/lib/config/env';
import { CACHE_TAG } from '@/lib/services/blogs';

interface WebhookPayload {
  key?: string;
  event?: string;
}

/**
 * Webhook by hyvor blogs to trigger revalidation when new blog posts are published or existing ones are updated. See https://blogs.hyvor.com/docs/webhooks for more details.
 */
export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WebhookPayload;

    if (env.HYVOR_BLOGS_WEBHOOK_KEY && payload.key !== env.HYVOR_BLOGS_WEBHOOK_KEY) {
      return NextResponse.json({ error: 'Invalid webhook key' }, { status: 401 });
    }

    revalidateTag(CACHE_TAG, 'default');
    revalidatePath('/blog', 'page');

    return NextResponse.json({
      revalidated: true,
      event: payload.event ?? 'unknown',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
