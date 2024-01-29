import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { Conversation } from '../types';

const useConversationParams = () => {
  const params = useParams();

  const conversationId = useMemo(() => {
    if (!params.conversationId) {
      return '';
    }

    return params.conversationId as string;
  }, [params.conversationId]);

  const isOpen = useMemo(() => !!conversationId, [conversationId]);

  return useMemo(
    () => ({
      isOpen,
      conversationId
    }),
    [isOpen, conversationId]
  );
};

export default useConversationParams;
