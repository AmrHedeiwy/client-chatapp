'use client';

import { ErrorProps, FormErrorProps, ResponseProps } from '@/types/Axios';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { Loader2 } from 'lucide-react';
import { toast } from '@/lib/utils';

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

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { FieldValues, useForm } from 'react-hook-form';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const formSchema = z
  .object<FieldValues>({
    password: z
      .string()
      .trim()
      .min(1, { message: 'Password is required' })
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message:
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character'
      }),
    confirmPassword: z.string().trim().min(1, { message: 'Confirm Password is required' })
  })
  .refine(
    (data) => {
      // Only validate confirmPassword
      return data.confirmPassword === data.password;
    },
    {
      message: 'Passwords must match',
      path: ['confirmPassword'] // Specify the field path for error message
    }
  );

export default function PasswordResetForm() {
  const { token } = useParams<{ token: string }>();

  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:5000/auth/session', {
        credentials: 'include'
      });

      const { isPasswordReset } = await res.json();

      if (!isPasswordReset) router.replace('/password/forgot');
    })();
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    // resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/password/reset`;
    const options: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };

    try {
      const res = await axios.patch(url, { ...data, token }, options);

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

        if (error.redirect) router.replace(error.redirect);
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="New secret, shhhh!!" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="confirm the secret word" {...field} />
              </FormControl>
              <FormMessage />
              <FormDescription>
                For your security, APP_NAME will never ask for your password. Please do
                not share your password with anyone.
              </FormDescription>
            </FormItem>
          )}
        />

        <Button className="w-full" disabled={isLoading}>
          {!isLoading ? (
            'Reset Password'
          ) : (
            <>
              <Loader2 className="h-6 w-6 text-white  dark:text-black animate-spin my-4 mr-1" />
              <p>Please wait</p>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
