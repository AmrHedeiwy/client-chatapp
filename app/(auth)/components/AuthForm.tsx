'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from '@/lib/utils';

import { FieldValues, useForm } from 'react-hook-form';
import { useSession } from '@/hooks/useSession';
import { useRouter } from 'next/navigation';
import { ErrorProps, FormErrorProps, ResponseProps } from '@/types/Axios';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

import SocialButton from '@/app/(auth)/components/SocialButton';

type Variant = 'LOGIN' | 'REGISTER';

export default function AuthForm() {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const session = useSession();

  const formSchema = z
    .object<FieldValues>({
      email: z
        .string()
        .trim()
        .min(1, { message: 'Email is required' })
        .email('Invalid email'),
      password: z.string().trim().min(1, { message: 'Password is required' }),
      ...(variant === 'REGISTER' && {
        username: z
          .string()
          .trim()
          .min(1, { message: 'Username is required' })
          .regex(/^[A-Za-z\d_-]{3,20}$/, { message: 'Invalid username' }),
        confirmPassword: z
          .string()
          .min(1, { message: 'Confirm Password is required' })
          .max(255)
          .transform((val) => val.trim()),
        termsOfAgreement: z.boolean().refine((value) => value, {
          message: 'You must agree before submitting.'
        })
      }),
      ...(variant === 'LOGIN' && { rememberMe: z.boolean() })
    })
    .refine(
      (data) => {
        // Only validate confirmPassword if variant is 'REGISTER'
        if (variant === 'REGISTER') {
          return data.confirmPassword === data.password;
        }
        return true; // For 'LOGIN' variant, always return true
      },
      {
        message: 'Passwords must match',
        path: ['confirmPassword'] // Specify the field path for error message
      }
    );

  useEffect(() => {
    if (!session) return;

    const { user } = session;

    if (user && user.isVerified) router.push('/conversations');
    if (user && !user.isVerified) router.push('/email/verify');
  }, [session, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      termsOfAgreement: false
    }
  });

  const isLoading = form.formState.isSubmitting;

  const toggleVariant = useCallback(() => {
    if (variant === 'LOGIN') setVariant('REGISTER');
    else setVariant('LOGIN');

    form.reset();
  }, [variant, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/${
      variant === 'LOGIN' ? 'sign-in' : 'register'
    }`;
    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };

    try {
      const res = await axios.post(url, data, config);

      const { message, redirect } = res.data;
      toast('success', message);

      if (redirect) router.push(redirect);
    } catch (e: any) {
      const error = e.response.data.error;
      if (error && error.name === 'JoiValidationError') {
        (error.message as FormErrorProps[]).forEach(({ fieldName, fieldMessage }) => {
          form.setError(fieldName, { message: fieldMessage });
        });
      } else {
        toast('error', error.message);
      }
    }
  };

  const onOpenProvider = (action: 'google' | 'facebook') => {
    const width = window.innerWidth >= 768 ? 500 : window.innerWidth;
    const height = window.innerWidth >= 768 ? 600 : window.innerHeight;

    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    let timer: NodeJS.Timeout | null = null;
    const providerWindow: Window | null = window.open(
      `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/${action}`,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (providerWindow) {
      timer = setInterval(() => {
        if (providerWindow.closed) {
          const res = localStorage.getItem(action);

          if (res === 'success') router.push('/conversations');
          if (res === 'error') {
            toast(
              'error',
              'Oops, something went wrong. Please try again later or contact support if the problem persists.',
              8000
            );
          }

          localStorage.removeItem(action);
          if (timer) clearInterval(timer);
        }
      }, 500);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {variant === 'REGISTER' && (
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Your spiecy username" {...field} />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="what's the secret word?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {variant === 'REGISTER' && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Confirm the secret word" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {variant === 'LOGIN' && (
          <div className="flex justify-between items-center">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-blue-500 cursor-pointer">
                      Remember me?
                    </FormLabel>
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              variant={'link'}
              type="button"
              onClick={() => router.replace('/password/forgot')}
            >
              Forgot Password?
            </Button>
          </div>
        )}
        {variant === 'REGISTER' && (
          <FormField
            control={form.control}
            name="termsOfAgreement"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center">
                <div className="flex gap-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      Accept terms and conditions
                    </FormLabel>
                  </div>
                </div>

                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button className="w-full" disabled={isLoading}>
          {!isLoading ? (
            variant === 'LOGIN' ? (
              'Sign in'
            ) : (
              'Register'
            )
          ) : (
            <>
              <Loader2 className="h-6 w-6 text-white dark:text-black animate-spin my-4 mr-1" />
              <p>Please wait</p>
            </>
          )}
        </Button>

        <div role="hidden" className="mt-6 border-t">
          <span className="block w-max mx-auto -mt-3 px-4 text-center text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-950">
            Or
          </span>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-10">
          <SocialButton provider="google" onClick={() => onOpenProvider('google')} />
          <SocialButton provider="facebook" onClick={() => onOpenProvider('facebook')} />
        </div>
        <div className="flex justify-center items-center mt-6 ">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {variant === 'LOGIN' ? 'New to APP_NAME?' : 'Already have an account?'}
          </div>
          <Button type="button" className="pl-2" variant={'link'} onClick={toggleVariant}>
            {variant === 'LOGIN' ? 'Create an account' : 'Login'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
