'use client'

import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Auth0Provider } from "@auth0/auth0-react"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MigrateWatch - Marine Conservation Platform",
  description: "Track and analyze marine migration patterns and shipping conflicts",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className={inter.className}>
        <Auth0Provider
          domain="dev-hx0bz2nd2pwo40cx.us.auth0.com"
          clientId="alicfKiIyz9aFEq6uB3cPZTwfCC9yKwA"
          authorizationParams={{
            redirect_uri: typeof window !== 'undefined' ? window.location.origin : ''
          }}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            {children}
          </ThemeProvider>
        </Auth0Provider>
      </body>
    </html>
  )
}
