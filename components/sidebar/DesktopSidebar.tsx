'use client';

import React, { useState } from 'react';
import useRoutes from '@/hooks/useRoutes';
import { useMain } from '@/hooks/useMain';

import { ModeToggle } from '@/components/ModeToggle';

import DesktopItem from './DesktopItem';
import Avatar from '../Avatar';
import { useModal } from '@/hooks/useUI';

const DesktopSidebar = () => {
  const routes = useRoutes();
  const { userProfile } = useMain();
  const { onOpen } = useModal();

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
          onClick={() => onOpen('userProfile', { profile: userProfile })}
          className="cursor-pointer hover:opacity-75 transition"
        >
          {userProfile && <Avatar imageUrl={userProfile.image as string} current />}
        </div>
      </nav>
    </div>
  );
};

export default DesktopSidebar;
