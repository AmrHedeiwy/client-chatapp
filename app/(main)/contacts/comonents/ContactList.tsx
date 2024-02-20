'use client';

import { Profile } from '@/types/index';
import React, { ElementRef, Fragment, useEffect, useMemo, useRef, useState } from 'react';
import UserBox from './UserBox';
import { InfiniteData, InfiniteQueryObserverResult } from '@tanstack/react-query';
import { ShieldAlert } from 'lucide-react';
import useListScroll from '@/hooks/useListScroll';
import { Button } from '@/components/ui/button';
import { useMain } from '@/hooks/useMain';

const ContactList = () => {
  const topRef = useRef<ElementRef<'div'>>(null);
  const { contacts, dispatchContacts } = useMain();

  const contactsArray = useMemo(() => {
    if (!contacts) return null;
    return Object.values(contacts);
  }, [contacts]);

  useListScroll(topRef);

  return (
    <div ref={topRef} className="overflow-y-auto scrollable-content px-2">
      {!!contactsArray &&
        contactsArray.map((contact, i) => {
          return (
            <Fragment key={i}>
              <UserBox data={contact} />
            </Fragment>
          );
        })}
    </div>
  );
};

export default ContactList;
