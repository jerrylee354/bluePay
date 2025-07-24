
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { useAuth } from "@/context/auth-context"
import { useTheme } from "next-themes"

function ThemeSync() {
  const { userData } = useAuth()
  const { setTheme } = useTheme()

  React.useEffect(() => {
    if (userData?.theme) {
      setTheme(userData.theme)
    }
  }, [userData?.theme, setTheme])

  return null
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
      <ThemeSync />
    </NextThemesProvider>
  )
}
