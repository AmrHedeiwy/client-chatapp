import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import useConversationParams from './useConversationParams';
import { HiArrowLeftOnRectangle, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { RiContactsLine } from 'react-icons/ri';
import signOut from '../actions/signOut';
import { useActiveConversationState } from './useActiveConversationState';

const useRoutes = () => {
  const pathname = usePathname();

  const { conversationId } = useConversationParams();

  const routes = useMemo(
    () => [
      {
        label: 'Chat',
        href: '/conversations',
        icon: HiOutlineChatBubbleLeftRight,
        active: pathname === '/conversations' || !!conversationId
      },
      {
        label: 'Search',
        href: '/search',
        icon: RiContactsLine,
        active: pathname === '/search'
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
