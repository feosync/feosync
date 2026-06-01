import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/hooks/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'
import { Roboto } from 'next/font/google';



const roboto = Roboto({
  weight: ['400', '500', '700'],
  subsets: ['latin'],
  variable: '--font-roboto', // Crée une variable CSS native
});
export const metadata: Metadata = {
  title: 'FeoSync - Social Media Automation',
  description: 'Automate your social media posting with AI-powered content generation and scheduling',
  generator: 'FeoSync',
  icons: {
    icon: [
      {
        url: '/images/light/feosync_icon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/images/dark/feosync_icon.png',
        media: '(prefers-color-scheme: dark)',
      }
      
    ],
    apple: '/images/light/feosync_icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable}` }>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
