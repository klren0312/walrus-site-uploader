import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { SuiProvider } from './provider/SuiProvider'
import { ThemeProviders } from './provider/ThemeProvider'
import React from 'react'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Walrus Site Uploader',
  description: 'A tool for uploading site to walrus',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ height: '100vh' }}
      >
        <ThemeProviders>
          <SuiProvider>{children}</SuiProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}
