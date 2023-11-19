import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import useConversation from './useConversation';
import { HiChat, HiSearch } from 'react-icons/hi';
import {
  HiArrowLeftOnRectangle,
  HiOutlineChatBubbleLeftRight,
  HiUsers
} from 'react-icons/hi2';
import signOut from '../actions/signOut';

const useRoutes = () => {
  const pathname = usePathname();

  const { conversationId } = useConversation();

  const routes = useMemo(
    () => [
      {
        label: 'Chat',
        href: '/conversations',
        icon: HiOutlineChatBubbleLeftRight,
        active: pathname === 'conversations' || !!conversationId
      },
      {
        label: 'Search',
        href: '/search',
        icon: HiSearch,
        active: pathname === '/search'
      },
      {
        label: 'Contacts',
        href: '/contacts',
        icon: HiUsers,
        active: pathname === '/contacts'
      },
      {
        label: 'Logout',
        href: '#',
        onClick: () => signOut(),
        icon: HiArrowLeftOnRectangle
      }
    ],
    [pathname, conversationId]
  );

  return routes;
};

export default useRoutes;
