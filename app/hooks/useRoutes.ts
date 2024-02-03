import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import useConversationParams from './useConversationParams';
import { HiArrowLeftOnRectangle, HiOutlineChatBubbleLeftRight } from 'react-icons/hi2';
import { RiContactsLine } from 'react-icons/ri';
import signOut from '../actions/signOut';

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
        label: 'Contact',
        href: '/contacts',
        icon: RiContactsLine,
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
