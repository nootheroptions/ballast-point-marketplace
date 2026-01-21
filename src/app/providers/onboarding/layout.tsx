export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  // Onboarding uses its own full-screen layout without the AppShell
  return <>{children}</>;
}
