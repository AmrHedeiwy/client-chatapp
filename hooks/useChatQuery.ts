import { useInfiniteQuery } from '@tanstack/react-query';
import { useSocket } from './useSocket';

type ChatQueryProps = {
  queryKey: string;
  joinedAt: string | null;
};

export const useChatQuery = ({ queryKey, joinedAt }: ChatQueryProps) => {
  const { socket } = useSocket();

  const fetchMessages = async ({ pageParam }: { pageParam: number }) => {
    const url: string = `http://localhost:5000/conversations/messages?conversationId=${queryKey}&page=${pageParam}&joinedAt=${joinedAt}`;
    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };

    const res = await fetch(url, config);
    const data = await res.json();

    return data;
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ['messages', queryKey],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => lastPage?.nextPage,
      refetchInterval: !!socket && socket.connected ? false : 1000,
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
