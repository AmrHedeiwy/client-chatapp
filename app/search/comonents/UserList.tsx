'use client';

import { User } from '@/app/types/User';
import React, { ChangeEvent, MouseEventHandler, useCallback, useState } from 'react';
import UserBox from './UserBox';
import SearchBarInput from '@/app/components/inputs/SeachBarInput';

interface UserListProps {
  recentUsers: User[] | null; // will be implemented later
}

export type Variant = 'SEARCH' | 'RIGHTARROW';

const UserList: React.FC<UserListProps> = ({ recentUsers }) => {
  const [users, setUsers] = useState<User[] | null>(null);
  const [filterdUsers, setFilteredUsers] = useState<User[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [variant, setVariant] = useState<Variant>('SEARCH');

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);

    const { value: query } = e.target;

    if (query.length === 1) {
      const url: string = `http://localhost:5000/user/search/${query}`;
      const config: RequestInit = {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      };

      const res = await fetch(url, config);
      const { users }: { users: User[] } = await res.json();

      setUsers(users);
      setFilteredUsers(users);
      return;
    }

    if (users) {
      const filteredUsers = users.filter((user) => {
        return user.Username.toLowerCase().startsWith(query);
      });

      console.log(filteredUsers);
      setFilteredUsers(filteredUsers as User[]);
    }
  };

  const onClick: MouseEventHandler<HTMLButtonElement> = async (e) => {
    const inputElement = document.getElementById('search');

    if (variant === 'SEARCH') {
      inputElement?.focus();
      setVariant('RIGHTARROW');
      return;
    }

    if (variant === 'RIGHTARROW') {
      inputElement?.blur();
      setVariant('SEARCH');
    }
  };

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
        overflow-y-auto
        border-r
        border-gray-200
        block
        w-full
        left-0
       "
    >
      <div className="px-5">
        <div className="flex-col">
          <div className="py-4">
            <h3
              className=" 
                text-lg 
                font-bold 
              text-neutral-600 
                pb-4
              "
            >
              Find new friends!
            </h3>
            <SearchBarInput
              id="search"
              type="text"
              variant={variant}
              onClick={onClick}
              onChange={onChange}
              placeholder="Seacrh here..."
            />
          </div>
        </div>
        {filterdUsers &&
          filterdUsers.map((item) => {
            return <UserBox key={item.UserID} data={item} />;
          })}
      </div>
    </aside>
  );
};

export default UserList;
