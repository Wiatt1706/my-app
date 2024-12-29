import Providers from '@/components/layout/providers';
import { Toaster as ToasterSonner } from '@/components/ui/sonner';
import { Toaster as DefaultToaster} from '@/components/ui/toaster';
import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import NextTopLoader from 'nextjs-toploader';
import './globals.css';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { fontMono, fontSans } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
	title: 'Next Shadcn',
	description: 'Basic dashboard with Next.js and Shadcn'
};

const lato = Lato({
	subsets: ['latin'],
	weight: ['400', '700', '900'],
	display: 'swap'
});

export default async function RootLayout({
	children
}: {
	children: React.ReactNode;
}) {
	const session = await getServerSession(authOptions)
	return (
    <html
      lang="en"
      className={`${lato.className}`}
      suppressHydrationWarning={true}
    >
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <NextTopLoader showSpinner={false} />
        <Providers session={session}>
          <ToasterSonner />
          <DefaultToaster />
          <NuqsAdapter>{children}</NuqsAdapter>
        </Providers>
      </body>
    </html>
  );
}
