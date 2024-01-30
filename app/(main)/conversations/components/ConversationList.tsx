'use client';

import useConversationParams from '@/app/hooks/useConversationParams';
import { Conversation } from '@/app/types';
import clsx from 'clsx';
import React, { ChangeEvent, ElementRef, useEffect, useRef, useState } from 'react';
import ConversationBox from './ConversationBox';
import SearchBarInput from '@/app/components/inputs/SeachBarInput';
import useListScroll from '@/app/hooks/useListScroll';
import { useSession } from '@/app/hooks/useSession';
import { useSocket } from '@/app/hooks/useSocket';
import { useQuery } from '@tanstack/react-query';

const ConversationList = () => {
  const session = useSession();

  const { onlineUsers } = useSocket();
  const { isOpen } = useConversationParams();

  const { data } = useQuery({
    queryKey: ['conversations'],
    enabled: false,
    staleTime: Infinity
  });

  const [filteredItems, setFilteredItems] = useState<Conversation[] | null>(
    data as Conversation[] | null
  );

  const topRef = useRef<ElementRef<'div'>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!!data) setFilteredItems(data as Conversation[]);
  }, [data]);

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setFilteredItems(() => {
      return (
        (data as Conversation[])?.filter((conversation) => {
          const conversationName = (
            conversation.name ??
            conversation.users.filter((user) => user.userId != session.user?.userId)[0]
              .username
          ).toLowerCase();

          return conversationName.startsWith(value.toLowerCase());
        }) ?? null
      );
    });
  };

  useListScroll(topRef);

  return (
    <aside
      className={clsx(
        `
        fixed
        inset-y-0
        pb-20
        lg:pb-0
        lg:left-20
        lg:w-80
        lg:block
        border-r
        border-gray-200
        block
        w-full
        left-0
      `,
        isOpen ? 'hidden' : 'block w-full left-0'
      )}
    >
      <div className="flex-col px-5">
        <div className="py-4">
          <h3 className="text-lg font-bold text-neutral-600 pb-4">Chats</h3>
          <SearchBarInput
            inputRef={inputRef}
            onChange={onChange}
            placeholder="Seacrh here..."
          />
        </div>
      </div>

      <div ref={topRef} className="overflow-y-auto scrollable-content px-2">
        {filteredItems?.length != 0 ? (
          filteredItems?.map((item) => {
            return (
              <ConversationBox
                key={item.conversationId}
                conversation={item}
                {...(!item.isGroup && {
                  isOnline: onlineUsers.includes(item.otherUser?.userId as string)
                })}
              />
            );
          })
        ) : (
          <p className="flex justify-center items-center text-xs my-4">No chats found</p>
        )}
      </div>
    </aside>
  );
};

export default ConversationList;
