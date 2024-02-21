import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import useConversationParams from './useConversationParams';
import { MessageCircle, UsersRound } from 'lucide-react';

const useRoutes = () => {
  const pathname = usePathname();

  const { conversationId } = useConversationParams();

  const routes = useMemo(
    () => [
      {
        label: 'Chat',
        href: '/conversations',
        icon: MessageCircle,
        active: pathname === '/conversations' || !!conversationId
      },
      {
        label: 'Contact',
        href: '/contacts',
        icon: UsersRound,
        active: pathname === '/contacts'
      }
    ],
    [pathname, conversationId]
  );

  return routes;
};

export default useRoutes;
