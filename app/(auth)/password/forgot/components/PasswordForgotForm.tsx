'use client';

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { FormErrorProps, ResponseProps, ErrorProps } from '@/types/Axios';

import { Loader2 } from 'lucide-react';

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

import { toast } from '@/lib/utils';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const formSchema = z.object<FieldValues>({
  email: z.string().trim().min(1, { message: 'Email is required' }).email('Invalid email')
});

export default function PasswordForgotForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    const url: string = `http://localhost:5000/auth/forgot-password`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    axios
      .post(url, data, options)
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
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              <FormDescription>
                Please enter the email address where you would like to receive the
                reset-password link.
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="flex justify-center items-center text-sm">
          <p>Remember your password?</p>
          <Button
            className="p-1"
            variant={'link'}
            disabled={isLoading}
            type="button"
            onClick={() => router.replace('/')}
          >
            Login here
          </Button>
        </div>
        <Button className="w-full" disabled={isLoading}>
          {!isLoading ? (
            'Reset Password'
          ) : (
            <>
              <Loader2 className="h-6 w-6 text-white dark:text-black animate-spin my-4 mr-1" />
              <p>Please wait</p>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
