import { Store, Rocket, CalendarCheck } from 'lucide-react';

const steps = [
  {
    number: 1,
    title: 'Tell us about your business',
    description: 'Share some basic info, like your business name and how clients can reach you.',
    icon: Store,
  },
  {
    number: 2,
    title: 'Stand out online',
    description: 'Craft a compelling description to make your profile pop and attract clients.',
    icon: Rocket,
  },
  {
    number: 3,
    title: 'Accept online bookings',
    description: "With a complete profile you're ready to start taking online bookings directly.",
    icon: CalendarCheck,
  },
] as const;

export function IntroStep() {
  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 py-8 md:flex-row md:gap-16 md:px-8 lg:gap-24">
      <div className="mb-8 max-w-md text-center md:mb-0 md:text-left">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
          Get published on the <span className="text-primary">most popular marketplace</span> to
          grow your business
        </h1>
      </div>

      <div className="w-full max-w-md space-y-6">
        {steps.map((step) => (
          <div
            key={step.number}
            className="border-border flex items-start gap-4 border-b pb-6 last:border-0"
          >
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-lg font-medium">{step.number}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-muted-foreground mt-1 text-sm">{step.description}</p>
            </div>
            <div className="flex-shrink-0">
              <step.icon className="text-primary size-10" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
