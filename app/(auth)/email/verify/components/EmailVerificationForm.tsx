'use client';

import React, {
  ChangeEvent,
  FormEvent,
  Fragment,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react';
import OTPInput from '@/app/(auth)/email/verify/components/OTPInput';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { notify } from '@/app/utils/notifications';
import { useRouter } from 'next/navigation';
import { ErrorProps, ResponseProps } from '@/app/types/Axios';
import { Button } from '@/components/ui/button';
import { LuLoader2 } from 'react-icons/lu';

export default function EmailVerificationForm() {
  const router = useRouter();

  const [OTP, setOTP] = useState<string[]>(new Array(6).fill(''));
  const [activeInputRef, setActiveInputRef] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<boolean[]>(new Array(6).fill(false));
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    setErrors((orgErrors) => {
      const updatedErrors = [...orgErrors];
      updatedErrors[index] = false;

      return updatedErrors;
    });

    const { value } = e.target;

    if (!value) return;

    const newOTP: string[] = [...OTP];
    newOTP[index] = value.substring(value.length - 1);

    setOTP(newOTP);

    setActiveInputRef(index + 1);
  };

  const handleOnKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOTP: string[] = [...OTP];
      if (newOTP[index].length !== 0) {
        newOTP[index] = '';
        setOTP(newOTP);
        return;
      }

      newOTP[index] = '';
      if (index > 0) newOTP[index - 1] = '';
      setOTP(newOTP);

      setActiveInputRef(index - 1);
    }
  };

  const handleOnSubmit = (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    let isError: boolean = false;
    OTP.forEach((value, index) => {
      if (!value) {
        setErrors((orgErrors) => {
          const updatedErrors = [...orgErrors];
          updatedErrors[index] = true;

          return updatedErrors;
        });
        isError = true;
      }
    });

    if (isError) {
      setIsLoading(false);
      return;
    }

    const url = 'http://localhost:5000/auth/verify-email';
    const body: object = { verificationCode: OTP.toString().replaceAll(',', '') };
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    };

    axios
      .post(url, JSON.stringify(body), config)
      .then((res: AxiosResponse<ResponseProps>) => {
        const { message, redirect } = res.data;

        notify('success', message as string);

        if (redirect) router.replace(redirect);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        const error = e.response?.data.error;
        notify('error', error?.message as string);

        if (error?.redirect) router.replace(error.redirect);
      })
      .finally(() => setTimeout(() => setIsLoading(false), 1000));
  };

  const handleOnClick = () => {
    setIsLoading(true);

    const url: string = 'http://localhost:5000/auth/verify-email-request';
    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };

    axios
      .post(url, {}, config)
      .then((res: AxiosResponse<ResponseProps>) => {
        notify('success', res.data.message as string);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        const error = e.response?.data.error;

        notify('error', error?.message as string);

        if (error?.redirect) router.replace(error.redirect);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeInputRef]);

  return (
    <form method="post" onSubmit={handleOnSubmit}>
      <div className="flex flex-col space-y-16">
        <div className="flex flex-row justify-center items-center gap-2">
          {OTP.map((_, index) => {
            return (
              <Fragment key={index}>
                <OTPInput
                  index={index}
                  inputRef={index === activeInputRef ? inputRef : null}
                  value={OTP[index]}
                  onChange={(e) => handleOnChange(e, index)}
                  onKeyDown={(e) => handleOnKeyDown(e, index)}
                  errors={errors}
                />
              </Fragment>
            );
          })}
        </div>

        <div className="flex flex-col space-y-5">
          <div>
            <Button className="w-full" disabled={isLoading}>
              {!isLoading ? (
                'Verify Account'
              ) : (
                <>
                  <LuLoader2 className="h-6 w-6 text-white dark:text-black animate-spin my-4 mr-1" />
                  <p>Please wait</p>
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
            <p className="text-gray-500 dark:text-gray-400">{`Didn't recieve code?`}</p>
            <Button
              className="pl-1"
              variant={'link'}
              type="button"
              onClick={handleOnClick}
              disabled={isLoading}
            >
              Resend
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
