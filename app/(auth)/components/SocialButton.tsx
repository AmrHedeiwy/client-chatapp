import React from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';

interface SocialButtonProps {
  provider: 'google' | 'github';
  onClick: () => void;
  disabled: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({ provider, onClick, disabled }) => {
  return (
    <Button
      type="button"
      variant={'outline'}
      className="rounded-xl"
      onClick={onClick}
      disabled={disabled}
    >
      <div className="flex gap-4 justify-center">
        <Image
          src={`https://res.cloudinary.com/dco59dd66/image/upload/v1708780631/providers/${provider}.png`}
          alt={provider}
          width={provider === 'google' ? 30 : 11}
          height={1}
        />

        <span
          id="google"
          className="flex items-center font-medium text-sm tracking-wider"
        >
          {provider}
        </span>
      </div>
    </Button>
  );
};

export default SocialButton;
