import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import useConversationParams from './useConversationParams';
import signOut from '../actions/signOut';
import { LogOut, MessageCircle, UsersRound } from 'lucide-react';

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
      },
      {
        label: 'Logout',
        href: '#',
        onClick: () => signOut(),
        icon: LogOut
      }
    ],
    [pathname, conversationId]
  );

  return routes;
};

export default useRoutes;
