'use client';

import { Conversation, Message } from '@/types';
import { useChatQuery } from '@/hooks/useChatQuery';
import React, { ElementRef, Fragment, useRef } from 'react';
import { ServerCrash, Loader2 } from 'lucide-react';
import { Welcome } from './Welcome';
import { useChatScroll } from '@/hooks/useChatScroll';
import Item from './Item';
import { useMain } from '@/hooks/useMain';

type BodyProps = {
  conversation: Conversation;
};

const Body = ({ conversation }: BodyProps) => {
  const chatRef = useRef<ElementRef<'div'>>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useMain();

  const { conversationId, adminIds, hasInitialNextPage, isGroup, name } = conversation;

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
        <Welcome isGroup={isGroup as boolean} name={name as string} />
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
        {data &&
          data.pages.map((group, i) => {
            let i_group = i.toString();
            return (
              <Fragment key={i_group}>
                {group &&
                  group.items.map((message: Message, i: any) => {
                    let i_message = i.toString();

                    return (
                      <Fragment key={i_message}>
                        <Item
                          messageId={message.messageId}
                          conversationId={conversationId}
                          content={
                            !message.deletedAt
                              ? message.content
                              : 'This message was deleted'
                          }
                          fileUrl={!message.deletedAt ? message.fileUrl : null}
                          sentAt={message.sentAt}
                          sender={message.sender}
                          previousMessageSenderId={
                            i !== group.items.length - 1
                              ? group.items[i + 1].sender.userId
                              : null
                          }
                          isSenderAdmin={
                            isGroup
                              ? adminIds.includes(message.sender.userId as string)
                              : false
                          }
                          isCurrentUserAdmin={
                            isGroup
                              ? adminIds.includes(userProfile.userId as string)
                              : false
                          }
                          isOwn={userProfile.userId === message.sender.userId}
                          isGroup={isGroup}
                          isNotReceived={!!message.notReceived}
                          deliverCount={message.deliverCount || 0}
                          seenCount={message.seenCount || 0}
                          status={Object.values(message.status || {})}
                          updated={message.sentAt !== message.updatedAt}
                          deleted={!!message.deletedAt}
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
