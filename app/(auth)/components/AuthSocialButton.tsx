import clsx from 'clsx';
import React from 'react';
import Image from 'next/image';

interface AuthSocialButtonProps {
  provider: 'Facebook' | 'Google';
  onClick: () => void;
}

const AuthSocialButton: React.FC<AuthSocialButtonProps> = ({ provider, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        `
        py-3 
        px-6 
        rounded-xl`,
        provider === 'Google' &&
          ` bg-blue-100 
            hover:bg-blue-200 
            active:bg-blue-300
            focus:bg-blue-200
           `,
        provider === 'Facebook' &&
          `bg-blue-500 hover:bg-gray-800 active:bg-gray-600 focus:bg-gray-700`
      )}
    >
      <div className="flex gap-4 justify-center">
        <Image src={`/images/${provider}.png`} alt={provider} width={25} height={25} />
        <span
          id="google"
          className={clsx(
            `
            block 
            w-max 
            pt-1
            ml-0
            font-medium 
            tracking-wide 
            text-sm`,
            provider === 'Google' && ' text-blue-700',
            provider === 'Facebook' && 'text-white'
          )}
        >
          {provider}
        </span>
      </div>
    </button>
  );
};

export default AuthSocialButton;
