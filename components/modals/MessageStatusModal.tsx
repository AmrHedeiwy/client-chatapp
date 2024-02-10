import * as React from 'react';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useModal } from '@/hooks/useModal';
import UserAvatar from '../Avatar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function MessageStatusModal() {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === 'messageStatus';

  const { messageStatus } = data;

  if (true) {
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
            {messageStatus?.status.map((statusUser) => {
              const { user, deliverAt, seenAt } = statusUser;
              return (
                <div className="flex gap-x-2 items-start p-4">
                  {messageStatus?.isGroup && <UserAvatar imageUrl={user.image} />}
                  <div className="flex flex-col gap-y-1">
                    {messageStatus?.isGroup && (
                      <p className="font-semibold text-sm">{user.username}</p>
                    )}

                    <p className="text-sm text-zinc-600 dark:text-zinc-300">
                      {deliverAt &&
                        !seenAt &&
                        'Delivered at ' +
                          format(new Date(statusUser.deliverAt), 'dd MMMM pp')}

                      {seenAt &&
                        'Seen at ' + format(new Date(statusUser.seenAt), 'dd MMMM pp')}

                      {!deliverAt && !seenAt && 'pending...'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}
