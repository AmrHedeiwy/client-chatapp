'use client';

import useConversation from '@/app/hooks/useConversation';
import { Conversation, User } from '@/app/types';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, ElementRef, useRef, useState } from 'react';
import ConversationBox from './ConversationBox';
import SearchBarInput from '@/app/components/inputs/SeachBarInput';
import useScroll from '@/app/hooks/useScroll';
import { useSession } from '@/app/hooks/useSession';

interface ConversationListProps {
  intialItems: Conversation[] | null;
}

const ConversationList: React.FC<ConversationListProps> = ({ intialItems }) => {
  const router = useRouter();
  const session = useSession();

  const { conversationId, isOpen } = useConversation();

  const [items, setItems] = useState<Conversation[] | null>(intialItems);
  const [filteredItems, setFilteredItems] = useState<Conversation[] | null>(items);

  const topRef = useRef<ElementRef<'div'>>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    setFilteredItems(() => {
      return (
        items?.filter((conversation) => {
          const conversationName = (
            conversation.Name ??
            conversation.Users.filter((user) => user.UserID != session.user?.UserID)[0]
              .Username
          ).toLowerCase();

          return conversationName.startsWith(value.toLowerCase());
        }) ?? null
      );
    });
  };

  useScroll(topRef);

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
        {filteredItems?.map((item) => {
          return (
            <ConversationBox
              key={item.ConversationID}
              data={item}
              selected={conversationId === item.ConversationID}
            />
          );
        })}
      </div>
    </aside>
  );
};

export default ConversationList;
