'use client';

import { Moon, Palette, Sun, SunMoon } from 'lucide-react';
import { useTheme } from 'next-themes';

import {
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu';

function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-x-1">
        <Palette className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
        theme
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent>
          <DropdownMenuItem className="gap-x-1" onClick={() => setTheme('light')}>
            <Sun className="h-[1.2rem] w-[1.2rem]" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-x-1" onClick={() => setTheme('dark')}>
            <Moon className="h-[1.2rem] w-[1.2rem]" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-x-1" onClick={() => setTheme('system')}>
            <SunMoon className="h-[1.2rem] w-[1.2rem]" />
            System
          </DropdownMenuItem>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );

  // return (
  //   <DropdownMenu>
  //     <DropdownMenuTrigger asChild>
  //       <Button className="bg-transparent border-0" variant={'outline'} size="icon">
  //         <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
  //         <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
  //         <span className="sr-only">Toggle theme</span>
  //       </Button>
  //     </DropdownMenuTrigger>
  //     <DropdownMenuContent align="end">
  //       <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
  //       <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
  //       <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
  //     </DropdownMenuContent>
  //   </DropdownMenu>
  // );
}

export default ModeToggle;
