/**
 * ThemeProvider - Dark/Light mode toggle for PulseMetrics
 * 
 * Uses next-themes for persistent theme switching with smooth transitions.
 */
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  )
}
