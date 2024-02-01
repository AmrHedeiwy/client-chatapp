'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import * as y from 'yup';
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
import { yupResolver } from '@hookform/resolvers/yup';

type Variant = 'LOGIN' | 'REGISTER';

export default function AuthForm() {
  const router = useRouter();
  const [variant, setVariant] = useState<Variant>('LOGIN');
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useSession();

  useEffect(() => {
    if (session && session.isVerified) router.push('/conversations');
    if (session && !session.isVerified) router.push('/email/verify');
  }, [session, router]);

  const formSchema = y.object<FieldValues>({
    ...(variant === 'REGISTER' && {
      username: y
        .string()
        .trim()
        .required('Username is required')
        .matches(/^[A-Za-z\d_-]{3,20}$/, 'Invalid username')
    }),
    email: y.string().trim().email('Invalid email').required('Email is required'),
    password:
      variant === 'REGISTER'
        ? y
            .string()
            .trim()
            .matches(
              /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
              'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one digit, and one special character'
            )
            .required('Password is required')
        : y.string().trim().required('Password is required'),
    ...(variant === 'REGISTER' && {
      confirmPassword: y
        .string()
        .trim()
        .oneOf([y.ref('Password')], 'Passwords must match')
        .required('Confirm Password is required')
    }),
    ...(variant === 'LOGIN' && { rememberMe: y.boolean() }),
    ...(variant === 'REGISTER' && {
      termsOfAgreement: y.boolean().oneOf([true], 'You must agree before submitting.')
    })
  });

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<FieldValues>({
    // resolver: yupResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      rememberMe: false,
      termsOfAgreement: false
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
          username: 'Emna',
          email: 'amr.hedeiwy@gmail.com',
          password: 'amr@AMR123',
          confirmPassword: 'amr@AMR123',
          rememberMe: true,
          termsOfAgreement: true
        },
        options
      )
      .then((res: AxiosResponse<ResponseProps>) => {
        const { message, redirect } = res.data;

        notify('success', message as string);

        console.log(redirect);
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
      .finally(() => setTimeout(() => setIsLoading(false), 1000));
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
    <form className="space-y-6 py-1" onSubmit={handleSubmit(onSumbit)} noValidate>
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
          id="username"
          placeholder="Your spiecy username"
          type="text"
          register={register}
          errors={errors}
        />
      )}
      <FormInput
        id="email"
        placeholder="Your Email"
        type="email"
        register={register}
        errors={errors}
      />
      <FormInput
        id="password"
        placeholder="what's the secret word?"
        type="password"
        register={register}
        errors={errors}
      />
      {variant === 'REGISTER' && (
        <FormInput
          id="confirmPassword"
          placeholder="Confirm the secret word"
          type="password"
          register={register}
          errors={errors}
        />
      )}

      {variant === 'REGISTER' && (
        <label className="flex items-center justify-center">
          <Checkbox
            id="termsOfAgreement"
            disabled={isLoading}
            register={register}
            errors={errors}
          >
            <Link>Accept terms and conditions</Link>
          </Checkbox>
        </label>
      )}

      {variant === 'LOGIN' && (
        <div className="flex w-full">
          <div className="flex-1">
            <label className="inline-flex items-center ml-1">
              <Checkbox id="rememberMe" disabled={isLoading} register={register}>
                <Link>Remember me?</Link>
              </Checkbox>
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
