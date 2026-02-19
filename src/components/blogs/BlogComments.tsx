'use client';

import { useEffect, useRef } from 'react';
import { env } from '@/lib/config/env';

interface BlogCommentsProps {
  pageId: string;
  pageTitle: string;
  pageUrl: string;
}

export function BlogComments({ pageId, pageTitle, pageUrl }: BlogCommentsProps) {
  const websiteId = env.NEXT_PUBLIC_HYVOR_TALK_WEBSITE_ID;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Hyvor Talk script
    if (!document.querySelector('script[src*="talk.hyvor.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://talk.hyvor.com/embed/embed.js';
      script.type = 'module';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current || !websiteId) return;
    const container = containerRef.current;

    document
      .querySelectorAll(`hyvor-talk-comments[data-blog-comments-page-id="${pageId}"]`)
      .forEach((node) => {
        node.remove();
      });

    container.innerHTML = '';

    // Create the Hyvor Talk web component
    const comments = document.createElement('hyvor-talk-comments');
    comments.setAttribute('website-id', websiteId);
    comments.setAttribute('page-id', pageId);
    comments.setAttribute('page-title', pageTitle);
    comments.setAttribute('page-url', pageUrl);
    comments.setAttribute('colors', 'light');
    comments.setAttribute('data-blog-comments-page-id', pageId);

    container.appendChild(comments);

    return () => {
      container.innerHTML = '';
    };
  }, [websiteId, pageId, pageTitle, pageUrl]);

  if (!websiteId) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Comments</h2>
      <div ref={containerRef} />
    </div>
  );
}
