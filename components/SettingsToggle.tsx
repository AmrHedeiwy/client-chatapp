import ModeToggle from '@/components/ModeToggle';
import { LogOut, Settings, Trash, UserRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from './ui/dropdown-menu';
import { useMain } from '@/hooks/useMain';
import { useModal } from '@/hooks/useUI';
import signOut from '@/actions/signOut';

const SettingsToggle = () => {
  const { userProfile } = useMain();
  const { onOpen } = useModal();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Settings className="h-[1.8rem] w-[1.8rem] lg:h-[2rem] lg:w-[2rem] text-gray-400 cursor-pointer hover:opacity-75 transition" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="gap-x-1"
            onClick={() => onOpen('userProfile', { profile: userProfile })}
          >
            <UserRound className="h-[1.2rem] w-[1.2rem]" /> profile
          </DropdownMenuItem>
          <ModeToggle />
          <DropdownMenuItem className="gap-x-1" onClick={() => signOut()}>
            <LogOut className="h-[1.2rem] w-[1.2rem]" /> log out
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-x-1 hover:dark:bg-rose-900"
            onClick={() => onOpen('deleteAccount', {})}
          >
            <Trash className="h-[1.2rem] w-[1.2rem]" />
            Delete account
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SettingsToggle;
