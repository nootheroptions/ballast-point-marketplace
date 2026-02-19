const dateFormatter = new Intl.DateTimeFormat('en-AU', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export function formatPublishedDate(value: string | null): string {
  if (!value) {
    return 'Date unavailable';
  }

  return dateFormatter.format(new Date(value));
}

export function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds < 1) {
    return null;
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m`;
  }

  return `${remainingSeconds}s`;
}
