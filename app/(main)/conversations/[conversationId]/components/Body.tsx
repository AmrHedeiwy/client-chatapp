'use client';

import { Conversation, Message } from '@/types';
import { useChatQuery } from '@/hooks/useChatQuery';
import React, { ElementRef, Fragment, useEffect, useRef } from 'react';
import { ServerCrash, Loader2 } from 'lucide-react';
import { ChatWelcome } from './HelloChat';
import { useChatScroll } from '@/hooks/useChatScroll';
import MessageItem from './MessageItem';
import { useSession } from '@/hooks/useSession';

type BodyProps = {
  conversation: Conversation;
};

const Body = ({ conversation }: BodyProps) => {
  const { session } = useSession();
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
    queryKey: conversation.conversationId
  });

  useEffect(() => console.log(conversation), [conversation]);
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
        <Loader2 className="h-7 w-7 text-zinc-500 animate-spin my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Loading messages...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <ServerCrash className="h-7 w-7 text-zinc-500 my-4" />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Something went wrong!</p>
      </div>
    );
  }

  return (
    <div
      ref={chatRef}
      className="flex-1 flex flex-col py-4 overflow-y-auto overflow-x-hidden scrollable-content"
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
            <Loader2 className="h-6 w-6 text-zinc-500 animate-spin my-4" />
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
                    <MessageItem
                      id={message.messageId}
                      isAdmin={
                        conversation.isGroup
                          ? conversation.adminIds.includes(session?.userId as string)
                          : false
                      }
                      content={message.content}
                      fileUrl={message.fileUrl}
                      timestamp={message.sentAt}
                      sender={message.sender}
                      isGroup={conversation.isGroup}
                    />
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
