'use client';

import SearchBarInput from '@/app/components/inputs/SeachBarInput';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import UserList from './UserList';
import { useInfiniteQuery } from '@tanstack/react-query';

const ContactForm = () => {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchUsers = async ({ pageParam = 0, searchQuery = '' }) => {
    const url: string = `http://localhost:5000/contacts/search?search=${searchQuery}&page=${pageParam}`;
    const config: RequestInit = {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    };

    const res = await fetch(url, config);
    const data = await res.json();

    return data;
  };

  const { data, isFetching, fetchNextPage, hasNextPage, isFetchingNextPage, isError } =
    useInfiniteQuery({
      queryKey: ['search', inputRef.current?.value || ''],
      queryFn: ({ pageParam }) =>
        fetchUsers({ pageParam, searchQuery: inputRef.current?.value }),
      getNextPageParam: (lastPage) => lastPage.nextPage,
      enabled: search.length > 0,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
      initialPageParam: 0
    });

  return (
    <aside
      className="
        fixed
        inset-y-0
        pb-20
        lg:pb-0
        lg:left-20
        lg:w-80
        lg:block
        border-r
      border-gray-200
        block
        w-full
        left-0
      "
    >
      <div className="flex-col px-5">
        <div className="py-4">
          <h3 className="text-lg font-bold text-neutral-600 pb-4">Find new friends!</h3>
          <SearchBarInput
            inputRef={inputRef}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Seacrh here..."
          />
        </div>
      </div>

      <UserList
        searchQuery={inputRef.current?.value || ''}
        data={data}
        isFetching={isFetching}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        isError={isError}
      />
    </aside>
  );
};

export default ContactForm;
