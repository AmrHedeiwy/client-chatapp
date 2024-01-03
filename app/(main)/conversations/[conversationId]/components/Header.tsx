'use client';

import { HiChevronLeft } from 'react-icons/hi';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { useMemo } from 'react';
import Link from 'next/link';

import Avatar from '@/app/components/Avatar';
import { Conversation } from '@/app/types';
import { useSocket } from '@/app/hooks/useSocket';

interface HeaderProps {
  conversation: Conversation;
}

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const { onlineUsers } = useSocket();

  const isOnline = !conversation.IsGroup
    ? useMemo(
        () => onlineUsers.includes(conversation.OtherUser?.UserID as string),
        [onlineUsers]
      )
    : null;

  const statusText = useMemo(() => {
    if (conversation.IsGroup) {
      return `${conversation.Users.length} members`;
    }

    return isOnline ? 'active' : 'offline';
  }, [conversation, isOnline]);

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
            <Avatar user={conversation.OtherUser} withStatus isOnline={!!isOnline} />
          )}
          <div className="flex flex-col">
            <div className="text-zinc-700">{conversation.Name}</div>
            <div className="text-sm font-light text-neutral-500">{statusText}</div>
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
