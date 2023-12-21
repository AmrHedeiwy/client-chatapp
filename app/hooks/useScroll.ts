import { InfiniteQueryObserverResult } from '@tanstack/react-query';
import { RefObject, useEffect } from 'react';

interface fetchOnScrollProps {
  hasNextPage?: boolean;
  fetchNextPage: () => Promise<InfiniteQueryObserverResult<any, unknown>>;
  isFetchingNextPage: boolean;
}

const useScroll = (
  topRef: RefObject<HTMLDivElement>,
  fetchOnScroll?: fetchOnScrollProps
) => {
  const calculateMaxScrollHeight = () => {
    const windowHeight = window?.innerHeight;
    const screenWidth = window.innerWidth;
    const topRefOffset = topRef?.current?.offsetTop;

    if (!topRefOffset) return;

    const maxHeight = windowHeight - topRefOffset - (screenWidth < 1024 ? 50 : 0);

    topRef.current.style.maxHeight = `${maxHeight}px`;
  };

  useEffect(() => calculateMaxScrollHeight(), []);

  if (fetchOnScroll) {
    const { fetchNextPage, isFetchingNextPage, hasNextPage } = fetchOnScroll;

    useEffect(() => {
      const topDiv = topRef?.current;

      const handleScroll = () => {
        if (!topDiv) return;
        const distanceFromBottom =
          topDiv?.scrollHeight - topDiv?.scrollTop - topDiv?.clientHeight;

        if (distanceFromBottom === 0 && !isFetchingNextPage && hasNextPage) {
          fetchNextPage();
        }
      };

      topDiv?.addEventListener('scroll', handleScroll);
      window?.addEventListener('resize', calculateMaxScrollHeight);

      return () => {
        topDiv?.removeEventListener('scroll', handleScroll);
        window?.removeEventListener('resize', calculateMaxScrollHeight);
      };
    }, [hasNextPage, fetchNextPage, isFetchingNextPage, topRef]);
  } else {
    useEffect(() => {
      window?.addEventListener('resize', calculateMaxScrollHeight);
      return () => {
        window?.removeEventListener('resize', calculateMaxScrollHeight);
      };
    }, [topRef]);
  }
};

export default useScroll;
