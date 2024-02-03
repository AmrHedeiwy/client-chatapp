'use client';

import Avatar from '@/components/Avatar';
import { Conversation, User } from '@/app/types/index';
import { FormEventHandler, useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  HiOutlineUserPlus,
  HiUserMinus,
  HiOutlineChatBubbleLeft,
  HiCalendarDays,
  HiEllipsisVertical
} from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { notify } from '@/app/utils/notifications';
import { ErrorProps } from '@/app/types/Axios';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useMain } from '@/app/hooks/useMain';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface UserBoxProps {
  index: string;
  data: User;
  isActive: boolean;
  onInput: FormEventHandler<HTMLInputElement>;
}

const UserBox: React.FC<UserBoxProps> = ({ index, data, isActive, onInput }) => {
  // Indicates whether this user is a contact of the logged-in user
  const [isContact, setIsContact] = useState(data.isContact);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { dispatchConversations } = useMain();
  const [onMount, setOnMount] = useState(false);

  const onClickChat = () => {
    const url = `http://localhost:5000/conversations/create`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    axios
      .post(url, { otherUserId: data.userId }, options)
      .then(async (res) => {
        const conversation = res.data.conversation as Conversation;

        // Add the conversation to the list if it does not already exist
        dispatchConversations({ type: 'add', payload: { conversation } });

        // Initialize the messages for the conversation in the user's cache
        queryClient.setQueryData(['messages', conversation.conversationId], {
          pages: [{ items: [], nextPage: 0 }],
          pageParams: 0,
          unseenMessagesCount: 0
        });

        router.push(`/conversations/${conversation.conversationId}`);
      })
      .catch((e: AxiosError<ErrorProps>) => {
        const error = e.response?.data.error;

        notify('error', error?.message as string);

        if (error?.redirect) router.push(error.redirect);
      });
  };

  const onClickFriend = (action: 'add' | 'remove') => {
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

        notify('error', error?.message as string);

        if (error?.redirect) router.push(error.redirect);
      });
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div
          className={clsx(
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
            <Avatar user={data} />
            <p className="text-sm font-medium">{data.username}</p>
          </div>

          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <HiEllipsisVertical
                  size={25}
                  onClick={() => {}}
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
                <DropdownMenuLabel>actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="flex items-center gap-x-1 cursor-pointer"
                    onClick={onClickChat}
                  >
                    <HiOutlineChatBubbleLeft className="text-yellow-600" />
                    <p className="font-bold">chat</p>
                  </DropdownMenuItem>
                  {!isContact && (
                    <DropdownMenuItem
                      className="flex items-center gap-x-1 cursor-pointer"
                      onClick={() => onClickFriend('add')}
                    >
                      <HiOutlineUserPlus className="text-green-500" />
                      <p className="font-bold">add</p>
                    </DropdownMenuItem>
                  )}
                  {isContact && (
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="flex items-center gap-x-1 cursor-pointer">
                        <HiUserMinus className="text-green-500" />
                        <p className="font-bold">remove</p>
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove {data.username} from your contacts
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onClickFriend('remove')}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex justify-between space-x-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">@{data.username}</h4>
            <p className="text-sm">Some user description.</p>
            <div className="flex items-center pt-2">
              <span className="flex gap-x-1 text-xs text-muted-foreground">
                <HiCalendarDays /> Joined{' '}
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
