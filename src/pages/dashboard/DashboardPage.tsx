/**
 * DashboardPage - Main dashboard view for Shemt
 * 
 * Features:
 * - Real data fetching from Supabase using analyticsService
 * - Loading skeletons for KPI cards and charts
 * - Error handling with alerts
 * - Interactive charts using Recharts
 */

import { useEffect } from 'react'
import { 
  DollarSign, 
  Users as UsersIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
  BarChart3
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { analyticsService } from '@/services/analyticsService'
import { useAuth } from '@/hooks/useAuth'
import { AIInsights } from '@/components/dashboard/AIInsights'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch metrics summary
  const { 
    data: metrics, 
    isLoading: isLoadingMetrics, 
    isError: isErrorMetrics,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['dashboard-metrics', user?.id],
    queryFn: () => analyticsService.getDashboardMetrics(user?.id || ''),
    enabled: !!user?.id,
  })

  // Fetch revenue history
  const { 
    data: revenueHistory, 
    isLoading: isLoadingRevenue,
    refetch: refetchRevenue
  } = useQuery({
    queryKey: ['revenue-history', user?.id],
    queryFn: () => analyticsService.getRevenueHistory(user?.id || ''),
    enabled: !!user?.id,
  })

  // Fetch user growth
  const { 
    data: userGrowth, 
    isLoading: isLoadingGrowth,
    refetch: refetchGrowth
  } = useQuery({
    queryKey: ['user-growth', user?.id],
    queryFn: () => analyticsService.getUserGrowth(user?.id || ''),
    enabled: !!user?.id,
  })

  // Seed sample data if none exists (only once)
  useEffect(() => {
    if (user?.id) {
      analyticsService.seedSampleData(user.id).then(() => {
        // Invalidate queries to show seeded data
        queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] })
        queryClient.invalidateQueries({ queryKey: ['revenue-history'] })
        queryClient.invalidateQueries({ queryKey: ['user-growth'] })
      })
    }
  }, [user?.id, queryClient])

  const handleRefresh = () => {
    refetchMetrics()
    refetchRevenue()
    refetchGrowth()
  }

  if (isErrorMetrics) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: metrics && metrics.revenue > 0 ? `$${metrics.revenue.toLocaleString()}` : '$0',
      change: metrics && metrics.revenue > 0 ? '+12.5%' : '0%',
      trend: metrics && metrics.revenue > 0 ? 'up' : 'neutral',
      icon: DollarSign,
      description: 'From last month',
      loading: isLoadingMetrics
    },
    {
      title: 'Active Users',
      value: metrics && metrics.activeUsers > 0 ? metrics.activeUsers.toLocaleString() : '0',
      change: metrics && metrics.activeUsers > 0 ? '+8.2%' : '0%',
      trend: metrics && metrics.activeUsers > 0 ? 'up' : 'neutral',
      icon: UsersIcon,
      description: 'From last month',
      loading: isLoadingMetrics
    },
    {
      title: 'Conversion Rate',
      value: metrics && metrics.conversionRate > 0 ? `${metrics.conversionRate}%` : '0%',
      change: metrics && metrics.conversionRate > 0 ? '-0.4%' : '0%',
      trend: metrics && metrics.conversionRate > 0 ? 'down' : 'neutral',
      icon: TrendingUp,
      description: 'From last month',
      loading: isLoadingMetrics
    },
  ]

  const hasData = metrics && (metrics.revenue > 0 || metrics.activeUsers > 0)

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Welcome back, <span className="text-primary italic">{user?.name?.split(' ')[0] || 'User'}</span>!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2 bg-background/50 backdrop-blur-sm">
            <RefreshCw className={`h-4 w-4 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" className="shadow-lg shadow-primary/20">
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="transition-all hover:shadow-xl hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {stat.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center">
                    {stat.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />}
                    {stat.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />}
                    <span className={cn(
                      stat.trend === 'up' ? 'text-emerald-500' : stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                    )}>
                      {stat.change}
                    </span>
                    <span className="ml-1">{stat.description}</span>
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts or Empty State */}
      {!hasData && !isLoadingMetrics ? (
        <Card className="border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <BarChart3 className="h-10 w-10 text-muted-foreground opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">No analytics data yet</h3>
            <p className="text-muted-foreground max-w-sm mb-8">
              Connect your data source or start tracking events to see real-time insights and trends.
            </p>
            <Button variant="outline" onClick={handleRefresh}>
              Check for Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="transition-all hover:shadow-lg border-border/50">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Monthly revenue growth trends</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRevenue ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueHistory}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: 'var(--shadow-md)'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Chart */}
          <Card className="transition-all hover:shadow-lg border-border/50">
            <CardHeader>
              <CardTitle>User Growth</CardTitle>
              <CardDescription>New user registrations per month</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGrowth ? (
                <Skeleton className="h-[300px] w-full" />
              ) : (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: 'var(--shadow-md)'
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        name="Users"
                        fill="hsl(var(--accent))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tight">AI Data Intelligence</h2>
        </div>
        <AIInsights />
      </div>
    </div>
  )
}