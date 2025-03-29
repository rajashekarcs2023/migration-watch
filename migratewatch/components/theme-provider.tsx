'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Force the dark theme to avoid hydration mismatch
  return <NextThemesProvider forcedTheme="dark" {...props}>{children}</NextThemesProvider>
}
