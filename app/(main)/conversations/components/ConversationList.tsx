'use client';

import { ElementRef, useEffect, useMemo, useRef, useState } from 'react';

import { Conversation } from '@/types';

import SearchBarInput from '@/components/SeachBarInput';

import { useSocket } from '@/hooks/useSocket';
import useConversationParams from '@/hooks/useConversationParams';
import { useMain } from '@/hooks/useMain';
import { useModal } from '@/hooks/useUI';
import useListScroll from '@/hooks/useListScroll';

import { MessagesSquare } from 'lucide-react';

import ConversationBox from './ConversationBox';
import { cn } from '@/lib/utils';
import SettingsToggle from '@/components/SettingsToggle';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ConversationList = () => {
  const { onlineSockets } = useSocket();
  const { isOpen } = useConversationParams();
  const { conversations } = useMain();
  const { onOpen } = useModal();
  const router = useRouter();

  const topRef = useRef<ElementRef<'div'>>(null);

  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const conversationsArray = useMemo(() => {
    if (!conversations) return null;

    return Object.values(conversations);
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
              (conversation.isGroup
                ? conversation.name
                : conversation.otherMember?.profile.username) as string
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
      className={cn(
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
        <div className="flex justify-between items-center h-10 mb-2 mx-2">
          <div className="lg:hidden">
            <SettingsToggle />
          </div>
          <h2 className="flex gap-x-2 tracking-widest text-slate-900 dark:text-white text-xl">
            Chats
          </h2>
          <MessagesSquare
            onClick={() => onOpen('createGroupChat', { call: true })}
            className="cursor-pointer hover:text-zinc-600 dark:hover:text-zinc-300"
            size={24}
          />
        </div>

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
                  isOnline: onlineSockets.includes(item.otherMember?.userId as string)
                })}
              />
            );
          })
        ) : (
          <>
            {!conversationsArray || conversationsArray?.length === 0 ? (
              <p className="text-xs text-center italic font-semibold my-4">
                page Looks like you don&apos;t have any chats, start chatting with people{' '}
                <Link
                  href="/contacts"
                  className="text-blue-600 hover:text-blue-500 hover:underline"
                >
                  now
                </Link>
              </p>
            ) : (
              <p className="flex justify-center items-center text-xs my-4">
                No chats found
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
