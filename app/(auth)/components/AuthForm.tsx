'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import AuthSocialButton from '@/app/(auth)/components/AuthSocialButton';
import { Button } from '@/app/components/Button';
import FormInput from '@/app/components/inputs/FormInput';
import { notify } from '@/app/utils/notifications';

import { useSession } from '@/app/hooks/useSession';
import { useRouter } from 'next/navigation';
import { ErrorProps, FormErrorProps, ResponseProps } from '@/app/types/Axios';
import Link from '@/app/components/Link';
import Checkbox from '@/app/components/inputs/Checkbox';

type Variant = 'LOGIN' | 'REGISTER';

export default function AuthForm() {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  useEffect(() => {
    if (session.user && session.user.IsVerified) router.push('/search'); // change to conversations later
    if (session.user && !session.user.IsVerified) router.push('/email/verify');
  }, [session.user, router]);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<FieldValues>({
    defaultValues: {
      Username: '',
      Email: '',
      Password: '',
      ConfirmPassword: '',
      RememberMe: false
    }
  });

  const toggleVariant = useCallback(() => {
    reset();
    if (variant === 'LOGIN') setVariant('REGISTER');
    else setVariant('LOGIN');
  }, [variant, reset]);

  const onSumbit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    const url: string = `http://localhost:5000/auth/${
      variant === 'LOGIN' ? 'sign-in' : 'register'
    }`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    axios
      .post(
        url,
        {
          Username: 'aasFsddsddad',
          Email: 'amr.hdsesassa@gmail.com',
          Password: 'amr@AMR123',
          ConfirmPassword: 'amr@AMR123',
          RememberMe: true
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
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const socialAction = (action: 'google' | 'facebook') => {
    setIsLoading(true);
    const width = window.innerWidth >= 768 ? 500 : window.innerWidth;
    const height = window.innerWidth >= 768 ? 600 : window.innerHeight;

    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    let timer: NodeJS.Timeout | null = null;
    const providerWindow: Window | null = window.open(
      `http://localhost:5000/auth/${action}`,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (providerWindow) {
      timer = setInterval(() => {
        if (providerWindow.closed) {
          setIsLoading(false);
          const res = localStorage.getItem(action);

          console.log(res);
          if (res === 'success') router.push('/users');
          if (res === 'error') {
            notify(
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
    <form className="space-y-6 py-6" onSubmit={handleSubmit(onSumbit)} noValidate>
      <div className="grid gap-6 sm:grid-cols-2 mb-10">
        <AuthSocialButton provider="Google" onClick={() => socialAction('google')} />
        <AuthSocialButton provider="Facebook" onClick={() => socialAction('facebook')} />
      </div>
      <div role="hidden" className="mt-6 border-t">
        <span className="block w-max mx-auto -mt-3 px-4 text-center text-gray-500 bg-gray-100">
          Or
        </span>
      </div>
      {variant === 'REGISTER' && (
        <FormInput
          id="Username"
          placeholder="Your spiecy username"
          type="text"
          register={register}
          errors={errors}
        />
      )}
      <FormInput
        id="Email"
        placeholder="Your Email"
        type="email"
        register={register}
        errors={errors}
      />
      <FormInput
        id="Password"
        placeholder="what's the secret word?"
        type="password"
        register={register}
        errors={errors}
      />
      {variant === 'REGISTER' && (
        <FormInput
          id="ConfirmPassword"
          placeholder="Confirm the secret word"
          type="password"
          register={register}
          errors={errors}
        />
      )}

      {variant === 'LOGIN' && (
        <div className="flex w-full">
          <div className="flex-1">
            <label className="inline-flex items-center ml-1 space-x-2">
              <Checkbox id="RememberMe" disabled={isLoading} register={register} />
              <Link>Remember me?</Link>
            </label>
          </div>

          <div className="flex justify-end mr-1">
            <Link onClick={() => router.replace('/password/forgot')}>
              Forgot Password?
            </Link>
          </div>
        </div>
      )}

      <Button type="submit" disabled={isLoading} fullwidth>
        {variant === 'LOGIN' ? 'Sign in' : 'Register'}
      </Button>
      <div
        className="
        flex
        gap-2
        justify-center
        text-sm
        mt-6
        px-2
        text-gray-500
      "
      >
        <div>{variant === 'LOGIN' ? 'New to APP_NAME?' : 'Already have an account?'}</div>
        <div onClick={toggleVariant} className="underline cursor-pointer">
          {variant === 'LOGIN' ? 'Create an account' : 'Login'}
        </div>
      </div>
    </form>
  );
}
