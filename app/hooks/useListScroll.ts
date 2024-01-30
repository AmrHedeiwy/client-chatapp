import { InfiniteQueryObserverResult } from '@tanstack/react-query';
import { RefObject, useCallback, useEffect } from 'react';

interface fetchOnScrollProps {
  hasNextPage?: boolean;
  fetchNextPage: () => Promise<InfiniteQueryObserverResult<any, unknown>>;
  isFetchingNextPage: boolean;
}

const useListScroll = (
  topRef: RefObject<HTMLDivElement>,
  fetchOnScroll?: fetchOnScrollProps
) => {
  const calculateMaxScrollHeight = useCallback(() => {
    const windowHeight = window?.innerHeight;
    const screenWidth = window.innerWidth;
    const topRefOffset = topRef?.current?.offsetTop;

    if (!topRefOffset) return;

    const maxHeight = windowHeight - topRefOffset - (screenWidth < 1024 ? 50 : 0);

    topRef.current.style.maxHeight = `${maxHeight}px`;
  }, [topRef]);

  useEffect(() => calculateMaxScrollHeight(), [calculateMaxScrollHeight]);

  useEffect(() => {
    if (fetchOnScroll) {
      const topDiv = topRef?.current;

      const handleScroll = () => {
        const { fetchNextPage, isFetchingNextPage, hasNextPage } = fetchOnScroll;
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
    }

    window?.addEventListener('resize', calculateMaxScrollHeight);

    return () => {
      window?.removeEventListener('resize', calculateMaxScrollHeight);
    };
  }, [
    fetchOnScroll?.hasNextPage,
    fetchOnScroll?.fetchNextPage,
    fetchOnScroll?.isFetchingNextPage,
    topRef,
    calculateMaxScrollHeight,
    fetchOnScroll
  ]);
};

export default useListScroll;
