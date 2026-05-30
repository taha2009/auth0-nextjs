import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Auth0 + Next.js',
  description: 'Auth0 authentication reference implementation for Next.js 15',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
