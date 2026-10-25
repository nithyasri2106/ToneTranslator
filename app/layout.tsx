import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ToneTranslator — Say it the way you mean it',
  description: 'Rewrite messages in the right tone without losing your meaning.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
