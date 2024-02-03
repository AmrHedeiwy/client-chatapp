'use client';

import { HiChevronLeft } from 'react-icons/hi';
import { HiEllipsisVertical } from 'react-icons/hi2';
import { useMemo } from 'react';
import Link from 'next/link';

import Avatar from '@/components/Avatar';
import { Conversation } from '@/app/types';
import { useSocket } from '@/app/hooks/useSocket';

interface HeaderProps {
  conversation: Conversation;
}

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const { onlineUsers } = useSocket();

  // Check if the other user is online, ignored if the conversation is a group
  const isOnline = useMemo(
    () => onlineUsers?.includes(conversation.otherUser?.userId as string),
    [onlineUsers, conversation.otherUser]
  );

  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.users.length} members`;
    }

    return isOnline ? 'active' : 'offline';
  }, [conversation, isOnline]);

  return (
    <div
      className="
        relative
        w-full 
        flex 
        shadow-md
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
        {conversation.isGroup ? (
          // Group avatar
          <div></div>
        ) : (
          <Avatar user={conversation.otherUser} withStatus isOnline={!!isOnline} />
        )}
        <div className="flex flex-col">
          <div className="text-md font-medium text-gray-900 dark:text-gray-100 transition">
            {conversation.name}
          </div>
          <div className="text-sm font-light text-neutral-500 dark:text-neutral-400">
            {statusText}
          </div>
        </div>
      </div>
      <HiEllipsisVertical
        size={25}
        onClick={() => {}}
        className="
          text-slate-600
          dark:text-slate-100
          cursor-pointer
          hover:text-slate-800
          dark:hover:text-slate-300
          transition
        "
      />
    </div>
  );
};

export default Header;
