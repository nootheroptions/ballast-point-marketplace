'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  imageUrls: string[];
  alt: string;
  className?: string;
  heightClassName?: string;
}

export function ImageCarousel({
  imageUrls,
  alt,
  className,
  heightClassName = 'h-64 md:h-96',
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = imageUrls.length > 0;
  const hasMultiple = imageUrls.length > 1;

  const goToPrevious = () => {
    if (!hasMultiple) return;
    setActiveIndex((current) => (current === 0 ? imageUrls.length - 1 : current - 1));
  };

  const goToNext = () => {
    if (!hasMultiple) return;
    setActiveIndex((current) => (current === imageUrls.length - 1 ? 0 : current + 1));
  };

  return (
    <div
      className={cn(
        'bg-muted relative overflow-hidden rounded-lg border',
        heightClassName,
        className
      )}
    >
      {hasImages ? (
        <Image src={imageUrls[activeIndex]} alt={alt} fill className="object-cover" />
      ) : (
        <div className="text-muted-foreground absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-12 w-12 opacity-40 md:h-16 md:w-16" />
        </div>
      )}

      {hasMultiple && (
        <>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-1/2 left-3 -translate-y-1/2"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute top-1/2 right-3 -translate-y-1/2"
            onClick={goToNext}
            aria-label="Next image"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/35 px-2 py-1">
            {imageUrls.map((_, index) => (
              <button
                key={`dot-${index}`}
                type="button"
                className={cn(
                  'h-2 w-2 rounded-full transition-colors',
                  index === activeIndex ? 'bg-white' : 'bg-white/40'
                )}
                onClick={() => setActiveIndex(index)}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
