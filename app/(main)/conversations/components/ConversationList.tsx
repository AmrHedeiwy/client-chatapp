'use client';

import useConversationParams from '@/app/hooks/useConversationParams';
import { Conversation } from '@/app/types';
import clsx from 'clsx';
import { ElementRef, useEffect, useMemo, useRef, useState } from 'react';
import ConversationBox from './ConversationBox';
import SearchBarInput from '@/components/inputs/SeachBarInput';
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
    <div
      className={clsx(
        `
        fixed
        inset-y-0
        pb-20
        lg:pb-0
        lg:left-20
        lg:w-80
        lg:block 
        dark:bg-[#2B2D31] 
        bg-[#F2F3F5]
      `,
        isOpen ? 'hidden' : 'block w-full left-0'
      )}
    >
      <div className="px-3 mt-4 mb-6">
        <h2 className="w-full text-slate-900 tracking-widest dark:text-white text-xl flex items-center h-10 mb-2">
          Chats
        </h2>
        <SearchBarInput
          inputRef={inputRef}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Seacrh here..."
        />
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
    </div>
  );
};

export default ConversationList;
