import type { Metadata } from 'next';

export const metadata = {
  title: 'Confirm Booking',
  description: 'Enter your details to confirm your architecture consultation booking.',
  robots: {
    index: false,
    follow: false,
  },
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
