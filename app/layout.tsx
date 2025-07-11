import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Code Style CV Generator',
  description: 'Generate developer-style CVs with preview and PDF export',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-mono">{children}</body>
    </html>
  )
} 