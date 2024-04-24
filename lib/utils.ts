import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast as t } from 'react-toastify';
import { Metadata } from 'next';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toast = (
  type: 'success' | 'error' | 'info',
  message: string,
  time?: number
) => {
  t[type](message, {
    position: 'top-right',
    autoClose: time ?? 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    className: 'bg-white dark:bg-zinc-800 dark:text-white'
  });
};

export function constructMetadata({
  title = 'Orozo - chat in peace',
  description = 'Orozo is a user-friendly chat application designed for seamless communication and collaboration.',
  image = '/images/thumbnail.png',
  icons = '/images/favicon.ico',
  noIndex = false
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: 'Amr Hedeiwy'
    },
    icons,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL!),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false
      }
    })
  };
}
