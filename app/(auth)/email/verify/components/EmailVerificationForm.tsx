'use client';

import React, {
  ChangeEvent,
  FormEvent,
  Fragment,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ErrorProps, ResponseProps } from '@/types/Axios';

import { toast } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import OTPInput from './OTPInput';

export default function EmailVerificationForm() {
  const router = useRouter();

  const [OTP, setOTP] = useState<string[]>(new Array(6).fill(''));
  const [activeInputRef, setActiveInputRef] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<boolean[]>(new Array(6).fill(false));
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>, index: number) => {
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
    },
    [OTP]
  );

  const handleOnKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>, index: number) => {
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
    },
    [OTP]
  );

  const handleOnSubmit = useCallback(
    async (e: FormEvent) => {
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

      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/email/verify`;
      const config: AxiosRequestConfig = {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      };

      try {
        const res = await axios.patch(
          url,
          { verificationCode: OTP.toString().replaceAll(',', '') },
          config
        );

        const { message, redirect } = res.data;

        toast('success', message);

        if (redirect) router.replace(redirect);
      } catch (e: any) {
        const error = e.response.data.error;
        toast('error', error.message);

        if (error.redirect) router.replace(error.redirect);
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    },
    [OTP, router]
  );

  const handleOnClick = useCallback(async () => {
    setIsLoading(true);

    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/auth/email/verify/request`;
    const config: AxiosRequestConfig = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    };

    try {
      const res = await axios.post(url, {}, config);

      toast('success', res.data.message);
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.replace(error.redirect);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

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
                  <Loader2 className="h-6 w-6 text-white dark:text-black animate-spin my-4 mr-1" />
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
