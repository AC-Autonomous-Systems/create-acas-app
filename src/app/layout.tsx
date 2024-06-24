import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NextAuthProvider } from './session-provider';
import { ThemeProvider } from './theme-provider';
import { Toaster } from '@/components/ui/toaster';
import TopNav from '@/components/top-nav/top-nav';
import TenantContextProvider from './tenant-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Create ACAS App Template',
  description: 'Template for NextJS + Tailwind + Drizzle Monorepo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NextAuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <TenantContextProvider>
              <main className="flex h-screen w-screen flex-col">
                <TopNav />

                <Toaster />
                {children}
              </main>
            </TenantContextProvider>
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
