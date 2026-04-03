import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/hooks/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Toaster } from "@/components/ui/sonner"
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

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
      <body className="font-sans antialiased">
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
        <Analytics />
         <Toaster />
      </body>
    </html>
  )
}
