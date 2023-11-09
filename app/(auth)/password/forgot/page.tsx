import React from 'react';
import PasswordForgotForm from './components/PasswordForgotForm';

export default function PasswordForgot() {
  return (
    <div
      className="
        flex
        min-h-full
        flex-col
        justify-center
        items-center
        bg-gray-50"
    >
      <div className="container flex max-w-md rounded-3xl shadow-lg bg-gray-100">
        <div className="p-5 sm:p-8 w-full">
          <h1 className="block text-center text-2xl font-bold text-gray-800 space-y-4 mb-8">
            Forgot password?
          </h1>

          <PasswordForgotForm />
        </div>
      </div>
    </div>
  );
}
