'use client';

import { User } from '@/app/types/index';
import React, { ElementRef, Fragment, useEffect, useRef, useState } from 'react';
import UserBox from './UserBox';
import { InfiniteData, InfiniteQueryObserverResult } from '@tanstack/react-query';
import { BsExclamationCircle } from 'react-icons/bs';
import useListScroll from '@/app/hooks/useListScroll';
import { Button } from '@/components/ui/button';

interface UserListProps {
  searchQuery: string;
  data: InfiniteData<any> | undefined;
  isFetching: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => Promise<InfiniteQueryObserverResult<any, unknown>>;
  isFetchingNextPage: boolean;
  isError: boolean;
}

const UserList: React.FC<UserListProps> = ({
  searchQuery,
  data,
  isFetching,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
  isError
}) => {
  const topRef = useRef<ElementRef<'div'>>(null);

  // Indicates which user box is selected
  const [activeIndex, setActiveIndex] = useState<string | null>(null);

  const onInput = (index: string) => {
    if (index === activeIndex) return setActiveIndex(null);
    setActiveIndex(index);
  };

  useEffect(() => setActiveIndex(null), [searchQuery]);

  useListScroll(topRef, { fetchNextPage, isFetchingNextPage, hasNextPage });

  return (
    <div ref={topRef} className="overflow-y-auto scrollable-content px-2">
      {data?.pages.map((group, i) => {
        let i_group = i.toString();
        return (
          <Fragment key={i_group}>
            {!!group?.items ? (
              (group.items as User[]).map((user, i) => {
                let i_user = i.toString();
                let uniqueIndex = i_group + i_user;
                return (
                  <Fragment key={i_user}>
                    <UserBox
                      index={uniqueIndex}
                      data={user}
                      isActive={uniqueIndex === activeIndex}
                      onInput={() => onInput(uniqueIndex)}
                    />
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
          <BsExclamationCircle className="h-6 w-6 text-rose-400 my-4" />
          <p className="text-xs text-rose-400">Somthing went wrong!</p>
        </div>
      )}
    </div>
  );
};

export default UserList;
