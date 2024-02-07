'use client';

import useConversationParams from '@/hooks/useConversationParams';
import useRoutes from '@/hooks/useRoutes';

import MobileItem from './MobileItem';

const MobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversationParams();

  if (isOpen) {
    return null;
  }
  return (
    <div
      className="
        flex
        fixed
        justify-between
        w-full
        bottom-0
        z-40
        lg:hidden
        dark:bg-[#1E1F22] 
        bg-[#E3E5E8]
      "
    >
      <ul role="list" className="flex items-center w-full">
        {routes.map((route) => {
          return (
            <MobileItem
              key={route.href}
              href={route.href}
              icon={route.icon}
              active={route.active}
              onClick={route.onClick}
            />
          );
        })}
      </ul>
    </div>
  );
};

export default MobileFooter;
