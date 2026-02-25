'use client';

import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { EoiForm } from '@/components/home/eoi-form';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen px-2 md:px-3 lg:px-4">
      <div className="border-secondary/35 mx-auto min-h-screen w-full max-w-[78rem] overflow-hidden rounded-b-3xl border-y">
        <div className="bg-background px-8 py-3 md:px-10 md:py-4 lg:px-12">
          <div className="bg-primary rounded-2xl">
            <ComingSoonHeader />
          </div>
        </div>

        <div className="bg-background px-8 pb-4 md:px-10 md:pb-6 lg:px-12 lg:pb-8">
          <div className="from-secondary via-secondary/45 to-background relative min-h-[calc(100vh-9rem)] overflow-hidden rounded-2xl bg-gradient-to-b via-22%">
            <main className="relative z-10 px-8 md:px-10 lg:px-12">
              {/* Hero Section */}
              <section className="flex flex-col items-center pt-12 text-center md:pt-16">
                <div className="w-full max-w-3xl space-y-6">
                  {/* Launching Soon Badge */}
                  <p className="from-primary via-primary/30 to-primary bg-gradient-to-r bg-clip-text text-sm font-semibold tracking-[0.2em] text-transparent uppercase">
                    Launching soon
                  </p>

                  {/* Main Headline - widest */}
                  <h1 className="text-foreground mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    Grow your practice with qualified homeowner leads
                  </h1>

                  {/* Description - narrower than headline (funnel shape) */}
                  <p className="text-muted-foreground mx-auto max-w-xl text-base leading-relaxed md:text-lg">
                    Buildipedia is launching a marketplace where architects and designers can
                    showcase services, get discovered by homeowners, and book consultations.
                  </p>

                  {/* Inline Email Form */}
                  <div className="mx-auto w-full max-w-md pt-2">
                    <EoiForm variant="inline" />
                  </div>
                </div>
              </section>

              {/* Dashboard Preview Image with Fade */}
              <section className="relative mt-12 md:mt-16">
                <div className="border-secondary/35 bg-secondary/35 relative mx-auto max-w-[74rem] overflow-hidden rounded-t-2xl border shadow-2xl">
                  <div className="border-secondary/35 bg-background/80 h-12 border-b" />
                  <div className="relative aspect-[16/9] w-full">
                    <Image
                      src="/marketplace-preview.png"
                      alt="Dashboard preview"
                      fill
                      className="object-cover object-top"
                      priority
                    />
                    <div className="from-background via-background/90 pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t to-transparent" />
                  </div>
                </div>
              </section>
            </main>

            <div className="from-background via-background/90 pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}
