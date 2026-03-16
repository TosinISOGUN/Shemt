/**
 * AnalyticsPage - Analytics and reporting page
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const pageViewsData = [
  { date: 'Mon', views: 2400, unique: 1200 },
  { date: 'Tue', views: 1398, unique: 900 },
  { date: 'Wed', views: 9800, unique: 4500 },
  { date: 'Thu', views: 3908, unique: 2100 },
  { date: 'Fri', views: 4800, unique: 2400 },
  { date: 'Sat', views: 3800, unique: 1900 },
  { date: 'Sun', views: 4300, unique: 2200 },
]

const trafficSources = [
  { name: 'Direct', value: 35, color: 'hsl(var(--primary))' },
  { name: 'Organic', value: 28, color: 'hsl(var(--accent))' },
  { name: 'Social', value: 20, color: 'hsl(220 50% 55%)' },
  { name: 'Referral', value: 17, color: 'hsl(280 65% 55%)' },
]

const browsers = [
  { browser: 'Chrome', share: 62 },
  { browser: 'Safari', share: 24 },
  { browser: 'Firefox', share: 8 },
  { browser: 'Edge', share: 4 },
  { browser: 'Other', share: 2 },
]

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your website traffic and user behavior.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Page Views Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Page Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pageViewsData}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="unique" 
                      stroke="hsl(var(--accent))"
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources & Browsers */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficSources}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {trafficSources.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  {trafficSources.map((source) => (
                    <div key={source.name} className="flex items-center gap-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: source.color }}
                      />
                      <span className="text-sm text-muted-foreground">{source.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Browser Share</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {browsers.map((browser) => (
                    <div key={browser.browser} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>{browser.browser}</span>
                        <span className="text-muted-foreground">{browser.share}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div 
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${browser.share}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="traffic">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Traffic analysis coming soon...
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Content analytics coming soon...
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
