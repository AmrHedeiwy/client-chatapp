'use client';

import { createContext, useEffect, useState } from 'react';
import { Socket, io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

type SocketContextType = {
  socket: Socket | null;
  onlineSockets: string[];
};

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

type SocketProviderProps = {
  children: React.ReactNode;
};

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const [onlineSockets, setOnlineSockets] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const socketInstance = new (io as any)(process.env.NEXT_PUBLIC_SERVER_URL!, {
      withCredentials: true
    });

    socketInstance.on('connected', (status: string, userIds: string[]) => {
      if (status) {
        setOnlineSockets((prev) => {
          return [...prev, ...userIds];
        });
      } else
        setOnlineSockets((prev) => {
          return prev.filter((userId) => !prev?.includes(userId));
        });
    });

    socketInstance.on('connect_error', (err: any) => {
      if (err.message === 'authentication_error') router.replace('/');
    });

    setSocket(socketInstance);

    // document.addEventListener('visibilitychange', handleVisibilityChange);
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        const timeOut = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            socketInstance.disconnect();
          }
          if (document.visibilityState === 'visible' && socketInstance.disconnected) {
            socketInstance.connect();
          }
          clearTimeout(timeOut);
        }, 1000 * 5);
      } else {
        if (!socketInstance.disconnected) {
          socketInstance.connect();
          router.refresh();
        }
      }
    }

    return () => {
      socketInstance.disconnect();
      // document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineSockets
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
