import { useEffect } from 'react'
import { useLocation } from '@tanstack/react-router'

/**
 * ScrollToTop - A helper component that forces the window to scroll to the top
 * whenever the route changes. This is a robust fallback when global scroll
 * restoration behaviors are inconsistent.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Disable browser's automatic scroll restoration to ensure our logic prevails
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Reset scroll immediately and after a short paint cycle
    const resetScroll = () => {
      window.scrollTo(0, 0)
      document.documentElement.scrollTo(0, 0)
      document.body.scrollTo(0, 0)
    }

    resetScroll()
    
    // Also do it with a micro-task delay to be safe
    const timeout = setTimeout(resetScroll, 0)
    const timeoutLong = setTimeout(resetScroll, 100) // Fallback for slower content paints

    return () => {
      clearTimeout(timeout)
      clearTimeout(timeoutLong)
    }
  }, [pathname])

  return null
}
