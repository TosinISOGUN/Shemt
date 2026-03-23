import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@tanstack/react-router'
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
import { Button, buttonVariants } from '@/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  Calendar as CalendarIcon,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  UserPlus,
  ShieldCheck,
  MousePointer2,
  Clock,
  Target,
  Code2,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react'
import { toast } from "sonner"
import { cn } from '@/lib/utils'
import { analyticsService } from '@/services/analyticsService'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

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

const CreateProjectDialog = ({ onCreated }: { onCreated: (project: any) => void }) => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!user?.id || !name.trim()) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, user_id: user.id })
        .select()
        .single()
      
      if (error) throw error
      if (data) {
        onCreated(data)
        setOpen(false)
        setName('')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          Add Project
        </Button>
      } />
      <DialogContent className="sm:max-w-[425px] bg-card border-border/40">
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
          <DialogDescription>
            Enter a name for your new analytics project.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="My Awesome App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-muted/20 border-border/20"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? 'Creating...' : 'Create Project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}



export function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedProjectData, setSelectedProjectData] = useState<any>(null)
  const [metrics, setMetrics] = useState<any>(null)
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [userGrowth, setUserGrowth] = useState<any[]>([])
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [insights, setInsights] = useState<string[]>([])
  const [activity, setActivity] = useState<any[]>([])
  const [highlights, setHighlights] = useState<any>(null)
  const [dateRange, setDateRange] = useState('30d')
  const [customRange, setCustomRange] = useState<DateRange | undefined>(undefined)
  const [showProjectId, setShowProjectId] = useState(false)
  const [copied, setCopied] = useState(false)
  const [segment, setSegment] = useState('all')
  const [eventCluster, setEventCluster] = useState('all')

  // 1. Fetch Projects for the user
  useEffect(() => {
    async function fetchProjects() {
      if (!user?.id) return
      
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data && data.length > 0) {
        setProjects(data)
        const active = data[0]
        setSelectedProject(active.id)
        setSelectedProjectData(active)
      } else {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [user?.id])

  // 2. Load Data for the selected project
  useEffect(() => {
    async function loadData() {
      if (!selectedProject) return
      
      setLoading(true)
      try {
        const options = { 
          dateRange, 
          segment, 
          eventCluster,
          startDate: (dateRange === 'custom' && customRange?.from && customRange?.to) ? customRange.from.toISOString() : undefined,
          endDate: (dateRange === 'custom' && customRange?.from && customRange?.to) ? customRange.to.toISOString() : undefined
        }
        const [m, rt, ug, fd, ins, act, hl] = await Promise.all([
          analyticsService.getDashboardMetrics(selectedProject, options),
          analyticsService.getRevenueTrend(selectedProject, options),
          analyticsService.getUserGrowth(selectedProject, options),
          analyticsService.getConversionFunnel(selectedProject, options),
          analyticsService.getAiInsights(),
          analyticsService.getRecentActivity(selectedProject),
          analyticsService.getAnalyticsHighlights(selectedProject, options)
        ])
        setMetrics(m)
        setRevenueTrend(rt)
        setUserGrowth(ug)
        setFunnelData(fd)
        setInsights(ins)
        setActivity(act)
        setHighlights(hl)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedProject, dateRange, segment, eventCluster, customRange])

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
           <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-foreground">Analytics</h1>
            {projects.length > 0 && (
              <Select 
                value={selectedProject || ''} 
                onValueChange={(val) => {
                  setSelectedProject(val)
                  setSelectedProjectData(projects.find(p => p.id === val))
                }}
              >
                <SelectTrigger className="w-[200px] h-9 bg-muted/40 border-border/40 font-bold">
                  <span className="truncate">{selectedProjectData?.name || 'Select Project'}</span>
                </SelectTrigger>
                <SelectContent className="bg-card border-border/40">
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                 </SelectContent>
               </Select>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-muted-foreground font-medium">Real-time performance metrics</p>
            {selectedProject && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/30 border border-border/20 group hover:border-primary/30 transition-all">
                <div className="flex items-center gap-1.5 pr-2 border-r border-border/20">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live</span>
                </div>
                
                <span className="text-[10px] font-mono text-muted-foreground min-w-[120px]">
                  {showProjectId ? selectedProject : `${selectedProject.substring(0, 8)}...••••`}
                </span>

                <div className="flex items-center gap-0.5 ml-auto opacity-60 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                    title={showProjectId ? "Hide ID" : "Show ID"}
                    onClick={() => setShowProjectId(!showProjectId)}
                  >
                    {showProjectId ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-primary/10 hover:text-primary"
                    title="Copy ID"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedProject)
                      setCopied(true)
                      toast.success("Project ID copied!")
                      setTimeout(() => setCopied(false), 2000)
                    }}
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {selectedProjectData && (
            <Link 
              to="/dashboard/setup/$projectId" 
              params={{ projectId: selectedProjectData.id }}
              className={cn(buttonVariants({ variant: "outline" }), "gap-2 h-10 border-border/60 hover:bg-muted/50")}
            >
              <Code2 className="h-4 w-4 text-primary" />
              <span>Tracking Setup</span>
            </Link>
          )}

          {projects.length > 0 && (
            <CreateProjectDialog onCreated={(p) => {
              setProjects([p, ...projects])
              setSelectedProject(p.id)
              setSelectedProjectData(p)
            }} />
          )}

          {projects.length === 0 && !loading && (
            <CreateProjectDialog onCreated={(p) => {
              setProjects([p])
              setSelectedProject(p.id)
              setSelectedProjectData(p)
            }} />
          )}

          {import.meta.env.DEV && projects.length > 0 && metrics?.events?.value === 0 && !loading && (
             <Button 
               variant="secondary" 
               className="gap-2 h-10 text-xs"
               onClick={async () => {
                 if (user?.id && selectedProject) {
                    await analyticsService.seedSampleData(user.id);
                    // Refresh data for current project
                    const m = await analyticsService.getDashboardMetrics(selectedProject);
                    setMetrics(m);
                 }
               }}
             >
               <Activity className="h-4 w-4" />
               Seed Test Data
             </Button>
          )}

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

            <Popover>
              <PopoverTrigger render={
                <Button 
                  variant={dateRange === 'custom' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setDateRange('custom')}
                  className="text-xs h-8 px-3 rounded-md gap-2"
                >
                  <CalendarIcon className="h-3.5 w-3.5" />
                  {dateRange === 'custom' && customRange?.from ? (
                    customRange.to ? (
                      <>
                        {format(customRange.from, "LLL dd")} -{" "}
                        {format(customRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(customRange.from, "LLL dd")
                    )
                  ) : (
                    "Custom"
                  )}
                </Button>
              } />
              <PopoverContent className="w-auto p-0 border-border/40 bg-card overflow-hidden shadow-2xl" align="end shadow-xl">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/20">
                  {/* Presets Sidebar */}
                  <div className="flex flex-col p-3 bg-muted/10 min-w-[160px] space-y-1">
                    <span className="text-[10px] font-bold text-muted-foreground px-2 pb-2 uppercase tracking-widest opacity-70">
                      Quick Select
                    </span>
                    {[
                      { label: 'Today', days: 0 },
                      { label: 'Yesterday', days: 1 },
                      { label: 'Last 7 Days', days: 7 },
                      { label: 'Last 14 Days', days: 14 },
                      { label: 'Last 30 Days', days: 30 },
                      { label: 'This Month', type: 'month' },
                      { label: 'Last Month', type: 'last-month' },
                    ].map((preset) => {
                      // Simple check for active preset (only for known days)
                      const isActive = preset.type === 'month' ? false : false // Simplified for now
                      
                      return (
                        <Button
                          key={preset.label}
                          variant={isActive ? "secondary" : "ghost"}
                          size="sm"
                          className={cn(
                            "justify-start text-xs h-9 font-medium px-2 rounded-md transition-all",
                            isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted/50"
                          )}
                          onClick={() => {
                            const to = new Date()
                            let from = new Date()
                            if (preset.type === 'month') {
                              from = new Date(to.getFullYear(), to.getMonth(), 1)
                            } else if (preset.type === 'last-month') {
                              from = new Date(to.getFullYear(), to.getMonth() - 1, 1)
                              to.setDate(0) // Last day of previous month
                            } else {
                              from.setDate(to.getDate() - (preset.days ?? 0))
                              if (preset.days === 1) to.setDate(to.getDate() - 1) // Yesterday range
                            }
                            setCustomRange({ from, to })
                          }}
                        >
                          {preset.label}
                        </Button>
                      )
                    })}
                  </div>

                  {/* Calendar View Container */}
                  <div className="flex flex-col">
                    <div className="p-3">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={customRange?.from}
                        selected={customRange}
                        onSelect={(range: any) => setCustomRange(range)}
                        numberOfMonths={1}
                        className="rounded-none border-none"
                      />
                    </div>
                    
                    {/* Footer Actions */}
                    <div className="flex items-center justify-between p-3 bg-muted/5 border-t border-border/20">
                       <div className="flex flex-col gap-0.5">
                         <span className="text-[10px] text-muted-foreground font-medium uppercase">Selected Range</span>
                         <span className="text-[11px] font-bold text-primary">
                           {customRange?.from ? (
                             customRange.to ? (
                               <>{format(customRange.from, "MMM dd")} - {format(customRange.to, "MMM dd, yyyy")}</>
                             ) : (
                               format(customRange.from, "MMM dd, yyyy")
                             )
                           ) : "Select dates"}
                         </span>
                       </div>
                       <div className="flex gap-2">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           className="text-xs h-8 h-8 px-3"
                           onClick={() => setDateRange('30d')} // Reset to 30d
                         >
                           Reset
                         </Button>
                         <Button 
                           size="sm" 
                           className="text-xs h-8 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                           onClick={() => {
                             // This already triggers effect via state change, but we could add a "close" trigger if needed
                             // For popover, re-clicking trigger usually closes, or we can use PopoverClose
                           }}
                         >
                           Apply
                         </Button>
                       </div>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          <Button 
            variant="outline" 
            className="gap-2 h-10 border-border/60 hover:bg-muted/50"
            onClick={() => analyticsService.exportToCsv(selectedProject || undefined)}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
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
                <Select value={segment} onValueChange={(val) => setSegment(val || 'all')}>
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
                <Select value={eventCluster} onValueChange={(val) => setEventCluster(val || 'all')}>
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
                     <span className="text-xs font-bold text-foreground">{highlights?.highestRevenueDay || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                     <span className="text-xs text-muted-foreground">Lowest conversion day</span>
                     <span className="text-xs font-bold text-foreground">{highlights?.lowestConversionDay || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/10 transition-colors">
                     <span className="text-xs text-muted-foreground">Peak activity time</span>
                     <span className="text-xs font-bold text-foreground">{highlights?.peakActivityTime || 'N/A'}</span>
                  </div>
               </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  )
}
