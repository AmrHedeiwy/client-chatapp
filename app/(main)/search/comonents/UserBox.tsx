'use client';

import Avatar from '@/app/components/Avatar';
import { User } from '@/app/types/index';
import React, { FormEventHandler, useState } from 'react';
import clsx from 'clsx';
import { BsChatDots, BsInfoCircle, BsPersonAdd, BsPersonFillCheck } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { notify } from '@/app/utils/notifications';
import { ErrorProps, ResponseProps } from '@/app/types/Axios';
import ActionModal from '@/app/components/modals/ActionModal';

interface UserBoxProps {
  index: string;
  data: User;
  isActive: boolean;
  onInput: FormEventHandler<HTMLInputElement>;
}

const UserBox: React.FC<UserBoxProps> = ({ index, data, isActive, onInput }) => {
  const [isFollowing, setIsFollowing] = useState(data.IsFollowingCurrentUser);
  const router = useRouter();

  const onClickChat = () => {
    const url = `http://localhost:5000/user/conversation/create`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    axios.post(url, { OtherUserID: data.UserID }, options).then(async (res) => {
      const conversationID = res.data.conversation.ConversationID;

      router.push(`/conversations/${conversationID}`);
    });
  };

  const onClickFriend = (action: 'add' | 'remove') => {
    const url = `http://localhost:5000/user/friend/${action}?friendId=${data.UserID}`;
    const options: AxiosRequestConfig = {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' }
    };

    axios
      .post(url, { FriendID: data.UserID }, options)
      .then((res: AxiosResponse<ResponseProps>) => {
        const { isFollowed } = res.data;

        setIsFollowing(isFollowed);
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
        hover:bg-slate-100
        focus-within:bg-slate-100`,
        isActive && 'collapse-open',
        !isActive && 'collapse-close'
      )}
    >
      <input type="checkbox" onInput={onInput} />

      <div className="flex items-center space-x-3 collapse-title">
        <Avatar user={data} />
        <p className="text-sm font-medium text-gray-900">{data.Username}</p>
      </div>

      <div className="flex justify-center items-center text-xl space-x-4 collapse-content">
        <div onClick={onClickChat} className="tooltip cursor-pointer" data-tip="chat">
          <BsChatDots className="text-sky-500" />
        </div>

        <div className="pt-1 tooltip" data-tip={isFollowing ? 'following' : 'follow'}>
          <label className="swap swap-flip">
            <input type="checkbox" checked={isFollowing} readOnly />

            <BsPersonAdd
              className="text-green-500 tooltip cursor-pointer swap-off"
              onClick={() => onClickFriend('add')}
            />

            <BsPersonFillCheck
              className="text-gray-500 swap-on"
              onClick={() =>
                // @ts-expect-error
                document?.getElementById(`unfollow_warning_${index}`)?.showModal()
              }
            />
          </label>
        </div>

        <div className="tooltip " data-tip="comming soon">
          <BsInfoCircle className="text-blue-800" />
        </div>
      </div>

      <ActionModal
        id={`unfollow_warning_${index}`}
        title="WARNING"
        buttonClose="cancle"
        buttonConfirm="confirm"
        onClickConfirm={() => {
          onClickFriend('remove');
        }}
        content={`Are you sure you want to unfollow ${data.Username}?`}
      />
    </div>
  );
};

export default UserBox;
