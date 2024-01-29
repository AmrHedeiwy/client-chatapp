'use client';

import useConversationParams from '@/app/hooks/useConversationParams';
import { Conversation, Message } from '@/app/types';
import { useChatQuery } from '@/app/hooks/useChatQuery';
import React, { Fragment, useEffect, useRef, useState } from 'react';

const Body = () => {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { conversationId } = useConversationParams();
  const { data } = useChatQuery({
    queryKey: conversationId
  });

  return (
    <div className="flex flex-col-reverse flex-1 overflow-y-auto  ">
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
      <div className="pt-24" ref={bottomRef} />
    </div>
  );
};

export default Body;
