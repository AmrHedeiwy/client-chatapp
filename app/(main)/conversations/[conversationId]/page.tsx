'use client';

import EmptyState from '@/components/EmptyState';
import Header from './components/Header';
import Form from './components/Form';
import Body from './components/Body';
import { useEffect, useMemo } from 'react';
import { useMain } from '@/hooks/useMain';
import useConversationParams from '@/hooks/useConversationParams';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/hooks/useSocket';

const ConversationId = () => {
  const { conversations } = useMain();
  const { conversationId } = useConversationParams();
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const conversation = useMemo(
    () => (conversations ? conversations[conversationId] : null),
    [conversations, conversationId]
  );

  useEffect(() => {
    if (!conversation) return;

    const data = queryClient.getQueryData([
      'messages',
      conversation.conversationId
    ]) as any;

    if (!data) return;

    const unseenMessagesCount = data.unseenMessagesCount;
    if (unseenMessagesCount > 0 && !!socket) {
      const messages = data.pages[0].items;

      console.log(messages.slice(0, unseenMessagesCount))
      socket.emit('update_status', {
        type: 'seen',
        messages: messages.slice(0, unseenMessagesCount),
        seenAt: Date.now()
      });

      queryClient.setQueryData(
        ['messages', conversation.conversationId],
        (prevData: any) => {
          return {
            ...prevData,
            unseenMessagesCount: 0
          };
        }
      );
    }
  }, [socket, conversation, queryClient]);

  if (!conversation) {
    return (
      <div className="lg:pl-80 h-full">
        <div className="h-full flex flex-col">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-80 h-full ">
      <div className="h-full flex flex-col">
        <Header conversation={conversation} />
        <Body conversation={conversation} />
        <Form conversation={conversation} />
      </div>
    </div>
  );
};

export default ConversationId;
