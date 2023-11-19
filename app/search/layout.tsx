import React from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import getContacts from '../actions/getContacts';
import UserList from './comonents/UserList';

export default async function UsersLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sidebar>
      {/* <SearchForm /> */}
      <UserList recentUsers={null} />
      <div className="h-full">{children}</div>
    </Sidebar>
  );
}
