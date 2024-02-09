'use client';

import { Conversation, Message } from '@/types';
import { useChatQuery } from '@/hooks/useChatQuery';
import React, { ElementRef, Fragment, useEffect, useRef, useState } from 'react';
import { ServerCrash, Loader2 } from 'lucide-react';
import { ChatWelcome } from './HelloChat';
import { useChatScroll } from '@/hooks/useChatScroll';
import MessageItem from './MessageItem';

type BodyProps = {
  conversation: Conversation;
};

const Body = ({ conversation }: BodyProps) => {
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('Component re-rendered');
  }, []);

  const {
    conversationId,
    adminIds,
    createdAt,
    hasInitialNextPage,
    image,
    isGroup,
    lastMessageAt,
    members,
    name,
    unseenMessagesCount,
    otherMember,
    otherMembers
  } = conversation;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useChatQuery({
    queryKey: conversationId
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
      {(!hasInitialNextPage || !hasNextPage) && <div className="flex-1" />}
      {(!hasInitialNextPage || !hasNextPage) && (
        <ChatWelcome isGroup={isGroup as boolean} name={name as string} />
      )}
      {hasInitialNextPage && hasNextPage && (
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
        {data.pages.map((group, i) => {
          let i_group = i.toString();
          return (
            <Fragment key={i_group}>
              {group &&
                group.items.map((message: Message, i: any) => {
                  let i_message = i.toString();
                  return (
                    <Fragment key={i_message}>
                      <MessageItem
                        id={message.messageId}
                        isAdmin={
                          isGroup
                            ? adminIds.includes(message.sender.userId as string)
                            : false
                        }
                        previousSenderId={
                          i !== group.items.length - 1
                            ? group.items[i + 1].sender.userId
                            : null
                        }
                        content={message.content}
                        fileUrl={message.fileUrl}
                        timestamp={message.sentAt}
                        sender={message.sender}
                        isGroup={isGroup}
                        isNotReceived={!!message.notReceived}
                        deliverCount={message.deliverCount || 0}
                        seenCount={message.seenCount || 0}
                        status={Object.values(message.status || {})}
                        message={message}
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
