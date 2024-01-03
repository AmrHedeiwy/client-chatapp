'use client';

import { Button } from '@/app/components/Button';
import React, {
  ChangeEvent,
  FormEvent,
  Fragment,
  KeyboardEvent,
  useEffect,
  useRef,
  useState
} from 'react';
import EmailVerificationOTPInput from '@/app/(auth)/email/verify/components/EmailVerificationOTPInput';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { notify } from '@/app/utils/notifications';
import { useRouter } from 'next/navigation';
import { ErrorProps, ResponseProps } from '@/app/types/Axios';
import Link from '@/app/components/Link';

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
      newOTP[index] = '';
      setOTP(newOTP);

      if (!OTP[index]) setActiveInputRef(index - 1);
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
    const body: object = { VerificationCode: OTP.toString().replaceAll(',', '') };
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

        if (redirect) router.push(redirect);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        notify('error', e.response?.data.error.message as string);
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
        notify('error', e.response?.data.error.message as string);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeInputRef]);

  return (
    <form method="post" onSubmit={handleOnSubmit}>
      <div className="flex flex-col space-y-16">
        <div className="flex flex-row items-center justify-between mx-auto w-full ">
          {OTP.map((_, index) => {
            return (
              <Fragment key={index}>
                <EmailVerificationOTPInput
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
            <Button fullwidth disabled={isLoading}>
              Verify Account
            </Button>
          </div>

          <div className="flex flex-row items-center justify-center text-center text-sm font-medium space-x-1 text-gray-500">
            <p>{`Didn't recieve code?`}</p>
            <Link onClick={handleOnClick} disabled={isLoading} withButton>
              Resend
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
