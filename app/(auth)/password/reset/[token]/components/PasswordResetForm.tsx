'use client';

import { ErrorProps, FormErrorProps, ResponseProps } from '@/types/Axios';
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
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

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

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:5000/auth/info/authorisation', {
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
      confirmPassword: '',
      token: token
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    const url: string = `http://localhost:5000/auth/reset-password`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    axios
      .post(
        url,
        {
          password: 'amr@AMR123',
          confirmPassword: 'amr@AMR123',
          token
        },
        options
      )
      .then((res: AxiosResponse<ResponseProps>) => {
        const { message, redirect } = res.data;

        toast('success', message as string);

        if (redirect) router.push(redirect);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        const error = e.response?.data.error;
        if (error && error.name === 'JoiValidationError') {
          (error.message as FormErrorProps[]).forEach(({ fieldName, fieldMessage }) => {
            form.setError(fieldName, { message: fieldMessage, type: 'manual' });
          });
        } else {
          toast('error', error?.message as string);

          if (error?.redirect) router.replace(error.redirect);
        }
      })
      .finally(() => setTimeout(() => setIsLoading(false), 1000));
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
