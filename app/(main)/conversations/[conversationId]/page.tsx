'use client';

import EmptyState from '@/components/EmptyState';
import Header from './components/Header';
import Form from './components/Form';
import Body from './components/Body';
import { useMemo } from 'react';
import { useMain } from '@/app/hooks/useMain';
import useConversationParams from '@/app/hooks/useConversationParams';

const ConversationId = () => {
  const { conversations } = useMain();
  const { conversationId } = useConversationParams();

  const conversation = useMemo(
    () => (conversations ? conversations[conversationId] : null),
    [conversations, conversationId]
  );

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
