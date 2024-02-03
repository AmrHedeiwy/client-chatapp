'use client';

import Avatar from '@/components/Avatar';
import useConversationParams from '@/app/hooks/useConversationParams';
import { useSession } from '@/app/hooks/useSession';
import { useSocket } from '@/app/hooks/useSocket';
import { Conversation, Message, User } from '@/app/types';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';

interface ConversationBoxProps {
  conversation: Conversation;
  isOnline?: boolean;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({ conversation, isOnline }) => {
  const router = useRouter();
  const { session } = useSession();
  const otherUser = !conversation.isGroup ? conversation.otherUser : null;
  const { conversationId: activeConversationId } = useConversationParams();
  const { socket, isConnected } = useSocket();

  const { data } = useQuery({
    queryKey: ['messages', conversation.conversationId],
    enabled: false
  });

  const lastMessage = useMemo(() => {
    return (data as any)?.pages[0].items[0] as Message;
  }, [data]);

  const unseenMessagesCount = useMemo(() => {
    return (data as any)?.unseenMessagesCount as number;
  }, [data]);

  const handleClick = useCallback(() => {
    router.push(`/conversations/${conversation.conversationId}`);
  }, [conversation, router, socket, unseenMessagesCount]);

  const userUserId = useMemo(() => session?.userId, [session?.userId]);

  const hasSeen = useMemo(() => {
    if (!lastMessage) {
      return false;
    }

    if (!userUserId) {
      return false;
    }

    return unseenMessagesCount === 0 || lastMessage.senderId === userUserId;
  }, [userUserId, lastMessage]);

  const lastMessageText = useMemo(() => {
    if (lastMessage?.fileUrl) {
      return 'Sent an image';
    }

    if (lastMessage?.content) {
      return lastMessage?.content;
    }

    return `Say hi to ${otherUser?.username}🫶🏼`;
  }, [lastMessage]);

  return (
    <div
      onClick={handleClick}
      className={clsx(
        `
        w-full 
        relative 
        flex 
        items-center 
        space-x-3 
        rounded-lg
        cursor-pointer
        p-4
        hover:bg-zinc-200
        dark:hover:bg-zinc-700`,
        activeConversationId === conversation.conversationId
          ? 'bg-zinc-200 dark:bg-zinc-700 '
          : 'bg-transparent'
      )}
    >
      {conversation.isGroup ? (
        'Grouped Avatar (Implement later)'
      ) : (
        <Avatar user={otherUser as User} withStatus isOnline={isOnline} />
      )}
      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          <div className="flex justify-between items-center mb-1">
            <p
              className={clsx(
                `text-md font-medium text-gray-900 dark:text-gray-100 transition`
              )}
            >
              {conversation.name}
            </p>

            {lastMessage?.createdAt && (
              <p
                className="
                  text-xs 
                  text-gray-400
                  dark:text-gray-100 
                  font-light
                "
              >
                {format(new Date(lastMessage.createdAt), 'p')}
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <p
              className={clsx(
                `truncate text-xs`,
                !isConnected || hasSeen
                  ? 'text-zinc-500 dark:text-zinc-300'
                  : 'text-black dark:text-white font-bold'
              )}
            >
              {conversation.isGroup
                ? lastMessage?.senderId !== userUserId
                  ? lastMessage?.user.username + ' ' + lastMessageText
                  : 'You: ' + lastMessageText
                : lastMessageText}
            </p>
            {unseenMessagesCount > 0 && (
              <p className="font-semibold text-xs">{unseenMessagesCount}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
