/**
 * TopNavbar - Top navigation bar for Shemt dashboard
 * 
 * Features:
 * - Search bar
 * - Notifications icon
 * - User profile avatar (from auth)
 * - Theme toggle (dark/light)
 * - Logout functionality
 */

import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { 
  Search, 
  Bell, 
  Moon, 
  Sun,
  Menu,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Loader2,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  CreditCard,
  Sparkles
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useTheme } from 'next-themes'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuGroup,
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { notificationService, AppNotification } from '@/services/notificationService'

interface TopNavbarProps {
  onMenuClick?: () => void
  sidebarCollapsed?: boolean
}

export function TopNavbar({ onMenuClick, sidebarCollapsed }: TopNavbarProps) {
  const { theme, setTheme } = useTheme()
  const { user, signOut, loading } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      const data = await notificationService.getNotifications(user.id)
      setNotifications(data)
      const unread = await notificationService.getUnreadCount(user.id)
      setUnreadCount(unread)
    }

    fetchNotifications()

    const channel = notificationService.subscribeToNotifications(user.id, () => {
      fetchNotifications()
    })

    return () => {
      notificationService.removeChannel(channel)
    }
  }, [user])

  const handleMarkAsRead = async (id: string, is_read: boolean) => {
    if (is_read) return
    await notificationService.markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }
  
  const handleMarkAllAsRead = async () => {
    if (!user) return
    await notificationService.markAllAsRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'error': return <XCircle className="h-4 w-4 text-destructive" />
      case 'billing': return <CreditCard className="h-4 w-4 text-purple-500" />
      case 'insight': return <Sparkles className="h-4 w-4 text-blue-500" />
      default: return <Bell className="h-4 w-4 text-primary" />
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    await signOut()
    navigate({ to: '/' })
  }

  // Get user initials for avatar
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Get display name
  const displayName = user?.name || 'User'
  const displayEmail = user?.email || ''

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
        "left-0 lg:left-[260px]",
        sidebarCollapsed && "lg:left-[72px]"
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 bg-muted/50 border-none focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger 
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
                >
                  <div className="relative flex items-center justify-center">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground border-2 border-background">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-80 p-0 border-border/50 shadow-xl overflow-hidden rounded-xl">
              <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                <span className="font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-primary" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <Bell className="h-8 w-8 opacity-20" />
                    No notifications yet.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={cn(
                          "p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3",
                          !n.is_read ? "bg-primary/5" : "opacity-70"
                        )}
                        onClick={() => handleMarkAsRead(n.id, n.is_read)}
                      >
                        <div className={cn("mt-0.5 p-1.5 rounded-full h-fit", !n.is_read ? "bg-background shadow-sm" : "")}>
                           {getNotificationIcon(n.type)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className={cn("text-sm", !n.is_read ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
                            {n.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider pt-1">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger 
              className={cn(
                "flex items-center gap-2 px-2 hover:bg-muted rounded-md h-9 text-sm font-medium transition-colors outline-none focus:bg-muted",
                (loading || isLoggingOut) && "opacity-50 pointer-events-none"
              )}
            >
              {(loading || isLoggingOut) ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium md:inline-block">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">{displayEmail}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate({ to: '/dashboard/settings' })}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ to: '/dashboard/settings' })}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault()
                  handleLogout()
                }}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isLoggingOut && typeof document !== 'undefined' && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/90 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 20 }}
            className="flex flex-col items-center gap-6"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-destructive/20 via-destructive to-destructive/20 blur-xl opacity-30"
              />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border border-border/50 shadow-xl">
                <ShieldCheck className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black italic tracking-tight">Securing your session...</h2>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Zap className="h-3 w-3 text-amber-500" />
                Signing out
              </p>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </header>
  )
}
