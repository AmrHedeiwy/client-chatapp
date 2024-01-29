'use client';

import { Button } from '@/app/components/Button';
import FormInput from '@/app/components/inputs/FormInput';
import { ErrorProps, FormErrorProps, ResponseProps } from '@/app/types/Axios';
import { notify } from '@/app/utils/notifications';
import { yupResolver } from '@hookform/resolvers/yup';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import * as y from 'yup';

const formSchema = y.object<FieldValues>({
  password: y
    .string()
    .trim()
    .matches(
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character'
    )
    .required('Password is required'),
  confirmPassword: y
    .string()
    .trim()
    .oneOf([y.ref('password')], 'Passwords must match')
    .required('Confirm Password is required')
});

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

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FieldValues>({
    // resolver: yupResolver(formSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      token: token
    }
  });

  const onSumbit: SubmitHandler<FieldValues> = (data) => {
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

          if (error?.redirect) router.replace(error.redirect);
        }
      })
      .finally(() => setTimeout(() => setIsLoading(false), 1000));
  };

  return (
    <form onSubmit={handleSubmit(onSumbit)} noValidate>
      <div className="grid gap-y-4">
        <FormInput
          id="password"
          placeholder="Your new password"
          type="password"
          register={register}
          errors={errors}
        />
        <FormInput
          id="confirmPassword"
          placeholder="Confirm your new password"
          type="password"
          register={register}
          errors={errors}
        />

        <div className="mt-2">
          <Button disabled={isLoading} fullwidth>
            Reset Password
          </Button>
        </div>
      </div>
    </form>
  );
}
