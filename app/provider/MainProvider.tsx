'use client';

import React, { Dispatch, useReducer } from 'react';
import { createContext, useState } from 'react';
import { Conversation, GroupedConversations, User } from '../types';

type MainContextType = {
  userProfile: User;
  conversations: GroupedConversations;
  dispatchConversations: Dispatch<actionType>;
  //   contacts: Contact[] | null
};

type SocketProviderProps = {
  intialConversations: GroupedConversations;
  currentUserProfile: User;
  children: React.ReactNode;
};
export const MainContext = createContext<MainContextType | undefined>(undefined);

type actionType = {
  type: 'move' | 'add' | 'update' | 'remove';
  payload: any;
};

function reducer(conversations: GroupedConversations, action: actionType) {
  let conversation: Conversation;
  switch (action.type) {
    case 'add':
      conversation = action.payload.conversation;
      if (!conversations || !conversations[conversation.conversationId]) {
        return { [conversation.conversationId]: conversation, ...conversations };
      }
      return conversations;
    case 'move':
      conversation = action.payload.conversation;

      if (!conversations) return { [conversation.conversationId]: conversation };

      delete conversations[conversation.conversationId];
      return { [conversation.conversationId]: conversation, ...conversations };
    case 'update':
      break;
    case 'remove':
      break;
    default:
      return conversations;
  }
  return conversations || null;
}

const MainProvider = ({
  intialConversations,
  currentUserProfile,
  children
}: SocketProviderProps) => {
  const [userProfile, setUserProfile] = useState(currentUserProfile);
  const [conversations, dispatchConversations] = useReducer(reducer, intialConversations);

  return (
    <MainContext.Provider value={{ userProfile, conversations, dispatchConversations }}>
      {children}
    </MainContext.Provider>
  );
};

export default MainProvider;
