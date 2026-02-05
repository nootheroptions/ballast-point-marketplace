export default function BookingSuccessLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center p-4 md:p-6 lg:p-8">
      <div className="h-[calc(100vh-2rem)] w-full max-w-2xl md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)]">
        <div className="bg-background h-full rounded-lg border">{children}</div>
      </div>
    </div>
  );
}
