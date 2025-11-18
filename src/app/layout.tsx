import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Personal Life Log Orchestrator',
  description: 'Your second brain for life logging and personal knowledge management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <TRPCProvider>
          <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                      <h1 className="text-xl font-bold text-gray-900">Life Log Orchestrator</h1>
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      <a href="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        ホーム
                      </a>
                      <a href="/notes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        ノート
                      </a>
                      <a href="/daily-review" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        日次レビュー
                      </a>
                      <a href="/weekly-review" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                        週次レビュー
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
            <main>{children}</main>
          </div>
        </TRPCProvider>
      </body>
    </html>
  );
}
