import { ComingSoonHeader } from '@/components/home/coming-soon-header';
import { JoinUsForm } from '@/components/podcast/join-us-form';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Contact | Buildipedia Podcast',
  description:
    'Apply to be a guest or co-host on the Buildipedia podcast. Share your expertise and insights with our audience.',
  alternates: {
    canonical: '/contact',
  },
};

export default function JoinUsPage() {
  return (
    <div className="bg-background min-h-screen px-1 md:px-3 lg:px-4">
      <div className="mx-auto w-full max-w-[78rem]">
        <div className="bg-background px-4 py-3 md:px-10 md:py-4 lg:px-12">
          <div className="bg-primary rounded-2xl">
            <ComingSoonHeader />
          </div>
        </div>

        <main className="px-4 pt-9 pb-10 md:px-10 md:pt-12 lg:px-12 lg:pb-14">
          <section className="mx-auto max-w-[74rem]">
            <Card className="border-primary/20 bg-card/90 overflow-hidden shadow-sm">
              <CardContent className="p-6 sm:p-8 lg:p-10">
                <div className="mx-auto max-w-xl">
                  <div className="mb-8 space-y-5">
                    <h1 className="mb-8 text-3xl leading-tight font-semibold md:text-4xl">
                      Contact us to join us on Buildipedia
                    </h1>
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                        We are keen to speak to developers, planners, architects, designers,
                        builders, government, regulators and industry bodies with a focus on
                        construction and property industry professionals who can provide an unique
                        insight into the industry. We&apos;re happy to adopt topics to suit your
                        specific story and experience.
                      </p>
                      <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                        By lifting the lid on the industry, we hope to reveal insider knowledge,
                        debunk common misconceptions, and discuss pressing issues in the field. Your
                        participation in Buildipedia will not only contribute to our mission of
                        educating and informing our audience but also position you as a thought
                        leader and a trusted voice within the industry.
                      </p>
                    </div>
                  </div>
                  <JoinUsForm />
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
