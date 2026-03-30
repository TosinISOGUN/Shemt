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
import { Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

export function DashboardPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Ensure page starts at top on load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Fetch user's first project to get the correct UUID for analytics
  const { data: projectData, isLoading: isLoadingProject } = useQuery({
    queryKey: ['user-project-id', user?.id],
    queryFn: async () => {
      // 1. Try to fetch existing project
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .limit(1)
        .maybeSingle()
      
      if (error) throw error
      if (data) return data

      // 2. If no project, create a default one for the user
      // This ensures new users always have a valid dashboard context
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          user_id: user?.id,
          name: 'My First App',
          public_api_key: `pk_${Math.random().toString(36).substring(2, 12)}`
        })
        .select('*')
        .single()
      
      if (createError) throw createError
      return newProject
    },
    enabled: !!user?.id,
  })

  const projectId = projectData?.id

  // Fetch metrics summary
  const { 
    data: metrics, 
    isLoading: isLoadingMetrics, 
    isError: isErrorMetrics,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['dashboard-metrics', projectId],
    queryFn: () => analyticsService.getDashboardMetrics(projectId || ''),
    enabled: !!projectId,
  })

  // Fetch revenue history
  const { 
    data: revenueHistory, 
    isLoading: isLoadingRevenue,
    refetch: refetchRevenue
  } = useQuery({
    queryKey: ['revenue-history', projectId],
    queryFn: () => analyticsService.getRevenueTrend(projectId || ''),
    enabled: !!projectId,
  })

  // Fetch user growth
  const { 
    data: userGrowth, 
    isLoading: isLoadingGrowth,
    refetch: refetchGrowth
  } = useQuery({
    queryKey: ['user-growth', projectId],
    queryFn: () => analyticsService.getUserGrowth(projectId || ''),
    enabled: !!projectId,
  })

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
      value: metrics?.revenue ? `$${metrics.revenue.value.toLocaleString()}` : '$0',
      change: metrics?.revenue ? `${metrics.revenue.change > 0 ? '+' : ''}${metrics.revenue.change}%` : '0%',
      trend: metrics?.revenue ? (metrics.revenue.change > 0 ? 'up' : metrics.revenue.change < 0 ? 'down' : 'neutral') : 'neutral',
      icon: DollarSign,
      description: 'From last month',
      loading: isLoadingMetrics
    },
    {
      title: 'Active Users',
      value: metrics?.activeUsers ? metrics.activeUsers.value.toLocaleString() : '0',
      change: metrics?.activeUsers ? `${metrics.activeUsers.change > 0 ? '+' : ''}${metrics.activeUsers.change}%` : '0%',
      trend: metrics?.activeUsers ? (metrics.activeUsers.change > 0 ? 'up' : metrics.activeUsers.change < 0 ? 'down' : 'neutral') : 'neutral',
      icon: UsersIcon,
      description: 'From last month',
      loading: isLoadingMetrics
    },
    {
      title: 'Conversion Rate',
      value: metrics?.conversionRate ? `${metrics.conversionRate.value}%` : '0%',
      change: metrics?.conversionRate ? `${metrics.conversionRate.change > 0 ? '+' : ''}${metrics.conversionRate.change}%` : '0%',
      trend: metrics?.conversionRate ? (metrics.conversionRate.change > 0 ? 'up' : metrics.conversionRate.change < 0 ? 'down' : 'neutral') : 'neutral',
      icon: TrendingUp,
      description: 'From last month',
      loading: isLoadingMetrics
    },
  ]

  const hasData = metrics && (metrics.revenue.value > 0 || metrics.activeUsers.value > 0)

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
          <Button
            size="sm"
            className="shadow-lg shadow-primary/20"
            onClick={() => analyticsService.exportToCsv()}
          >
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

      {/* Onboarding / Empty State - Show if NO data and NOT loading */}
      {!hasData && !isLoadingMetrics && !isLoadingProject ? (
        <div className="grid gap-8">
          <Card className="border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-none overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Sparkles className="h-32 w-32 rotate-12" />
            </div>
            <CardContent className="p-8 sm:p-12 relative z-10">
              <div className="max-w-2xl">
                <Badge className="mb-4 bg-primary/20 text-primary border-primary/20 hover:bg-primary/30 transition-colors">
                  Setup Required
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4 italic">Welcome to Shemt!</h2>
                <p className="text-muted-foreground text-lg font-medium leading-relaxed mb-8">
                  You're just minutes away from AI-powered insights. Follow these 3 steps to activate your workspace.
                </p>
                
                <div className="grid gap-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all group/step cursor-default">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary shrink-0 group-hover/step:bg-primary group-hover/step:text-primary-foreground transition-all">1</div>
                    <div>
                      <h4 className="font-bold mb-1 group-hover/step:text-primary transition-colors">Check your Project</h4>
                      <p className="text-sm text-muted-foreground font-medium">We've created a default project named "My App" to get you started.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <Link 
                    to="/dashboard/setup/$projectId" 
                    params={{ projectId: projectId || 'default' }}
                    className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all group/step"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary shrink-0 group-hover/step:bg-primary group-hover/step:text-primary-foreground transition-all">2</div>
                    <div className="flex-1">
                      <h4 className="font-bold mb-1 group-hover/step:text-primary transition-colors flex items-center justify-between">
                        Install Snippet
                        <ArrowUpRight className="h-4 w-4 opacity-0 group-hover/step:opacity-100 transition-all" />
                      </h4>
                      <p className="text-sm text-muted-foreground font-medium">Get your 3-line tracking script and paste it into your website.</p>
                    </div>
                  </Link>

                  {/* Step 3 */}
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/30 transition-all group/step cursor-default">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary shrink-0 group-hover/step:bg-primary group-hover/step:text-primary-foreground transition-all">3</div>
                    <div>
                      <h4 className="font-bold mb-1 group-hover/step:text-primary transition-colors">Verify Connection</h4>
                      <p className="text-sm text-muted-foreground font-medium">As soon as your site is live, shemt will begin analyzing trends automatically.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <Button onClick={handleRefresh} className="rounded-xl font-bold shadow-xl shadow-primary/20">
                    I've installed the script
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="transition-all hover:shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Revenue Overview
              </CardTitle>
              <CardDescription>Daily revenue from paid events</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRevenue ? (
                <Skeleton className="h-[300px] w-full" />
              ) : revenueHistory && revenueHistory.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueHistory}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
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
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          color: 'hsl(var(--foreground))'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Revenue']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <DollarSign className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No revenue data yet</p>
                  <p className="text-xs opacity-60 mt-1">Revenue will appear when "paid" events are tracked</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Users Chart */}
          <Card className="transition-all hover:shadow-lg border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="h-4 w-4 text-indigo-500" />
                User Growth
              </CardTitle>
              <CardDescription>New user signups over time</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingGrowth ? (
                <Skeleton className="h-[300px] w-full" />
              ) : userGrowth && userGrowth.length > 0 ? (
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
                        tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          color: 'hsl(var(--foreground))'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={(value: number) => [value, 'Signups']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })}
                      />
                      <Bar
                        dataKey="users"
                        name="Users"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                  <UsersIcon className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium">No signup data yet</p>
                  <p className="text-xs opacity-60 mt-1">Growth will appear when "signup" events are tracked</p>
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
        <AIInsights projectId={projectId} />
      </div>
    </div>
  )
}