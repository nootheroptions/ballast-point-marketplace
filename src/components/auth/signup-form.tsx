'use client';

import { signUp } from '@/actions/auth';
import type { ActionResult } from '@/actions/types';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { signUpSchema, type SignUpFormData } from '@/lib/validations/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useActionState, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    signUp,
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'client' | 'provider'>('client');

  const {
    register,
    formState: { errors },
    setValue,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onBlur',
    defaultValues: {
      userType: 'client',
    },
  });

  // Automatically detect and set user's timezone
  useEffect(() => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setValue('timezone', timezone);
  }, [setValue]);

  // Update userType in form when tab changes
  useEffect(() => {
    setValue('userType', userType);
  }, [userType, setValue]);

  if (state?.success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent you a verification link. Please check your inbox and click the link to
            verify your account.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className="text-muted-foreground text-sm hover:underline">
            Back to login
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Choose what you want to do first, and then enter your details
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent className="space-y-4">
          {state?.error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">
              {state.error}
            </div>
          )}

          <Tabs
            value={userType}
            onValueChange={(value) => setUserType(value as 'client' | 'provider')}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="client">Book services</TabsTrigger>
              <TabsTrigger value="provider">Offer services</TabsTrigger>
            </TabsList>
            <TabsContent value="client" className="text-muted-foreground mt-3 text-center text-sm">
              Find and book architectural services. You can create or join a business later.
            </TabsContent>
            <TabsContent
              value="provider"
              className="text-muted-foreground mt-3 text-center text-sm"
            >
              List your services. You can also hire architects with the same account.
            </TabsContent>
          </Tabs>

          {/* Hidden userType field */}
          <input type="hidden" {...register('userType')} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              disabled={isPending}
              {...register('email')}
            />
            {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isPending}
                className="pr-10"
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="text-muted-foreground size-4" />
                ) : (
                  <Eye className="text-muted-foreground size-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-destructive text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                disabled={isPending}
                className="pr-10"
                {...register('confirmPassword')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="text-muted-foreground size-4" />
                ) : (
                  <Eye className="text-muted-foreground size-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Hidden timezone field */}
          <input type="hidden" {...register('timezone')} />
        </CardContent>

        <CardFooter className="mt-6 flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Creating account...' : 'Sign up'}
          </Button>
          <p className="text-muted-foreground text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
