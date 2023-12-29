'use client';

import { HiChevronLeft } from 'react-icons/hi';
import { HiEllipsisHorizontal, HiEllipsisVertical } from 'react-icons/hi2';
import { useMemo, useState } from 'react';
import Link from 'next/link';

import useOtherUser from '@/app/hooks/useOtherUser';

import Avatar from '@/app/components/Avatar';
import { Conversation } from '@/app/types';

interface HeaderProps {
  conversation: Conversation;
}

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const otherUser = useOtherUser(conversation.Users);

  const statusText = useMemo(() => {
    if (conversation.IsGroup) {
      return `${conversation.Users.length} members`;
    }

    return 'Active';
  }, [conversation]);

  return (
    <>
      <div
        className="
        relative
        w-full 
        flex 
        border-b-[1px] 
        sm:px-4 
        py-3 
        px-4 
        lg:px-6 
        justify-between 
        items-center 
        border-gray-50
      "
      >
        <div className="flex gap-3 items-center">
          <Link
            href="/conversations"
            className="
            lg:hidden 
            block 
            text-sky-500 
            hover:text-sky-600 
            transition 
            cursor-pointer
          "
          >
            <HiChevronLeft size={32} />
          </Link>
          {conversation.IsGroup ? (
            // Group avatar
            <div></div>
          ) : (
            <Avatar user={otherUser} withStatus />
          )}
          <div className="flex flex-col">
            <div className="text-zinc-700">
              {conversation.Name || otherUser?.Username}
            </div>
            <div className="text-sm font-light text-neutral-500">
              {otherUser && statusText}
            </div>
          </div>
        </div>
        <HiEllipsisVertical
          size={25}
          onClick={() => {}}
          className="
          text-slate-600
          cursor-pointer
          hover:text-slate-800
          transition
        "
        />
      </div>
    </>
  );
};

export default Header;
