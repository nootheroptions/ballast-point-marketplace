import { SignUpForm } from '@/components/auth/signup-form';
import type { Metadata } from 'next';

export const metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
} satisfies Metadata;

export default function SignUpPage() {
  return <SignUpForm />;
}
