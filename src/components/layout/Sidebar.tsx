/**
 * Sidebar - Collapsible sidebar navigation for Shemt dashboard
 * 
 * Features:
 * - Smooth collapse animation with Framer Motion
 * - Active link highlighting
 * - Responsive behavior
 * - Icon + text navigation
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  CreditCard, 
  Settings,
  Activity,
  Globe,
  Terminal
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
  collapsed?: boolean
  onToggle?: () => void
}

const navItems = [
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  { 
    label: 'Analytics', 
    href: '/dashboard/analytics', 
    icon: BarChart3 
  },
  { 
    label: 'Billing', 
    href: '/dashboard/billing', 
    icon: CreditCard 
  },
  { 
    label: 'Users', 
    href: '/dashboard/users', 
    icon: Users 
  },
  { 
    label: 'Settings', 
    href: '/dashboard/settings', 
    icon: Settings 
  },
]

export function Sidebar({ collapsed = false }: SidebarProps) {
  const location = useLocation()
  const { user } = useAuth()
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    async function fetchProject() {
      if (!user) return
      const { data } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single()
      
      if (data) setProjectId(data.id)
    }
    fetchProject()
  }, [user])

  // Detect mobile view for label visibility
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isExpanded = isMobile || !collapsed || isHovered

  return (
    <motion.aside
      initial={false}
      onMouseEnter={() => !isMobile && collapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{ 
        width: isExpanded ? 260 : 72,
        x: 0 
      }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className={cn(
        "fixed left-0 top-0 h-screen z-[60] flex flex-col border-r bg-sidebar transition-transform lg:translate-x-0",
        isExpanded ? "shadow-2xl ring-1 ring-black/5" : "shadow-none",
        !collapsed ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo Section */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-semibold text-sidebar-foreground truncate"
              >
                Shemt
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              to={item.href}
              activeOptions={item.href === '/dashboard' ? { exact: true } : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group',
                'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                isActive 
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' 
                  : 'text-sidebar-foreground/70'
              )}
            >
              <item.icon className={cn('h-5 w-5 shrink-0 transition-colors', isActive ? 'text-primary' : 'group-hover:text-primary')} />
              <AnimatePresence>
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}

        {/* Dynamic Installation Link */}
        {projectId && (
          <Link
            to="/dashboard/setup/$projectId"
            params={{ projectId }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group',
              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
              location.pathname.includes('/setup/') ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm' : 'text-sidebar-foreground/70'
            )}
          >
            <Terminal className={cn('h-5 w-5 shrink-0 transition-colors', location.pathname.includes('/setup/') ? 'text-primary' : 'group-hover:text-primary')} />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  Installation
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        )}

        {/* View Site Link */}
        <div className="pt-4 mt-4 border-t border-sidebar-border">
          <Link
            to="/"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all group',
              'text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Globe className="h-5 w-5 shrink-0 transition-colors group-hover:text-primary" />
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  View Landing Page
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </nav>
    </motion.aside>
  )
}
