'use client';

import useRoutes from '@/app/hooks/useRoutes';
import React, { useState } from 'react';
import DesktopItem from './DesktopItem';
import { User } from '@/app/types/index';
import Avatar from '../Avatar';

interface DesktopSidebarProps {
  currentUser: User;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const routes = useRoutes();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="
        hidden
        lg:fixed
        lg:inset-y-0
        lg:left-0
        lg:z-40
        lg:w-20
        xl:px-6
        lg:overflow-y-auto
        lg:overflow-x-hidden
        menu-bg
        lg:pb-4
        lg:flex
        lg:flex-col
        justify-between
     "
    >
      <nav className="mt-4 flex flex-col justify-between">
        <ul role="list" className="flex flex-col items-center space-y-3">
          {routes.map((item) => {
            return (
              <DesktopItem
                key={item.label}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={item.active}
                onClick={item.onClick}
              />
            );
          })}
        </ul>
      </nav>
      <nav className="mt-4 flex flex-col justify-between items-center">
        <div
          onClick={() => setIsOpen(true)}
          className="cursor-pointer hover:opacity-75 transition"
        >
          <Avatar user={currentUser} current />
        </div>
      </nav>
    </div>
  );
};

export default DesktopSidebar;
