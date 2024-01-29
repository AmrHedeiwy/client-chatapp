import { useInfiniteQuery } from '@tanstack/react-query';
import { useSocket } from './useSocket';
import { useEffect } from 'react';

interface ChatQueryProps {
  queryKey: string;
}

export const useChatQuery = ({ queryKey }: ChatQueryProps) => {
  const { isConnected } = useSocket();

  const fetchMessages = async ({ pageParam }: { pageParam: number }) => {
    const url: string = `http://localhost:5000/conversations/messages?conversationId=${queryKey}&page=${pageParam}`;
    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };

    const res = await fetch(url, config);
    return res.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['messages', queryKey],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
      refetchInterval: isConnected ? false : 1000,
      enabled: false,
      initialPageParam: 20
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status
  };
};
