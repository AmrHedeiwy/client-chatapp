'use client';

import useConversationParams from '@/app/hooks/useConversationParams';
import { Conversation } from '@/app/types';
import clsx from 'clsx';
import React, {
  ChangeEvent,
  ElementRef,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import ConversationBox from './ConversationBox';
import SearchBarInput from '@/app/components/inputs/SeachBarInput';
import useListScroll from '@/app/hooks/useListScroll';
import { useSession } from '@/app/hooks/useSession';
import { useSocket } from '@/app/hooks/useSocket';
import { useMain } from '@/app/hooks/useMain';

const ConversationList = () => {
  const { session } = useSession();
  const { onlineUsers } = useSocket();
  const { isOpen } = useConversationParams();
  const { conversations } = useMain();

  const topRef = useRef<ElementRef<'div'>>(null);

  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationsArray = useMemo(() => {
    if (!!conversations) {
      const array = Object.values(conversations);
      return array;
    }
    return null;
  }, [conversations]);

  const [filteredItems, setFilteredItems] = useState<Conversation[] | null>(
    conversationsArray
  );

  useEffect(() => {
    if (search.length > 0) {
      setFilteredItems(() => {
        return (
          conversationsArray?.filter((conversation) => {
            const conversationName = (
              conversation.name ??
              conversation.users.filter((user) => user.userId != session?.userId)[0]
                .username
            ).toLowerCase();

            return conversationName.startsWith(search.toLowerCase());
          }) ?? null
        );
      });
      return;
    }
    if (conversationsArray) setFilteredItems(conversationsArray);
  }, [conversationsArray, search]);

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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Seacrh here..."
          />
        </div>
      </div>

      <div ref={topRef} className="overflow-y-auto scrollable-content px-2">
        {filteredItems && filteredItems.length !== 0 ? (
          filteredItems.map((item) => {
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
