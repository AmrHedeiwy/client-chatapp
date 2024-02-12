'use client';

import Avatar from '@/components/Avatar';
import { Conversation, User } from '@/types/index';
import { FormEventHandler, useState } from 'react';

import {
  UserRoundPlus,
  UserRoundMinus,
  MessageCircle,
  CalendarRange,
  MoreVertical
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { cn, toast } from '@/lib/utils';
import { format } from 'date-fns';
import { ErrorProps } from '@/types/Axios';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';

import { useQueryClient } from '@tanstack/react-query';
import { useModal } from '@/hooks/useModal';
import { useMain } from '@/hooks/useMain';

interface UserBoxProps {
  index: string;
  data: User;
  isActive: boolean;
  onInput: FormEventHandler<HTMLInputElement>;
}

const UserBox: React.FC<UserBoxProps> = ({ index, data, isActive, onInput }) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isContact, setIsContact] = useState(data.isContact); // Indicates whether this user is a contact of the logged-in user

  const { dispatchConversations } = useMain();
  const { onOpen } = useModal();

  const onClickChat = () => {
    const url = `http://localhost:5000/conversations/create`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    axios
      .post(url, { members: [data.userId], isGroup: false }, options)
      .then(async (res) => {
        const conversation = res.data.conversation as Conversation;

        // Add the conversation to the list if it does not already exist
        dispatchConversations({ type: 'add', payload: { conversation } });

        // Initialize the messages for the conversation in the user's cache
        await queryClient.setQueryData(['messages', conversation.conversationId], {
          pages: [{ items: [], nextPage: 0 }],
          pageParams: 0,
          unseenMessagesCount: 0
        });

        router.push(`/conversations/${conversation.conversationId}`);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        const error = e.response?.data.error;

        toast('error', error?.message as string);

        if (error?.redirect) router.push(error.redirect);
      });
  };

  const onClickFriend = (action: 'add' | 'remove', e?: any) => {
    e?.preventDefault();

    const url = `http://localhost:5000/contacts/manage`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    axios
      .post(url, { contactId: data.userId, action }, options)
      .then((res: AxiosResponse) => {
        const { isContact } = res.data;

        setIsContact(isContact);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        const error = e.response?.data.error;

        toast('error', error?.message as string);

        if (error?.redirect) router.push(error.redirect);
      });
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            `
            flex
            justify-between
            items-center
            w-full
            p-4
            rounded-lg
            cursor-default
            select-none
            bg-transparent`
          )}
        >
          <div className="flex items-center space-x-3 collapse-title">
            <Avatar imageUrl={data.image} />
            <p className="text-sm font-medium">{data.username}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical
                size={25}
                onClick={(e) => e.preventDefault()}
                className="
                text-slate-600
                dark:text-slate-100
                  cursor-pointer
                hover:text-slate-800
                dark:hover:text-slate-300
                  transition
                "
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="flex items-center gap-x-1 cursor-pointer"
                  onClick={onClickChat}
                >
                  <MessageCircle size={20} className="text-yellow-600" />
                  <p className="font-bold">chat</p>
                </DropdownMenuItem>
                {!isContact && (
                  <DropdownMenuItem
                    className="flex items-center gap-x-1 cursor-pointer"
                    onClick={(e) => onClickFriend('add', e)}
                  >
                    <UserRoundPlus size={20} className="text-green-500" />
                    <p className="font-bold">add</p>
                  </DropdownMenuItem>
                )}
                {isContact && (
                  <DropdownMenuItem
                    className="flex items-center gap-x-1 cursor-pointer"
                    onClick={() =>
                      onOpen('removeContact', {
                        contact: {
                          username: data.username,
                          confirm: onClickFriend
                        }
                      })
                    }
                  >
                    <UserRoundMinus size={20} className="text-green-500" />
                    <p className="font-bold">remove</p>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@{data.username}</h4>
            <p className="text-sm">Some user description.</p>
            <div className="flex items-center pt-2">
              <span className="flex gap-x-1 text-xs text-muted-foreground">
                <CalendarRange /> Joined{' '}
                {data.createdAt
                  ? format(new Date(data.createdAt), 'dd MMMM yyy')
                  : 'server is acting sus today, idk why it does not want to load the date'}
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default UserBox;
