import type { Metadata } from 'next';

export const metadata = {
  title: 'Book Appointment',
  description: 'Select a date and time to book your architecture consultation.',
} satisfies Metadata;

export default async function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="h-full max-h-[calc(100vh-2rem)] w-full max-w-5xl overflow-auto rounded-lg border sm:max-h-[80vh] lg:max-h-[60vh]">
        {children}
      </div>
    </div>
  );
}
