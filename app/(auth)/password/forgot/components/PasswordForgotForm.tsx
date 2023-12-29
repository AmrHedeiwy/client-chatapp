'use client';

import { Button } from '@/app/components/Button';
import Link from '@/app/components/Link';
import FormInput from '@/app/components/inputs/FormInput';
import { FormErrorProps, ResponseProps, ErrorProps } from '@/app/types/Axios';
import { notify } from '@/app/utils/notifications';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import * as y from 'yup';

const formSchema = y.object<FieldValues>({
  Email: y.string().trim().email('Invalid email').required('Email is required')
});

export default function PasswordForgotForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FieldValues>({
    resolver: yupResolver(formSchema),
    defaultValues: {
      Email: ''
    }
  });

  const onSumbit: SubmitHandler<FieldValues> = (data) => {
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

        notify('success', message as string);

        if (redirect) router.push(redirect);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        const error = e.response?.data.error;
        if (error && error.name === 'JoiValidationError') {
          (error.message as FormErrorProps[]).forEach(({ fieldName, fieldMessage }) => {
            setError(fieldName, { message: fieldMessage, type: 'manual' });
          });
        } else {
          notify('error', error?.message as string);
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <form onSubmit={handleSubmit(onSumbit)} noValidate>
      <div className="grid gap-y-4">
        <FormInput
          id="Email"
          placeholder="Email"
          type="email"
          register={register}
          errors={errors}
        />

        <div className="inline-flex justify-center items-center space-x-1 text-sm">
          <p>Remember your password?</p>
          <Link
            withButton
            disabled={isLoading}
            type="button"
            onClick={() => router.replace('/')}
          >
            Login here
          </Link>
        </div>
        <Button disabled={isLoading}>Reset Password</Button>
      </div>
    </form>
  );
}
