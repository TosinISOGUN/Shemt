import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  AreaChart,
  Area,
  Cell
} from 'recharts'
import { 
  Download, 
  ArrowUpRight, 
  ArrowDownRight, 
  Users, 
  DollarSign, 
  Activity, 
  Zap, 
  Plus,
  Filter,
  Calendar,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  UserPlus,
  ShieldCheck,
  MousePointer2,
  Clock,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { analyticsService } from '@/services/analyticsService'
import { Skeleton } from '@/components/ui/skeleton'

// --- Types ---
interface KpiData {
  value: number | string;
  change: number;
  sparkline: number[];
}

interface AnalyticsData {
  revenue: KpiData;
  activeUsers: KpiData;
  conversionRate: KpiData;
  events: KpiData;
}

// --- Components ---

const Sparkline = ({ data, color = 'hsl(var(--primary))' }: { data: number[]; color?: string }) => (
  <div className="h-12 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v, i) => ({ value: v, id: i }))}>
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2} 
          dot={false} 
          isAnimationActive={true}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

const KpiCard = ({ title, data, icon: Icon, prefix = '', suffix = '', loading = false }: any) => {
  if (loading) return <Skeleton className="h-32 w-full rounded-xl" />;
  
  const isPositive = data.change >= 0;
  
  return (
    <Card className="border-border/40 bg-card/10 backdrop-blur-sm overflow-hidden group hover:border-primary/20 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 rounded-lg bg-primary/5 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <Sparkline 
            data={data.sparkline} 
            color={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} 
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-black tracking-tight font-mono">
              {prefix}{typeof data.value === 'number' ? data.value.toLocaleString() : data.value}{suffix}
            </h3>
            <div className={cn(
              "flex items-center text-[10px] font-bold mb-1 px-1.5 py-0.5 rounded-full",
              isPositive ? "text-emerald-500 bg-emerald-500/10" : "text-destructive bg-destructive/10"
            )}>
              {isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
              {Math.abs(data.change)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
}

export function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [userGrowth, setUserGrowth] = useState<any[]>([])
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [dateRange, setDateRange] = useState('7d')
  const [segment, setSegment] = useState('all')
  const [eventCluster, setEventCluster] = useState('all')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // In a real app, segment and eventCluster would be passed to these service calls
        const [m, rt, ug, fd, ins, act] = await Promise.all([
          analyticsService.getDashboardMetrics(),
          analyticsService.getRevenueTrend(),
          analyticsService.getUserGrowth(),
          analyticsService.getConversionFunnel(),
          analyticsService.getAiInsights(),
          analyticsService.getRecentActivity()
        ])
        setMetrics(m)
        setRevenueTrend(rt)
        setUserGrowth(ug)
        setFunnelData(fd)
        setInsights(ins)
        setActivity(act)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [dateRange, segment, eventCluster])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 pb-20 max-w-[1600px] mx-auto"
    >
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">Analytics</h1>
          <p className="text-muted-foreground font-medium">Insights and growth metrics for Shemt</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-muted/40 p-1 rounded-lg border border-border/40">
            <Button 
              variant={dateRange === '7d' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setDateRange('7d')}
              className="text-xs h-8 px-3 rounded-md"
            >7D</Button>
            <Button 
              variant={dateRange === '30d' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setDateRange('30d')}
              className="text-xs h-8 px-3 rounded-md"
            >30D</Button>
            <Button 
              variant={dateRange === 'custom' ? 'secondary' : 'ghost'} 
              size="sm" 
              onClick={() => setDateRange('custom')}
              className="text-xs h-8 px-3 rounded-md gap-2"
            >
              <Calendar className="h-3.5 w-3.5" />
              Custom
            </Button>
          </div>
          
          <Button variant="outline" className="gap-2 h-10 border-border/60 hover:bg-muted/50">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </Button>
          <Button className="h-10 gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
            Download Report
          </Button>
        </div>
      </div>

      {/* 2. KPI Cards Row - (12-column grid, 4 items) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Revenue" data={metrics?.revenue} icon={DollarSign} prefix="$" loading={loading} />
        <KpiCard title="Active Users" data={metrics?.activeUsers} icon={Users} loading={loading} />
        <KpiCard title="Conv. Rate" data={metrics?.conversionRate} icon={Target} suffix="%" loading={loading} />
        <KpiCard title="Total Events" data={metrics?.events} icon={Activity} loading={loading} />
      </div>

      {/* Main Content Area - 12-column Grid */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* 3. Main Charts Section (8/12 Columns) */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
          
          {/* Revenue Trend Line Chart */}
          <Card className="border-border/40 bg-card/10 backdrop-blur-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between py-6">
              <div>
                <CardTitle className="text-xl font-bold">Revenue Trend</CardTitle>
                <CardDescription>Synthesized daily revenue performance</CardDescription>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-500">+12% vs last week</span>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="h-[400px] pb-8">
              {loading ? (
                <Skeleton className="h-full w-full rounded-lg" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                      tickFormatter={(val) => `$${val/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)'
                      }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3} 
                      fill="url(#revenueGradient)"
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Sub Row: User Growth & Funnel (Equal Spacing inside the 8 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Growth Bar Chart */}
            <Card className="border-border/40 bg-card/10 backdrop-blur-sm">
              <CardHeader className="py-5">
                <CardTitle className="text-lg">User Growth</CardTitle>
                <CardDescription>Daily active registrations</CardDescription>
              </CardHeader>
              <CardContent className="h-[250px] pb-6">
                {loading ? <Skeleton className="h-full w-full rounded-lg" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: '2-digit' })}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 9}}
                      />
                      <YAxis hide />
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Bar 
                        dataKey="users" 
                        fill="hsl(var(--primary))" 
                        radius={[4, 4, 0, 0]} 
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card className="border-border/40 bg-card/10 backdrop-blur-sm">
              <CardHeader className="py-5">
                <CardTitle className="text-lg">Conversion Funnel</CardTitle>
                <CardDescription>User journey drop-off rates</CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                 {loading ? <div className="space-y-4"><Skeleton className="h-8 w-full"/><Skeleton className="h-8 w-full"/><Skeleton className="h-8 w-full"/></div> : (
                   <div className="space-y-4">
                     {funnelData.map((step, idx) => (
                       <div key={step.step} className="group">
                         <div className="flex justify-between text-xs mb-1.5 px-0.5">
                           <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">{step.step}</span>
                           <span className="font-mono text-foreground/80">{step.count.toLocaleString()} <span className="text-primary/40">|</span> {step.percentage}%</span>
                         </div>
                         <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${step.percentage}%` }}
                             transition={{ duration: 1.2, delay: idx * 0.1, ease: "easeOut" }}
                             className={cn(
                               "h-full transition-all duration-500",
                               idx === 0 ? "bg-primary" : 
                               idx === 1 ? "bg-primary/80" :
                               idx === 2 ? "bg-primary/60" : "bg-primary/40"
                             )}
                           />
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- Right Sidebar (4/12 Columns) --- */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          
          {/* 4. AI Insights Panel */}
          <Card className="border-primary/20 bg-primary/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <Zap className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                AI Insights
              </CardTitle>
              <CardDescription className="text-primary/60 font-medium">Neural synthesis of performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <p className="text-[10px] text-primary/40 italic">Analyzing data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                   <ul className="space-y-4">
                     {insights.map((insight, i) => (
                       <motion.li 
                         key={i} 
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         transition={{ delay: 0.1 * i }}
                         className="flex gap-3 items-start"
                       >
                         <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                         <span className="text-sm leading-relaxed text-foreground/80 font-medium">{insight}</span>
                       </motion.li>
                     ))}
                   </ul>
                   <Button variant="outline" size="sm" className="w-full bg-transparent border-primary/10 hover:bg-primary/10 text-primary text-xs h-9">
                     View All AI Insights
                   </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5. Drill-Down Filters */}
          <Card className="border-border/40 bg-card/10">
            <CardHeader className="py-4 border-b border-border/20">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" />
                Drill-down Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">Dimension</label>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger className="bg-muted/20 border-border/20 h-9 rounded-md text-xs">
                    <SelectValue placeholder="Select segment" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/40">
                    <SelectItem value="all">Global (All Segments)</SelectItem>
                    <SelectItem value="na">North America</SelectItem>
                    <SelectItem value="eu">European Union</SelectItem>
                    <SelectItem value="asia">APAC Regions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">Event Cluster</label>
                <Select value={eventCluster} onValueChange={setEventCluster}>
                  <SelectTrigger className="bg-muted/20 border-border/20 h-9 rounded-md text-xs">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/40">
                    <SelectItem value="all">All Product Events</SelectItem>
                    <SelectItem value="revenue">Conversion Events</SelectItem>
                    <SelectItem value="ui">UI Interactions</SelectItem>
                    <SelectItem value="auth">Auth & Sessions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* 6. Key Highlights Section */}
          <Card className="border-border/40 bg-card/10">
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Performance Highlights
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               <div className="grid grid-cols-1 divide-y divide-border/10">
                  <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                     <span className="text-xs text-muted-foreground">Highest revenue day</span>
                     <span className="text-xs font-bold text-foreground">Mar 16, 2024</span>
                  </div>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                     <span className="text-xs text-muted-foreground">Lowest conversion day</span>
                     <span className="text-xs font-bold text-foreground">Mar 12, 2024</span>
                  </div>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                     <span className="text-xs text-muted-foreground">Peak activity time</span>
                     <span className="text-xs font-bold text-foreground">11:00 AM — 2:00 PM</span>
                  </div>
               </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  )
}
