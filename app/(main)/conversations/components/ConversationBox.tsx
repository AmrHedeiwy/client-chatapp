'use client';

import Avatar from '@/components/Avatar';
import useConversationParams from '@/hooks/useConversationParams';
import { useMain } from '@/hooks/useMain';
import { useSocket } from '@/hooks/useSocket';
import { cn } from '@/lib/utils';
import { Conversation, Member, Message } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';

interface ConversationBoxProps {
  conversation: Conversation;
  isOnline?: boolean;
}

const ConversationBox: React.FC<ConversationBoxProps> = ({ conversation, isOnline }) => {
  const router = useRouter();
  const { userProfile } = useMain();
  const otherMember = !conversation.isGroup ? conversation.otherMember : null;
  const { conversationId: activeConversationId } = useConversationParams();
  const { socket } = useSocket();

  const { data } = useQuery({
    queryKey: ['messages', conversation.conversationId],
    enabled: false
  });

  const lastMessage = useMemo(() => {
    return (data as any)?.pages[0].items[0] as Message | null;
  }, [data]);

  const unseenMessagesCount = useMemo(() => {
    return (data as any)?.unseenMessagesCount as number;
  }, [data]);

  const handleClick = useCallback(() => {
    router.push(`/conversations/${conversation.conversationId}`);
  }, [conversation, router]);

  const hasSeen = useMemo(() => {
    if (!lastMessage) {
      return false;
    }

    if (!userProfile) {
      return false;
    }

    return unseenMessagesCount === 0 || lastMessage.sender.userId === userProfile.userId;
  }, [userProfile, lastMessage, unseenMessagesCount]);

  const lastMessageText = useMemo(() => {
    if (!lastMessage)
      return `Say hi to ${
        conversation.isGroup
          ? conversation.name + ' members'
          : (otherMember as Member).profile.username
      }🫶🏼`;

    if (!!lastMessage.deletedAt) return 'This message was deleted';

    if (lastMessage.fileUrl) {
      if (conversation.isGroup) {
        return lastMessage.sender.userId !== userProfile.userId
          ? `${lastMessage.sender.username}: sent an image`
          : 'You: sent an image';
      }
      return 'Sent an image';
    }

    if (lastMessage.content) {
      if (conversation.isGroup) {
        return lastMessage.sender.userId !== userProfile.userId
          ? `${lastMessage.sender.username}: ${lastMessage.content}`
          : `You: ${lastMessage.content}`;
      }
      return lastMessage.content;
    }
  }, [lastMessage, conversation, otherMember, userProfile]);

  return (
    <div
      onClick={handleClick}
      className={cn(
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
      <Avatar
        imageUrl={
          conversation.isGroup
            ? conversation.image
            : (conversation.otherMember?.profile.image as string | null)
        }
        withStatus={!conversation.isGroup}
        isOnline={isOnline}
      />

      <div className="min-w-0 flex-1">
        <div className="focus:outline-none">
          <span className="absolute inset-0" aria-hidden="true" />
          <div className="flex justify-between items-center mb-1">
            <p
              className={cn(
                `text-md font-medium text-gray-900 dark:text-gray-100 transition`,
                !conversation.isGroup &&
                  !!conversation.otherMember?.profile.deletedAt &&
                  'italic text-zinc-500 dark:text-zinc-400 '
              )}
            >
              {conversation.isGroup
                ? conversation.name
                : conversation.otherMember?.profile.username}
            </p>

            {lastMessage && lastMessage.sentAt && (
              <p
                className="
                  text-xs 
                  text-gray-400
                  dark:text-gray-100 
                  font-light
                "
              >
                {format(new Date(lastMessage.sentAt), 'p')}
              </p>
            )}
          </div>
          <div className="flex justify-between">
            <p
              className={cn(
                `truncate text-xs`,
                socket?.disconnect || hasSeen
                  ? 'text-zinc-500 dark:text-zinc-300'
                  : 'text-black dark:text-white font-bold',
                !!lastMessage &&
                  !!lastMessage.deletedAt &&
                  'italic text-zinc-500 dark:text-zinc-400 text-xs'
              )}
            >
              {lastMessageText}
            </p>
            {unseenMessagesCount > 0 && (
              <span className="font-extrabold p-1 text-xs">{unseenMessagesCount}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationBox;
