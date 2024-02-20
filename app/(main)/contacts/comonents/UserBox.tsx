'use client';

import Avatar from '@/components/Avatar';
import { Conversation, Profile } from '@/types/index';
import { useCallback, useMemo } from 'react';

import {
  UserRoundPlus,
  UserRoundMinus,
  MessageCircle,
  CalendarRange,
  MoreVertical
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios, { AxiosRequestConfig } from 'axios';
import { toast } from '@/lib/utils';
import { format } from 'date-fns';

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

import { useModal } from '@/hooks/useUI';
import { useMain } from '@/hooks/useMain';

const UserBox = ({ data }: { data: Profile }) => {
  const router = useRouter();
  const { contacts, dispatchConversations, dispatchContacts } = useMain();

  const isContact = useMemo(() => {
    return !!contacts && !!contacts[data.userId];
  }, [contacts, data]);

  const { onOpen } = useModal();

  const onClickChat = useCallback(async () => {
    const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/conversations/create`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    try {
      const res = await axios.post(
        url,
        { memberIds: [data.userId], isGroup: false },
        options
      );

      const conversation = res.data.conversation as Conversation;

      // Add the conversation to the list if it does not already exist
      dispatchConversations({
        type: 'add',
        payload: { addInfo: { conversation, initMessages: true } }
      });

      router.push(`/conversations/${conversation.conversationId}`);
    } catch (e: any) {
      const error = e.response.data.error;

      toast('error', error.message);

      if (error.redirect) router.push(error.redirect);
    }
  }, [data, dispatchConversations, router]);

  const onAddContact = useCallback(
    async (e: any) => {
      e.preventDefault();

      const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/contacts/${data.userId}`;
      const config: AxiosRequestConfig = {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      };

      try {
        await axios.post(url, { contactId: data.userId }, config);

        dispatchContacts({ type: 'add', payload: { addInfo: { contact: data } } });
      } catch (e: any) {
        const error = e.response.data.error;

        toast('error', error.message);

        if (error.redirect) router.push(error.redirect);
      }
    },
    [data, dispatchContacts, router]
  );

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex justify-between items-center w-full p-4 cursor-default select-none">
          <div className="flex items-center space-x-3 collapse-title">
            <Avatar imageUrl={data.image} />
            <p className="text-sm font-medium">{data.username}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <MoreVertical
                size={20}
                onClick={(e) => e.preventDefault()}
                className="text-slate-600 dark:text-slate-100 cursor-pointer hover:text-slate-800 dark:hover:text-slate-300 transition"
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="flex items-center gap-x-2 cursor-pointer"
                  onClick={onClickChat}
                >
                  <MessageCircle size={18} className="text-yellow-600" />
                  <p>chat</p>
                </DropdownMenuItem>
                {!isContact && (
                  <DropdownMenuItem
                    className="flex items-center gap-x-2 cursor-pointer"
                    onClick={onAddContact}
                  >
                    <UserRoundPlus size={18} className="text-green-500" />
                    <p>add</p>
                  </DropdownMenuItem>
                )}
                {isContact && (
                  <DropdownMenuItem
                    className="flex items-center gap-x-1 cursor-pointer"
                    onClick={() =>
                      onOpen('removeContact', {
                        contact: {
                          username: data.username,
                          contactId: data.userId
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
            <div className="flex items-center pt-2">
              <span className="flex gap-x-1 text-xs text-muted-foreground">
                <CalendarRange size={18} /> Joined{' '}
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
