'use client';

import { Conversation, Message } from '@/app/types';
import { useChatQuery } from '@/app/hooks/useChatQuery';
import React, { ElementRef, Fragment, useEffect, useRef, useState } from 'react';
import { LuServerCrash, LuLoader2 } from 'react-icons/lu';
import { ChatWelcome } from './HelloChat';
import { useActiveConversationState } from '@/app/hooks/useActiveConversationState';
import { useChatScroll } from '@/app/hooks/useChatScroll';

const Body = () => {
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversation } = useActiveConversationState();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
    queryKey: (conversation as Conversation).conversationId
  });
  useChatScroll({
    chatRef,
    bottomRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
    count: data?.pages?.[0]?.items?.length ?? 0
  });

  if (status === 'pending') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <LuLoader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading messages...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <LuServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Something went wrong!</p>
      </div>
    );
  }

  return (
    <div
      ref={chatRef}
      className="flex-1 flex flex-col py-4 overflow-y-auto scrollable-content"
    >
      {(!conversation?.hasInitialNextPage || !hasNextPage) && <div className="flex-1" />}
      {(!conversation?.hasInitialNextPage || !hasNextPage) && (
        <ChatWelcome
          isGroup={conversation?.isGroup as boolean}
          name={conversation?.name as string}
        />
      )}
      {conversation?.hasInitialNextPage && hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <LuLoader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
          ) : (
            <button
              onClick={() => fetchNextPage()}
              className="text-gray-500 hover:text-gray-400 text-xs my-4  transition"
            >
              Load previous messages
            </button>
          )}
        </div>
      )}
      <div className="flex flex-col-reverse mt-auto">
        {data?.pages.map((group, i) => {
          let i_group = i.toString();

          return (
            <Fragment key={i_group}>
              {group?.items.map((message: Message, i: any) => {
                let i_message = i.toString();
                return (
                  <Fragment key={i_message}>
                    <div>{message.body}</div>
                  </Fragment>
                );
              })}
            </Fragment>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  );
};

export default Body;
