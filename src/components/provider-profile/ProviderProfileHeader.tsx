'use client';

export function ProviderProfileHeader() {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your business profile information.
        </p>
      </div>
    </div>
  );
}
