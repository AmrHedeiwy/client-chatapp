import { MessagingContext } from '../provider/MessagingProvider';
import { useContext } from 'react';

export const useActiveConversationState = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error(
      'useActiveConversationState() must be used within an MessagingProvider'
    );
  }
  return context;
};
