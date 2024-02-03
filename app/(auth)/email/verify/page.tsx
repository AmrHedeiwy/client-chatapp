import React from 'react';
import EmailVerificationForm from '@/app/(auth)/email/verify/components/EmailVerificationForm';
import MaskedEmail from '@/app/(auth)/email/verify/components/MaskedEmail';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

export default function EmailVerification() {
  return (
    <div
      className="
        flex
        min-h-full
        flex-col
        justify-center
        items-center
        py-12
        sm:px-6
        lg:px-8"
    >
      <Card className=" w-11/12 md:w-[450px]">
        <CardHeader>
          <div className="flex flex-col justify-center items-center ">
            <CardTitle className="text-lg">Email Verification</CardTitle>
            <CardDescription className="text-sm">
              We have sent a code to your email <MaskedEmail />
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <EmailVerificationForm />
        </CardContent>
      </Card>
    </div>
    // <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-12">
    //   <div className="relative bg-white px-6 pt-10 pb-9 shadow-xl mx-auto w-full max-w-lg rounded-2xl">
    //     <div className="mx-auto flex w-full max-w-md flex-col space-y-16">
    //       <div className="flex flex-col items-center justify-center text-center space-y-2">
    //         <div className="font-semibold text-3xl">
    //           <p>Email Verification</p>
    //         </div>
    //         <div className="flex flex-row text-sm font-medium text-gray-400">
    //           <p>
    //             We have sent a code to your email <EmailVerificationMaskedEmail />
    //           </p>
    //         </div>
    //       </div>
    //       <EmailVerificationForm />
    //     </div>
    //   </div>
    // </div>
  );
}
