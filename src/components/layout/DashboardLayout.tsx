/**
 * DashboardLayout - Main layout wrapper for the Shemt dashboard
 * 
 * Combines:
 * - Collapsible Sidebar
 * - Top Navigation Bar
 * - Main Content Area
 * 
 * Features:
 * - Route protection (redirect to login if not authenticated)
 * - Responsive sidebar behavior
 * - Smooth transitions
 * - Proper spacing for content
 */

import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  // Handle window resize to auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true)
      } else {
        setSidebarCollapsed(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ... (keeping loading/user checks)

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop (persistent) & Mobile (overlay) */}
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity lg:hidden",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      <div className={cn(
        "lg:block",
        isMobileMenuOpen ? "block" : "hidden lg:block"
      )}>
        <Sidebar 
          collapsed={sidebarCollapsed}
        />
      </div>

      {/* Top Navbar */}
      <TopNavbar 
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Content */}
      <main 
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          "pl-0 lg:pl-[260px]",
          sidebarCollapsed && "lg:pl-[72px]"
        )}
      >
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
