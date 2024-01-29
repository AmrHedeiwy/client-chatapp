'use client';

import Avatar from '@/app/components/Avatar';
import { Conversation, User } from '@/app/types/index';
import React, { FormEventHandler, useState } from 'react';
import clsx from 'clsx';
import {
  HiOutlineUserPlus,
  HiUserMinus,
  HiOutlineChatBubbleLeft,
  HiCalendarDays
} from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { notify } from '@/app/utils/notifications';
import { ErrorProps, ResponseProps } from '@/app/types/Axios';
import ActionModal from '@/app/components/modals/ActionModal';
import { useSocket } from '@/app/hooks/useSocket';
import { format, parse } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { useActiveConversationState } from '@/app/hooks/useActiveConversationState';

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
  const { dispatch } = useActiveConversationState();

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

        // Set the active conversation to the newly created conversation
        dispatch({ conversation });

        // Add the conversation to the top of the conversations list
        queryClient.setQueryData(['conversations'], (prevData: any) => {
          return [conversation, ...prevData];
        });

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
    <div
      className={clsx(
        `
        w-full
        relative
        collapse
        rounded-lg
        cursor-default
        select-none
        transition
        hover:border
        hover:p-1
        hover:bg-slate-100`,
        isActive && 'collapse-open bg-slate-100',
        !isActive && 'collapse-close'
      )}
    >
      <input type="checkbox" onInput={onInput} />

      <div className="flex items-center space-x-3 collapse-title">
        <Avatar user={data} />
        <p className="text-sm font-medium text-gray-900">{data.username}</p>
      </div>

      <div className="flex justify-center text-xl space-x-3 collapse-content">
        <button onClick={onClickChat} className="tooltip cursor-pointer" data-tip="chat">
          <HiOutlineChatBubbleLeft className="text-sky-500" />
        </button>

        <button className="tooltip" data-tip={isContact ? 'remove' : 'add'}>
          <label className="swap swap-flip">
            <input type="checkbox" checked={isContact} readOnly />

            <HiOutlineUserPlus
              className="text-green-500 tooltip cursor-pointer swap-off"
              onClick={() => onClickFriend('add')}
            />

            <HiUserMinus
              className="text-gray-500 swap-on"
              onClick={() =>
                // @ts-expect-error
                document?.getElementById(`unfollow_warning_${index}`)?.showModal()
              }
            />
          </label>
        </button>

        <button
          className="tooltip cursor-pointer pb-1"
          data-tip={`Joined ${
            data.createdAt && format(new Date(data.createdAt), 'MMMM d, yyyy')
          }`}
        >
          <HiCalendarDays className="text-zinc-900" />
        </button>
      </div>

      <ActionModal
        id={`unfollow_warning_${index}`}
        title="WARNING"
        buttonClose="cancle"
        buttonConfirm="confirm"
        onClickConfirm={() => {
          onClickFriend('remove');
        }}
        content={
          <p className="py-4">
            Are you sure you want to remove <strong>{data.username}</strong> from your
            contacts?
          </p>
        }
      />
    </div>
  );
};

export default UserBox;
