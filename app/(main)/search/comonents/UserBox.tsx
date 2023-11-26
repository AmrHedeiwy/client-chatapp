'use client';

import Avatar from '@/app/components/Avatar';
import { User } from '@/app/types/User';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useCallback } from 'react';

interface UserBoxProps {
  data: User;
}

const UserBox: React.FC<UserBoxProps> = ({ data }) => {
  const router = useRouter();

  const handleClick = useCallback(() => {
    axios
      .post('/', { UserID: data.UserID })
      .then((data) => router.push(`/conversatoins/${data.data.id}`));
  }, [data, router]);

  return (
    <div
      onClick={handleClick}
      className="
        w-full
        relative
        flex
        items-center
        space-x-3
        bg-white
        p-3
        hover:bg-neutral-100
        hover:border
        hover:p-4
        hover:border-black
        rounded-lg
        transition
        cursor-pointer
    "
    >
      <Avatar user={data} />
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <div
            className="
                flex
                justify-between
                items-center
                mb-1
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-gray-900
               "
            >
              {data.Name}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBox;
