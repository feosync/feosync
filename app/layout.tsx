import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/hooks/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from '@/components/theme-provider'
import { LOGO } from '@/lib/constants'
import './globals.css'
import { roboto, montserrat } from '@/lib/fonts';
export const metadata: Metadata = {
  title: 'FeoSync - Social Media Automation',
  description: 'Automate your social media posting with AI-powered content generation and scheduling',
  generator: 'FeoSync',
  icons: {
    icon: [
      {
        url: LOGO.ICON_LIGHT,
        media: '(prefers-color-scheme: light)',
      },
      {
        url: LOGO.ICON_DARK,
        media: '(prefers-color-scheme: dark)',
      }
      
    ],
    apple: LOGO.ICON_LIGHT,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.variable} ${montserrat.variable}`}>
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
