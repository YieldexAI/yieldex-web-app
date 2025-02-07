import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { WagmiProviderWrapper } from '@/providers/wagmi-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Yieldex - Stable Yield, Simplified',
  description: 'Automatically optimize your stablecoin holdings across DeFi protocols',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <WagmiProviderWrapper>{children}</WagmiProviderWrapper>
      </body>
    </html>
  );
}