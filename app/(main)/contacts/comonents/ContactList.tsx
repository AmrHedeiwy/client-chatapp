'use client';

import React, { ElementRef, Fragment, useMemo, useRef } from 'react';
import UserBox from './UserBox';
import useListScroll from '@/hooks/useListScroll';
import { useMain } from '@/hooks/useMain';

const ContactList = () => {
  const topRef = useRef<ElementRef<'div'>>(null);
  const { contacts } = useMain();

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
