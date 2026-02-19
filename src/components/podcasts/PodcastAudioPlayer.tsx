'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Pause, Play, RotateCcw, RotateCw } from 'lucide-react';

interface PodcastAudioPlayerProps {
  audioUrl: string;
  durationSeconds: number | null;
  episodeSlug: string;
  title: string;
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 2] as const;

function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '0:00';
  }

  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatPlaybackRate(rate: number): string {
  return Number.isInteger(rate) ? `${rate.toFixed(0)}x` : `${rate}x`;
}

export function PodcastAudioPlayer({
  audioUrl,
  durationSeconds,
  episodeSlug,
  title,
}: PodcastAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [resolvedDuration, setResolvedDuration] = useState(durationSeconds ?? 0);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };
    const handleLoadedMetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setResolvedDuration(audio.duration);
      }
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const safeDuration =
    Number.isFinite(resolvedDuration) && resolvedDuration > 0
      ? resolvedDuration
      : durationSeconds && durationSeconds > 0
        ? durationSeconds
        : 0;

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      await audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  };

  const handleSeekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const nextTime = Math.min(
      Math.max(audio.currentTime + seconds, 0),
      safeDuration || audio.duration || 0
    );
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleSeekTo = (nextTime: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleToggleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate as (typeof SPEED_OPTIONS)[number]);
    const nextRate = SPEED_OPTIONS[(currentIndex + 1) % SPEED_OPTIONS.length];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const sliderMax = safeDuration > 0 ? safeDuration : 1;
  const sliderValue = Math.min(currentTime, sliderMax);
  const downloadUrl = `/api/podcasts/${episodeSlug}/download`;

  return (
    <div className="border-border/70 bg-card/60 space-y-4 rounded-xl border p-4 sm:p-5">
      <audio ref={audioRef} preload="metadata" src={audioUrl} />

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleToggleSpeed}
          className="hover:bg-muted/50 size-10 rounded-full text-[11px] font-semibold tabular-nums"
        >
          {formatPlaybackRate(playbackRate)}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleSeekBy(-15)}
          className="hover:bg-muted/50 h-10 rounded-full px-3 text-xs font-semibold"
        >
          <RotateCcw className="h-4 w-4" />
          15s
          <span className="sr-only">Rewind 15 seconds</span>
        </Button>

        <Button
          type="button"
          size="icon"
          onClick={handleTogglePlay}
          className="size-12 rounded-full shadow-sm"
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
          <span className="sr-only">{isPlaying ? 'Pause episode' : 'Play episode'}</span>
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleSeekBy(15)}
          className="hover:bg-muted/50 h-10 rounded-full px-3 text-xs font-semibold"
        >
          <RotateCw className="h-4 w-4" />
          15s
          <span className="sr-only">Forward 15 seconds</span>
        </Button>

        <Button
          asChild
          variant="ghost"
          size="icon"
          className="hover:bg-muted/50 size-10 rounded-full"
        >
          <a href={downloadUrl}>
            <Download className="h-4 w-4" />
            <span className="sr-only">{`Download ${title}`}</span>
          </a>
        </Button>
      </div>

      <div className="space-y-2">
        <input
          type="range"
          min={0}
          max={sliderMax}
          step={1}
          value={sliderValue}
          onChange={(event) => handleSeekTo(Number(event.target.value))}
          className="accent-primary h-2 w-full cursor-pointer"
          aria-label="Seek audio"
        />
        <div className="text-muted-foreground flex items-center justify-between text-xs tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(safeDuration)}</span>
        </div>
      </div>
    </div>
  );
}
