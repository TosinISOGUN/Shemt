import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Mail,
  Clock,
  Activity,
  MapPin,
  Laptop,
  Smartphone,
  ChevronRight,
  Eye,
  DollarSign,
  Zap,
  UserPlus,
  Shield,
  Loader2,
  Send,
  Copy,
  Check
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { analyticsService } from '@/services/analyticsService'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

// --- Custom Components ---

const UserKpiCard = ({ title, value, icon: Icon, loading }: any) => (
  <Card className="border-border/40 bg-card/10 backdrop-blur-sm group hover:border-primary/20 transition-all">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <p className="text-3xl font-black tracking-tight">{value}</p>
          )}
        </div>
        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
)

export function UsersPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [selectedProjectData, setSelectedProjectData] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Invite dialog state
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [inviting, setInviting] = useState(false)
  const [inviteCopied, setInviteCopied] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  // 1. Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.id) return
      const { data: projs } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      if (projs && projs.length > 0) {
        setProjects(projs)
        setSelectedProject(projs[0].id)
        setSelectedProjectData(projs[0])
      } else {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [user?.id])

  // 2. Fetch Users when project changes
  useEffect(() => {
    const loadUsers = async () => {
      if (!selectedProject) return
      setLoading(true)
      try {
        const data = await analyticsService.getUsersExplorer(selectedProject)
        setUsers(data)
      } catch (err) {
        setError("Failed to load users.")
      } finally {
        setLoading(false)
      }
    }
    loadUsers()
  }, [selectedProject])

  const filteredUsers = users.filter(u => 
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRevenue = users.reduce((sum, u) => sum + u.revenue, 0)
  const activeNowCount = users.filter(u => u.status === 'online').length

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviting(true)
    try {
      // For now, simulate invite (Supabase team table will be added in the next step)
      await new Promise(resolve => setTimeout(resolve, 1200))
      toast.success(`Invitation sent to ${inviteEmail}`)
      setInviteEmail('')
      setInviteRole('viewer')
      setShowInviteDialog(false)
    } catch (err) {
      toast.error('Failed to send invitation')
    } finally {
      setInviting(false)
    }
  }

  const inviteLink = selectedProjectData
    ? `${window.location.origin}/invite/${selectedProjectData.id}`
    : ''

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
            <h1 className="text-4xl font-black tracking-tight text-foreground">Users</h1>
            {projects.length > 0 && (
              <Select 
                value={selectedProject} 
                onValueChange={(val) => {
                  if (val) setSelectedProject(val)
                  setSelectedProjectData(projects.find(p => p.id === val) || null)
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
          <p className="text-muted-foreground font-medium">Explore and analyze individual user behavior</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-10 bg-card/50 border-border/40 font-bold gap-2"
            onClick={() => setShowInviteDialog(true)}
          >
            <UserPlus className="h-4 w-4" />
            Invite Admin
          </Button>
        </div>
      </div>

      {/* 2. Top Metric Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
        <UserKpiCard title="Total Unique Users" value={users.length} icon={Users} loading={loading} />
        <UserKpiCard title="Active Now" value={activeNowCount} icon={Activity} loading={loading} />
        <UserKpiCard title="Total Revenue" value={`$${(totalRevenue || 0).toLocaleString()}`} icon={DollarSign} loading={loading} />
        <UserKpiCard title="Avg. Loyalty" value={`${(users.length > 0 ? (users.reduce((s, u) => s + (u.eventCount || 0), 0) / users.length).toFixed(1) : '0.0')} ev/u`} icon={Zap} loading={loading} />
      </div>

      {/* 3. Users Table Explorer */}
      <Card className="border-border/40 bg-card/10 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-6 px-6">
          <div>
            <CardTitle className="text-xl font-bold">User Explorer</CardTitle>
            <CardDescription>Real-time list of identified tracking IDs</CardDescription>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by User ID or Location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted/20 border-border/40 focus:ring-primary/20"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30 border-y border-border/10">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-bold py-4 pl-6 text-[10px] uppercase tracking-widest">Identified User</TableHead>
                  <TableHead className="font-bold py-4 text-[10px] uppercase tracking-widest">Status</TableHead>
                  <TableHead className="font-bold py-4 text-[10px] uppercase tracking-widest">Last Activity</TableHead>
                  <TableHead className="font-bold py-4 text-[10px] uppercase tracking-widest text-center">Engagement</TableHead>
                  <TableHead className="font-bold py-4 text-[10px] uppercase tracking-widest text-right">Lifetime Value</TableHead>
                  <TableHead className="w-[80px] pr-6"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-border/5">
                      <TableCell colSpan={6} className="p-6"><Skeleton className="h-8 w-full" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={6} className="h-64 text-center">
                        <Users className="h-10 w-10 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">No users found for this project</p>
                     </TableCell>
                  </TableRow>
                ) : filteredUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="border-border/5 group hover:bg-primary/[0.02] cursor-pointer transition-colors"
                    onClick={() => setSelectedUser(user)}
                  >
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center font-bold text-xs ring-1 ring-border/20">
                            {user.id.substring(0, 2).toUpperCase()}
                         </div>
                         <div className="min-w-0">
                            <p className="font-bold truncate text-sm">{user.id}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                               <MapPin className="h-3 w-3" />
                               {user.location}
                               <span className="mx-1 opacity-20">•</span>
                               {user.device === 'Desktop' ? <Laptop className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                               {user.device}
                            </div>
                         </div>
                      </div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "h-2 w-2 rounded-full",
                            user.status === 'online' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
                          )} />
                          <span className={cn(
                            "text-xs font-bold capitalize",
                            user.status === 'online' ? "text-emerald-500" : "text-muted-foreground"
                          )}>{user.status}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium text-muted-foreground">
                       {formatDistanceToNow(new Date(user.lastSeen), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-center">
                       <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] py-0 px-2 h-5">
                          {user.eventCount} Events
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-sm">
                       ${user.revenue.toFixed(2)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                       <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* 4. User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border/40">
           <DialogHeader>
              <div className="flex items-center gap-4 mb-2">
                 <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                    {selectedUser?.id.substring(0, 2).toUpperCase()}
                 </div>
                 <div>
                    <DialogTitle className="text-2xl font-black">{selectedUser?.id}</DialogTitle>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                       <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {selectedUser?.location}</span>
                       <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Seen {selectedUser && formatDistanceToNow(new Date(selectedUser.lastSeen), { addSuffix: true })}</span>
                    </div>
                 </div>
              </div>
              <DialogDescription className="text-muted-foreground">Detailed activity timeline for this identified user session.</DialogDescription>
           </DialogHeader>

           <div className="space-y-6 mt-6">
              <div className="grid grid-cols-3 gap-4">
                 <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Lifetime Value</p>
                    <p className="text-lg font-black text-emerald-500">${selectedUser?.revenue.toFixed(2)}</p>
                 </div>
                 <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Total Signals</p>
                    <p className="text-lg font-black">{selectedUser?.eventCount}</p>
                 </div>
                 <div className="bg-muted/30 p-4 rounded-xl border border-border/10">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Primary Device</p>
                    <p className="text-lg font-black">{selectedUser?.device}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-sm font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Recent Activity Timeline
                 </h4>
                 <div className="space-y-0 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-border/50">
                    {selectedUser?.events.map((ev: any, i: number) => (
                       <div key={i} className="flex gap-4 items-start relative pb-6 last:pb-0">
                          <div className="h-9 w-9 rounded-full bg-card border border-border/50 flex items-center justify-center shrink-0 z-10 relative">
                             {ev.name === 'paid' ? <DollarSign className="h-4 w-4 text-emerald-500" /> :
                              ev.name === 'signup' ? <UserPlus className="h-4 w-4 text-primary" /> :
                              ev.name === 'activated' ? <Zap className="h-4 w-4 text-amber-500" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                          </div>
                          <div className="pt-1">
                             <p className="text-sm font-bold capitalize">{ev.name.replace('_', ' ')}</p>
                             <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(ev.at), { addSuffix: true })}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex justify-end gap-3 mt-8">
              <Button variant="outline" onClick={() => setSelectedUser(null)}>Close explorer</Button>
              <Button className="font-bold">Export User Data</Button>
           </div>
        </DialogContent>
      </Dialog>

      {/* 5. Invite Admin Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="max-w-lg bg-card border-border/40">
           <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                 <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <UserPlus className="h-6 w-6 text-primary" />
                 </div>
                 <div>
                    <DialogTitle className="text-xl font-black">Invite Team Member</DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs">
                       Invite someone to collaborate on <span className="font-bold text-foreground">{selectedProjectData?.name || 'your project'}</span>
                    </DialogDescription>
                 </div>
              </div>
           </DialogHeader>

           <div className="space-y-6 mt-4">
              {/* Email Input */}
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                 <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                       type="email"
                       placeholder="colleague@company.com"
                       value={inviteEmail}
                       onChange={(e) => setInviteEmail(e.target.value)}
                       className="pl-10 h-11 bg-muted/20 border-border/40"
                    />
                 </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-2">
                 <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Role</Label>
                 <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'admin', label: 'Admin', desc: 'Full access', icon: Shield },
                      { id: 'editor', label: 'Editor', desc: 'Can edit', icon: Users },
                      { id: 'viewer', label: 'Viewer', desc: 'Read only', icon: Eye },
                    ].map((role) => (
                       <button
                          key={role.id}
                          onClick={() => setInviteRole(role.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center",
                            inviteRole === role.id
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/30 hover:border-border/60 bg-muted/10"
                          )}
                       >
                          <role.icon className={cn("h-5 w-5", inviteRole === role.id ? "text-primary" : "text-muted-foreground")} />
                          <span className="text-xs font-bold">{role.label}</span>
                          <span className="text-[10px] text-muted-foreground">{role.desc}</span>
                       </button>
                    ))}
                 </div>
              </div>

              {/* Shareable Invite Link */}
              {selectedProjectData && (
                <div className="space-y-2">
                   <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Or share invite link</Label>
                   <div className="flex items-center gap-2">
                      <Input
                         readOnly
                         value={inviteLink}
                         className="h-10 bg-muted/30 border-border/20 text-xs font-mono text-muted-foreground"
                      />
                      <Button
                         variant="outline"
                         size="icon"
                         className="h-10 w-10 shrink-0 border-border/40"
                         onClick={() => {
                           navigator.clipboard.writeText(inviteLink)
                           setInviteCopied(true)
                           toast.success('Invite link copied!')
                           setTimeout(() => setInviteCopied(false), 2000)
                         }}
                      >
                         {inviteCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                   </div>
                </div>
              )}
           </div>

           <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border/20">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
              <Button 
                className="font-bold gap-2 min-w-[140px]" 
                onClick={handleInvite}
                disabled={!inviteEmail.trim() || inviting}
              >
                {inviting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                ) : (
                  <><Send className="h-4 w-4" /> Send Invitation</>
                )}
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
