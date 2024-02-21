'use client';

import useRoutes from '@/hooks/useRoutes';
import DesktopItem from './DesktopItem';
import SettingsToggle from '../SettingsToggle';

const DesktopSidebar = () => {
  const routes = useRoutes();

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
      <nav className="pb-3 mt-auto flex justify-center">
        <SettingsToggle />
      </nav>
    </div>
  );
};

export default DesktopSidebar;
