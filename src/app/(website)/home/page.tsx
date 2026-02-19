import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { EoiForm } from '@/components/home/eoi-form';

export default function HomePage() {
  return (
    <div className="from-primary/15 via-primary/5 to-background min-h-screen bg-gradient-to-b">
      <ComingSoonHeader />

      <main className="container mx-auto px-4 lg:px-8">
        {/* Hero Section */}
        <section className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center py-8 text-center md:py-10">
          <div className="w-full space-y-6 md:space-y-8">
            <p className="text-primary text-sm font-semibold tracking-[0.2em] uppercase">
              Launching soon
            </p>

            <h1 className="mx-auto max-w-5xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Grow your practice with qualified homeowner leads
            </h1>

            <p className="mx-auto max-w-4xl text-base leading-relaxed text-gray-700 md:text-xl">
              Buildipedia is launching a marketplace where architects and designers can showcase
              services, get discovered by homeowners, and book consultations in one streamlined
              workflow.
            </p>

            <div className="mx-auto w-full max-w-lg pt-2">
              <EoiForm />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
