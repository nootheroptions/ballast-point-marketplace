'use client';

import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { EoiForm } from '@/components/home/eoi-form';

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen px-1 md:px-3 lg:px-4">
      <div className="border-secondary/35 mx-auto min-h-screen w-full max-w-[78rem] overflow-hidden rounded-b-3xl border-y">
        <div className="bg-background px-4 py-3 md:px-10 md:py-4 lg:px-12">
          <div className="bg-primary rounded-2xl">
            <ComingSoonHeader />
          </div>
        </div>

        <div className="bg-background px-4 pb-4 md:px-10 md:pb-6 lg:px-12 lg:pb-8">
          <div className="from-secondary via-secondary/45 to-background relative min-h-[calc(100vh-9rem)] overflow-hidden rounded-2xl bg-gradient-to-b via-22%">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="bg-primary/20 absolute -top-28 -left-24 h-72 w-72 rounded-full blur-3xl md:h-[28rem] md:w-[28rem]" />
              <div className="bg-secondary/80 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl md:h-96 md:w-96" />
              <div className="bg-primary/20 absolute -right-24 -bottom-28 h-72 w-72 rounded-full blur-3xl md:h-[30rem] md:w-[30rem]" />

              <div className="border-primary/20 absolute -top-36 -left-24 h-[28rem] w-[28rem] rounded-full border md:[animation:spin_40s_linear_infinite]" />
              <div className="border-secondary/40 absolute -right-28 -bottom-44 h-[30rem] w-[30rem] rounded-full border md:[animation:spin_52s_linear_infinite_reverse]" />
              <div className="border-foreground/15 absolute top-1/2 -left-44 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full border md:[animation:spin_60s_linear_infinite]" />

              <div className="from-background/95 via-background/70 to-background/95 absolute inset-x-[10%] top-[18%] h-[52%] rounded-[40%] bg-gradient-to-b blur-2xl" />
            </div>

            <main className="relative z-10 flex min-h-[calc(100vh-9rem)] flex-col items-center justify-center px-4 md:px-10 lg:px-12">
              {/* Hero Section */}
              <section className="flex flex-col items-center text-center">
                <div className="w-full max-w-3xl">
                  {/* Launching Soon Badge */}
                  <p className="from-primary via-primary/30 to-primary bg-gradient-to-r bg-clip-text text-sm font-semibold tracking-[0.2em] text-transparent uppercase">
                    Launching soon
                  </p>

                  {/* Main Headline - widest */}
                  <h1 className="text-foreground mx-auto mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    Grow your practice with qualified homeowner leads
                  </h1>

                  {/* Description - narrower than headline (funnel shape) */}
                  <p className="text-muted-foreground mx-auto mt-9 max-w-xl text-base leading-relaxed font-medium md:text-lg">
                    Buildipedia is launching a marketplace where architects and designers can
                    showcase services, get discovered by homeowners, and book consultations.
                  </p>

                  {/* Inline Email Form */}
                  <div className="mx-auto mt-9 w-full max-w-md pt-0">
                    <EoiForm variant="inline" />
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
