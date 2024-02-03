'use client';

import useRoutes from '@/app/hooks/useRoutes';
import React, { useState } from 'react';
import DesktopItem from './DesktopItem';
import Avatar from '../Avatar';
import { useMain } from '@/app/hooks/useMain';
import { ModeToggle } from '@/components/ModeToggle';

const DesktopSidebar = () => {
  const routes = useRoutes();
  const { userProfile } = useMain();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="
        hidden  
        lg:fixed
        lg:inset-y-0
        lg:w-[80px] 
        lg:z-30 
        lg:overflow-y-auto
        lg:overflow-x-hidden
        lg:pb-4
        lg:flex
        lg:flex-col
        lg:justify-between
        dark:bg-[#1E1F22] 
        bg-[#E3E5E8] 
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
      <nav className="pb-3 mt-auto flex items-center flex-col gap-y-4">
        <ModeToggle />
        <div
          onClick={() => setIsOpen(true)}
          className="cursor-pointer hover:opacity-75 transition"
        >
          <Avatar user={userProfile} current />
        </div>
      </nav>
    </div>
  );
};

export default DesktopSidebar;