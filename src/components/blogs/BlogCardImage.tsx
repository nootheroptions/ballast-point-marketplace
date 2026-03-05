'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BlogCardImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function BlogCardImage({ src, alt, className }: BlogCardImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <div className="bg-muted absolute inset-0 animate-pulse" />}
      <Image
        src={src}
        alt={alt}
        fill
        className={cn(
          'object-cover transition-all duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
        onLoad={() => setIsLoading(false)}
      />
    </>
  );
}
