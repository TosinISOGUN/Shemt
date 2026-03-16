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
import { Outlet, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TopNavbar } from './TopNavbar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Route protection - redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: '/login' })
    }
  }, [user, loading, navigate])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Top Navbar */}
      <TopNavbar 
        sidebarCollapsed={sidebarCollapsed}
        onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main 
        className={cn(
          "min-h-screen pt-16 transition-all duration-300",
          sidebarCollapsed ? "pl-[72px]" : "pl-[260px]"
        )}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
