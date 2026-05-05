import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: {
    template: '%s | TaskFlow',
    default: 'TaskFlow — Team Task Manager',
  },
  description: 'Modern team task management for productive teams',
  keywords: ['task manager', 'project management', 'team collaboration'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              classNames: {
                toast: 'font-sans',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
