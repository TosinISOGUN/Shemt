import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { 
  User as UserIcon, 
  Bell, 
  Lock, 
  Palette, 
  Globe,
  Save,
  Loader2,
  Camera,
  Shield,
  CreditCard,
  Mail,
  Smartphone,
  Check,
  Laptop
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'react-hot-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export function SettingsPage() {
  const { user, updateProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar_url: user?.avatar_url || ''
  })

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      const { error } = await updateProfile({ name: profileData.name })
      if (error) throw error
      toast.success('Profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your workspace preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-1 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all shrink-0",
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Dynamic Content Area */}
        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-2xl font-bold">Public Profile</h2>
                    <p className="text-sm text-muted-foreground">How others see you on the platform.</p>
                  </header>

                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
                    <CardContent className="p-8 space-y-8">
                      {/* Avatar Section */}
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                          <Avatar className="h-28 w-28 border-4 border-background shadow-2xl transition-transform group-hover:scale-105">
                            <AvatarImage src={profileData.avatar_url} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-black">
                              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <label className="absolute inset-0 flex items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all backdrop-blur-[2px]">
                            <Camera className="h-8 w-8" />
                            <input type="file" className="hidden" />
                          </label>
                        </div>
                        <div className="space-y-2 text-center sm:text-left">
                          <h3 className="text-xl font-bold font-serif">{displayName(user?.name)}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center sm:justify-start">
                            <Mail className="h-3.5 w-3.5" />
                            {user?.email}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" className="rounded-full h-8 px-4 text-xs">Update Photo</Button>
                            <Button variant="outline" size="sm" className="rounded-full h-8 px-4 text-xs text-destructive hover:bg-destructive/5 border-destructive/20">Remove</Button>
                          </div>
                        </div>
                      </div>

                      {/* Form */}
                      <div className="grid gap-6 md:grid-cols-2 pt-6 border-t border-border/50">
                        <div className="space-y-2">
                          <Label htmlFor="fullname" className="text-sm font-semibold">Display Name</Label>
                          <Input 
                            id="fullname" 
                            className="bg-muted/30 border-border/50 focus:bg-background transition-all rounded-lg"
                            placeholder="Your name"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="emailaddr" className="text-sm font-semibold">Contact Email</Label>
                          <Input 
                            id="emailaddr" 
                            className="bg-muted border-border/20 opacity-60 cursor-not-allowed rounded-lg"
                            value={user?.email || ''}
                            disabled
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="bio" className="text-sm font-semibold">Short Bio</Label>
                          <textarea 
                            id="bio"
                            className="w-full min-h-[100px] bg-muted/30 border border-border/50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background transition-all"
                            placeholder="A few words about yourself..."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button 
                          onClick={handleProfileSave}
                          disabled={loading}
                          className="px-8 rounded-full shadow-lg shadow-primary/25"
                        >
                          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-2xl font-bold">Security</h2>
                    <p className="text-sm text-muted-foreground">Manage your credentials and authentication.</p>
                  </header>
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold">Change Password</h3>
                        <div className="space-y-4 max-w-md">
                          <div className="space-y-2">
                            <Label>Current Password</Label>
                            <Input type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label>New Password</Label>
                            <Input type="password" />
                          </div>
                          <Button className="rounded-full">Update Password</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-2xl font-bold">Notifications</h2>
                    <p className="text-sm text-muted-foreground">Manage how you receive updates and alerts.</p>
                  </header>
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label className="text-base font-bold">Email Alerts</Label>
                            <p className="text-sm text-muted-foreground">Receive real-time alerts for critical events.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                          <div className="space-y-0.5">
                            <Label className="text-base font-bold">Weekly Digest</Label>
                            <p className="text-sm text-muted-foreground">Summarized report of your analytics every Monday.</p>
                          </div>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between border-t border-border/50 pt-4">
                          <div className="space-y-0.5">
                            <Label className="text-base font-bold">Product Updates</Label>
                            <p className="text-sm text-muted-foreground">Stay informed about new features and improvements.</p>
                          </div>
                          <Switch />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-2xl font-bold">Billing & Plan</h2>
                    <p className="text-sm text-muted-foreground">Manage your subscription and payment methods.</p>
                  </header>
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-2xl p-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-primary-foreground">Pro Plan</Badge>
                            <span className="text-sm text-muted-foreground font-medium">$29/month</span>
                          </div>
                          <p className="text-sm font-medium">Your next billing date is April 23, 2026.</p>
                        </div>
                        <Button variant="outline" className="rounded-full h-10 px-6 border-primary/30 text-primary hover:bg-primary/5">
                          Manage Subscription
                        </Button>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Invoices</h3>
                        <div className="border border-border/50 rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/30">
                                <th className="text-left p-3 font-semibold">Date</th>
                                <th className="text-left p-3 font-semibold">Amount</th>
                                <th className="text-left p-3 font-semibold">Status</th>
                                <th className="text-right p-3 font-semibold">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-t border-border/50">
                                <td className="p-3">Mar 23, 2026</td>
                                <td className="p-3 font-medium">$29.00</td>
                                <td className="p-3"><Badge variant="outline" className="text-[10px] uppercase bg-green-500/10 text-green-500 border-green-500/20">Paid</Badge></td>
                                <td className="p-3 text-right"><Button variant="ghost" size="sm" className="h-7 text-xs">Download</Button></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <header>
                    <h2 className="text-2xl font-bold">Appearance</h2>
                    <p className="text-sm text-muted-foreground">Customize your workspace look and feel.</p>
                  </header>
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-8 space-y-8">
                      <div className="space-y-4">
                        <Label className="text-base font-bold">Theme Mode</Label>
                        <div className="grid grid-cols-3 gap-4">
                          {[
                            { id: 'light', label: 'Light', icon: Globe },
                            { id: 'dark', label: 'Dark', icon: Lock },
                            { id: 'system', label: 'System', icon: Laptop }
                          ].map((theme) => (
                            <button
                              key={theme.id}
                              className={cn(
                                "flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all",
                                theme.id === 'dark' 
                                  ? "border-primary bg-primary/5" 
                                  : "border-border/50 hover:border-border"
                              )}
                            >
                              <div className={cn(
                                "h-12 w-12 rounded-full flex items-center justify-center",
                                theme.id === 'dark' ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                              )}>
                                <theme.icon className="h-6 w-6" />
                              </div>
                              <span className="text-sm font-semibold">{theme.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-border/50 pt-6">
                        <div className="space-y-0.5">
                          <Label className="text-base font-bold">Compact Mode</Label>
                          <p className="text-sm text-muted-foreground">Use a denser layout for the dashboard.</p>
                        </div>
                        <Switch />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

function displayName(name: string | undefined): string {
  if (!name) return 'Workspace User'
  return name
}
