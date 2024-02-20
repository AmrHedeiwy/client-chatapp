import React, { Fragment } from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { useModal } from '@/hooks/useUI';
import Avatar from '../Avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const MessageStatusModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === 'messageStatus';

  const { messageStatus } = data;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="lg:max-w-[450px] h-fit ">
        <DialogHeader>
          <DialogTitle>Message info</DialogTitle>
        </DialogHeader>
        <div
          className={cn(
            'max-h-[300px]',
            messageStatus?.isGroup && 'overflow-y-scroll scrollable-content'
          )}
        >
          {messageStatus?.status.map((statusUser, i) => {
            const { profile, deliverAt, seenAt } = statusUser;
            return (
              <Fragment key={i}>
                <div className="flex gap-x-2 items-start p-4">
                  {messageStatus?.isGroup && <Avatar imageUrl={profile.image} />}
                  <div className="flex flex-col gap-y-1">
                    {messageStatus?.isGroup && (
                      <p className="font-semibold text-sm">{profile.username}</p>
                    )}

                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      {deliverAt &&
                        !seenAt &&
                        'Delivered at ' +
                          format(new Date(statusUser.deliverAt), 'dd MMM, p')}

                      {seenAt &&
                        'Seen at ' + format(new Date(statusUser.seenAt), 'dd MMMM, p')}

                      {!deliverAt && !seenAt && 'pending...'}
                    </p>
                  </div>
                </div>
              </Fragment>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageStatusModal;
