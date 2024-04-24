import './globals.css';
import 'react-toastify/dist/ReactToastify.css';

import AuthProvider from '../components/provider/AuthProvider';
import { ToastContainer } from 'react-toastify';
import ThemeProvider from '../components/provider/ThemeProvider';
import { cn, constructMetadata } from '@/lib/utils';

export const metadata = constructMetadata();

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <AuthProvider>
        <body className={cn('bg-white dark:bg-[#313338] font-sans font-medium')}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            storageKey="chatapp-theme"
          >
            {children}
            <ToastContainer />
          </ThemeProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
