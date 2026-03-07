'use client';

import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { EoiForm } from '@/components/home/eoi-form';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [desktopPulseState, setDesktopPulseState] = useState<
    'loop' | 'finalPulseReady' | 'once' | 'done'
  >('loop');

  useEffect(() => {
    if (typeof window === 'undefined' || desktopPulseState !== 'loop') {
      return;
    }

    const desktopMediaQuery = window.matchMedia('(min-width: 1024px)');

    const handleScroll = () => {
      if (!desktopMediaQuery.matches) {
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 6;

      if (isAtBottom) {
        setDesktopPulseState('finalPulseReady');
      }
    };

    const handleBreakpointChange = () => {
      handleScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    desktopMediaQuery.addEventListener('change', handleBreakpointChange);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      desktopMediaQuery.removeEventListener('change', handleBreakpointChange);
    };
  }, [desktopPulseState]);

  useEffect(() => {
    if (desktopPulseState !== 'finalPulseReady') {
      return;
    }

    let frameA = 0;
    let frameB = 0;

    frameA = window.requestAnimationFrame(() => {
      frameB = window.requestAnimationFrame(() => {
        setDesktopPulseState('once');
      });
    });

    return () => {
      window.cancelAnimationFrame(frameA);
      window.cancelAnimationFrame(frameB);
    };
  }, [desktopPulseState]);

  useEffect(() => {
    if (desktopPulseState !== 'once') {
      return;
    }

    const stopTimeout = setTimeout(() => {
      setDesktopPulseState('done');
    }, 3700);

    return () => {
      clearTimeout(stopTimeout);
    };
  }, [desktopPulseState]);

  const desktopOuterPulseClass =
    desktopPulseState === 'loop'
      ? 'lg:motion-safe:[animation:pulse_4500ms_ease-in-out_infinite]'
      : desktopPulseState === 'finalPulseReady'
        ? 'lg:motion-safe:[animation:none]'
        : desktopPulseState === 'once'
          ? 'lg:motion-safe:[animation:pulse_3200ms_ease-in-out_1]'
          : 'lg:motion-safe:[animation:none]';
  const desktopInnerPulseClass =
    desktopPulseState === 'loop'
      ? 'lg:motion-safe:[animation:pulse_5500ms_ease-in-out_300ms_infinite]'
      : desktopPulseState === 'finalPulseReady'
        ? 'lg:motion-safe:[animation:none]'
        : desktopPulseState === 'once'
          ? 'lg:motion-safe:[animation:pulse_3600ms_ease-in-out_1]'
          : 'lg:motion-safe:[animation:none]';

  return (
    <div className="bg-background min-h-screen px-1 md:px-3 lg:px-4">
      <div className="border-secondary/35 mx-auto flex min-h-[100dvh] w-full max-w-[78rem] flex-col overflow-hidden rounded-b-3xl border-y md:min-h-0">
        <div className="bg-background shrink-0 px-4 py-3 md:px-10 md:py-4 lg:px-12">
          <div className="bg-primary rounded-2xl">
            <ComingSoonHeader />
          </div>
        </div>

        <div className="bg-background flex flex-1 flex-col px-4 pb-4 md:px-10 md:pb-6 lg:px-12 lg:pb-8">
          <div className="from-secondary via-secondary/45 to-background relative flex flex-1 flex-col overflow-hidden rounded-2xl bg-gradient-to-b via-22%">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="bg-primary/20 absolute -top-28 -left-24 h-72 w-72 rounded-full blur-3xl md:h-[28rem] md:w-[28rem]" />
              <div className="bg-secondary/80 absolute -top-20 -right-20 h-64 w-64 rounded-full blur-3xl md:h-96 md:w-96" />
              <div className="bg-primary/20 absolute -right-24 -bottom-28 h-72 w-72 rounded-full blur-3xl md:h-[30rem] md:w-[30rem]" />

              <div className="border-primary/20 absolute -top-36 -left-24 h-[28rem] w-[28rem] rounded-full border md:[animation:spin_40s_linear_infinite]" />
              <div className="border-secondary/40 absolute -right-28 -bottom-44 h-[30rem] w-[30rem] rounded-full border md:[animation:spin_52s_linear_infinite_reverse]" />
              <div className="border-foreground/15 absolute top-1/2 -left-44 h-[26rem] w-[26rem] -translate-y-1/2 rounded-full border md:[animation:spin_60s_linear_infinite]" />

              <div className="from-background/95 via-background/70 to-background/95 absolute inset-x-[10%] top-[18%] h-[52%] rounded-[40%] bg-gradient-to-b blur-2xl" />
            </div>

            <main className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 px-4 py-8 md:gap-12 md:px-10 md:py-14 lg:px-12 lg:py-16">
              {/* Hero Section */}
              <section className="flex w-full flex-col items-center text-center">
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

              <section className="relative w-full max-w-6xl">
                <div
                  aria-hidden="true"
                  className={`from-primary/90 via-secondary/80 to-primary/90 absolute inset-0 scale-[1.02] rounded-[2rem] bg-gradient-to-r blur-2xl will-change-transform motion-safe:[animation:pulse_4s_ease-in-out_infinite] ${desktopOuterPulseClass}`}
                />
                <div
                  className={`from-primary via-secondary to-primary relative rounded-3xl bg-gradient-to-r p-[3px] shadow-[0_0_28px_hsl(var(--primary)/0.9),0_0_72px_hsl(var(--secondary)/0.75),0_0_120px_hsl(var(--primary)/0.7)] motion-safe:[animation:pulse_5s_ease-in-out_250ms_infinite] ${desktopInnerPulseClass}`}
                >
                  <div className="bg-background/95 border-primary/80 relative overflow-hidden rounded-[1.35rem] border p-2 md:p-3">
                    <Image
                      src="/marketplace-preview.png"
                      alt="Buildipedia marketplace preview"
                      width={1920}
                      height={1080}
                      priority
                      className="border-secondary/70 block w-full rounded-2xl border"
                    />
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
