'use client';

import { Button } from '@/app/components/Button';
import Input from '@/app/components/inputs/Input';
import { ErrorProps, FormErrorProps, ResponseProps } from '@/app/types/Axios';
import { notify } from '@/app/utils/notifications';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';

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
  }, []);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      Password: '',
      ConfirmPassword: '',
      Token: token
    }
  });

  const onSumbit: SubmitHandler<FieldValues> = (data) => {
    console.log(data);
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
          Password: 'amr@AMR123',
          ConfirmPassword: 'amr@AMR123',
          Token: token
        },
        options
      )
      .then((res: AxiosResponse<ResponseProps>) => {
        const { message, redirect } = res.data;

        notify('success', message as string);

        if (redirect) router.push(redirect);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        console.log(e.response?.data);
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
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSumbit)} noValidate>
      <div className="grid gap-y-4">
        <Input
          id="Password"
          placeholder="Your new password"
          type="password"
          register={register}
          errors={errors}
        />
        <Input
          id="ConfirmPassword"
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
