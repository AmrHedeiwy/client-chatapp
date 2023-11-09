import React from 'react';
import PasswordResetForm from './components/PasswordResetForm';

export default function PasswordReset() {
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
            Reset your password
          </h1>

          <PasswordResetForm />
        </div>
      </div>
    </div>
  );
}
