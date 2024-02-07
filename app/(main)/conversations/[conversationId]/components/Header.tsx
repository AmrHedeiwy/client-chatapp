'use client';

import { useMemo } from 'react';
import Link from 'next/link';

import Avatar from '@/components/Avatar';
import { Conversation } from '@/types';
import { useSocket } from '@/hooks/useSocket';
import { ArrowLeft, MoreVertical } from 'lucide-react';

interface HeaderProps {
  conversation: Conversation;
}

const Header: React.FC<HeaderProps> = ({ conversation }) => {
  const { onlineSockets } = useSocket();

  // Check if the other user is online, ignored if the conversation is a group
  const isOnline = useMemo(
    () => onlineSockets?.includes(conversation.otherMember?.userId as string),
    [onlineSockets, conversation.otherMember]
  );

  const statusText = useMemo(() => {
    if (conversation.isGroup) {
      return `${conversation.members.length} members`;
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
        lg:py-3
        py-1
        px-4 
        lg:px-6 
        justify-between 
        items-center 
        border-gray-50
      "
    >
      <div className="flex gap-2 items-center">
        <Link
          href="/conversations"
          className="
            lg:hidden 
            block 
            transition 
            cursor-pointer
          "
        >
          <ArrowLeft size={20} />
        </Link>
        <Avatar
          imageUrl={
            conversation.isGroup
              ? conversation.image
              : (conversation.otherMember?.image as string)
          }
          withStatus
          isOnline={!!isOnline}
        />
        <div className="flex flex-col">
          <div className="text-md font-medium text-gray-900 dark:text-gray-100 transition">
            {conversation.name}
          </div>
          <div className="text-sm font-light text-neutral-500 dark:text-neutral-400">
            {statusText}
          </div>
        </div>
      </div>
      <MoreVertical
        size={24}
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
