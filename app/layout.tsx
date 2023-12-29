import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import AuthProvider from './provider/AuthProvider';

import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

// const inter = Inter({ subsets: ['greek'] });

// export const metadata: Metadata = {
//   title: 'Create Next App',
//   description: 'Generated by create next app'
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <ToastContainer />
        </AuthProvider>
      </body>
    </html>
  );
}
