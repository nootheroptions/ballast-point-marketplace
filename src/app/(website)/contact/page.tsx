import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { JoinUsForm } from '@/components/podcast/join-us-form';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

export const metadata = {
  title: 'Contact | Buildipedia Podcast',
  description:
    'Apply to be a guest or co-host on the Buildipedia podcast. Share your expertise and insights with our audience.',
};

export default function JoinUsPage() {
  return (
    <div className="from-primary/10 via-background to-background min-h-screen bg-gradient-to-b">
      <ComingSoonHeader />

      <main className="container mx-auto px-4 py-10 lg:px-8 lg:py-14">
        <section className="mx-auto max-w-5xl">
          <Card className="border-primary/20 bg-card/90 overflow-hidden shadow-sm">
            <CardContent className="p-6 sm:p-8 lg:p-10">
              <div className="mb-8 space-y-5">
                <h1 className="text-3xl leading-tight font-semibold md:text-4xl">
                  Contact us to join us on Buildipedia
                </h1>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-8">
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                      We are keen to speak to developers, planners, architects, designers, builders,
                      government, regulators and industry bodies with a focus on construction and
                      property industry professionals who can provide an unique insight into the
                      industry. We&apos;re happy to adopt topics to suit your specific story and
                      experience.
                    </p>
                    <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                      By lifting the lid on the industry, we hope to reveal insider knowledge,
                      debunk common misconceptions, and discuss pressing issues in the field. Your
                      participation in Buildipedia will not only contribute to our mission of
                      educating and informing our audience but also position you as a thought leader
                      and a trusted voice within the industry.
                    </p>
                  </div>
                  <div className="mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none">
                    <Image
                      src="https://static.wixstatic.com/media/e4cd38_55019b2c109b4599ae2d21625b347c55~mv2.webp/v1/fill/w_700,h_700,al_c,q_85,enc_avif,quality_auto/kimmy010101_2_hosts_and_1_guest_talking_in_a_podcast_4a6c96f8-0829-4ce4-8deb-5e21adb5db07_.webp"
                      alt="Podcast hosts and guest talking"
                      width={700}
                      height={700}
                      sizes="(min-width: 1024px) 240px, (min-width: 640px) 320px, 100vw"
                      className="aspect-square w-full rounded-2xl object-cover shadow-md"
                      priority
                    />
                  </div>
                </div>
              </div>
              <JoinUsForm />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
