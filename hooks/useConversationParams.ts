import { useParams } from 'next/navigation';
import { useMemo } from 'react';

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
