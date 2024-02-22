'use client';

import { Profile } from '@/types/index';
import React, { ElementRef, Fragment, useRef } from 'react';
import UserBox from './UserBox';
import { InfiniteData, InfiniteQueryObserverResult } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import useListScroll from '@/hooks/useListScroll';
import { Button } from '@/components/ui/button';

interface SearchListProps {
  searchQuery: string;
  data: InfiniteData<any> | undefined;
  isFetching: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => Promise<InfiniteQueryObserverResult<any, unknown>>;
  isFetchingNextPage: boolean;
  isError: boolean;
}

const SearchList: React.FC<SearchListProps> = ({
  searchQuery,
  data,
  isFetching,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isError
}) => {
  const topRef = useRef<ElementRef<'div'>>(null);

  useListScroll(topRef, { fetchNextPage, isFetchingNextPage, hasNextPage });

  return (
    <div ref={topRef} className="overflow-y-auto scrollable-content px-2">
      {data?.pages.map((group, i) => {
        return (
          <Fragment key={i}>
            {!!group.items ? (
              (group.items as Profile[]).map((user, i) => {
                return (
                  <Fragment key={i}>
                    <UserBox data={user} />
                  </Fragment>
                );
              })
            ) : (
              <p className="flex justify-center items-center text-xs my-4">
                No users found
              </p>
            )}
          </Fragment>
        );
      })}

      {isFetching && !isFetchingNextPage && (
        <div className="flex flex-col flex-1 justify-center items-center">
          <span className="loading loading-ring loading-md my-2"></span>
          <p className="text-xs text-blue-400">Searching for {searchQuery}...</p>
        </div>
      )}

      {!!hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <span className="loading loading-ring loading-md my-4"></span>
          ) : (
            <Button variant={'link'} onClick={() => fetchNextPage()}>
              Load more
            </Button>
          )}
        </div>
      )}

      {isError && (
        <div className="flex flex-col flex-1 justify-center items-center">
          <ShieldAlert className="h-6 w-6 text-rose-400 my-4" />
          <p className="text-xs text-rose-400">Somthing went wrong!</p>
        </div>
      )}
    </div>
  );
};

export default SearchList;
