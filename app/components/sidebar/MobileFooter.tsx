'use client';

import useConversationParams from '@/app/hooks/useConversationParams';
import useRoutes from '@/app/hooks/useRoutes';
import React from 'react';
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
        items-center
        menu-bg
        border-t-[1px]
        lg:hidden
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
