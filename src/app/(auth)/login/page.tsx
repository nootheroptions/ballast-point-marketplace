import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata = {
  title: 'Login',
  description: 'Sign in to your account',
} satisfies Metadata;

export default function LoginPage() {
  return <LoginForm />;
}
