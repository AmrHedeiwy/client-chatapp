'use client';

import EmptyState from '@/app/components/EmptyState';
import Header from './components/Header';
import Form from './components/Form';
import Body from './components/Body';
import { useQuery } from '@tanstack/react-query';
import { Conversation, User } from '@/app/types';
import { useEffect, useMemo } from 'react';
import { useActiveConversationState } from '@/app/hooks/useActiveConversationState';

const ConversationId = () => {
  const { conversation } = useActiveConversationState();

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
      <div className="h-full flex flex-col text-black bg-emerald-900 bg-opacity-10">
        <Header conversation={conversation} />
        <Body />
        <Form
          otherUsers={(conversation.otherUsers || [conversation.otherUser]) as User[]}
        />
      </div>
    </div>
  );
};

export default ConversationId;
