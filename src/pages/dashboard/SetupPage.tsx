import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, Link, useNavigate } from '@tanstack/react-router'
import { Button, buttonVariants } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Check, 
  Copy, 
  Terminal, 
  Code2, 
  ExternalLink, 
  Loader2, 
  Sparkles,
  Shield,
  Zap,
  Globe,
  Monitor,
  ChevronLeft,
  ArrowRight,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export function SetupPage() {
  const { projectId } = useParams({ from: '/dashboard/setup/$projectId' })
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState('html')

  const ingestUrl = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/ingest`

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()
      
      if (data) setProject(data)
      setLoading(false)
    }
    fetchProject()
  }, [projectId])

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
    </div>
  )

  if (!project) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <p className="text-muted-foreground font-bold">Project not found.</p>
      <Button variant="outline" onClick={() => navigate({ to: '/dashboard/analytics' })}>
        Back to Analytics
      </Button>
    </div>
  )

  const snippets = {
    html: `<!-- Shemt Analytics -->
<script 
  async 
  src="${window.location.origin}/shemt-tracker.js"
  data-project-id="${project.id}"
  data-api-key="${project.public_api_key}"
  data-endpoint="${ingestUrl}"
></script>`,
    react: `// Add to your App.tsx / _app.tsx
import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Shemt Tracker Initialization
    const script = document.createElement('script')
    script.src = "${window.location.origin}/shemt-tracker.js"
    script.async = true
    script.setAttribute('data-project-id', '${project.id}')
    script.setAttribute('data-api-key', '${project.public_api_key}')
    script.setAttribute('data-endpoint', '${ingestUrl}')
    document.head.appendChild(script)
  }, [])

  return <div>Your App Content</div>
}`,
    manual: `// Track custom events manually
window.shemt.track('conversion_event', { 
  value: 49.99,
  currency: 'USD'
});`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* 1. Simplified Header */}
      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <Link 
            to="/dashboard/analytics"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-11 w-11 rounded-2xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all border border-border/10"
            )}
          >
            <ChevronLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-1 italic">
              Setup Guide
            </h1>
            <p className="text-muted-foreground font-medium">
              Connecting <span className="text-foreground font-bold">{project.name}</span>
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
           <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">Live Configuration</span>
        </div>
      </div>

      <div className="space-y-12">
        
        {/* 2. Focused Integration Section */}
        <section className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tighter italic">1. Install the Snippet</h3>
              <p className="text-sm text-muted-foreground font-medium max-w-md">
                Paste this code into the <code className="text-primary font-bold px-1.5 py-0.5 bg-primary/5 rounded">&lt;head&gt;</code> of your website to start tracking.
              </p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="p-1 bg-muted/40 rounded-xl border border-border/40 inline-flex">
              <TabsList className="bg-transparent h-9 border-none gap-1">
                <TabsTrigger value="html" className="font-bold gap-2 text-xs rounded-lg px-4 h-full">
                  <Globe className="h-3.5 w-3.5" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="react" className="font-bold gap-2 text-xs rounded-lg px-4 h-full">
                  <Monitor className="h-3.5 w-3.5" />
                  React
                </TabsTrigger>
                <TabsTrigger value="manual" className="font-bold gap-2 text-xs rounded-lg px-4 h-full">
                  <Terminal className="h-3.5 w-3.5" />
                  API
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between px-6 py-3 bg-stone-900/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-primary/60" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                    {activeTab === 'html' ? 'index.html' : activeTab === 'react' ? 'App.tsx' : 'Custom API'}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className={cn(
                    "gap-2 h-9 px-4 rounded-xl transition-all active:scale-95 font-bold text-xs",
                    copied 
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" 
                      : "bg-white/5 hover:bg-white/10 text-white/70"
                  )}
                  onClick={() => copyToClipboard(snippets[activeTab as keyof typeof snippets])}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Snippet
                    </>
                  )}
                </Button>
              </div>

              <pre className="p-10 rounded-[2rem] bg-stone-950 border border-white/5 text-[15px] leading-relaxed font-mono text-white/90 overflow-x-auto min-h-[300px] shadow-3xl">
                <code>{snippets[activeTab as keyof typeof snippets]}</code>
              </pre>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* 3. Connection Status Section */}
        <section className="space-y-6 pt-6">
           <h3 className="text-2xl font-black tracking-tighter italic">2. Connection Status</h3>
           <div className="p-10 rounded-[2.5rem] bg-card/10 border border-border/40 backdrop-blur-xl flex flex-col md:flex-row items-center gap-10 group transition-all">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20 scale-150" />
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-110 transition-transform duration-500">
                   <Zap className="h-12 w-12 text-primary fill-primary/20" />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left space-y-3">
                <p className="text-2xl font-black">Awaiting signals...</p>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-md">
                  We'll automatically detect your script once you refresh your website. This page will update in real-time.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                   <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                     <Monitor className="h-4 w-4 text-blue-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Desktop</span>
                   </div>
                   <div className="flex items-center gap-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all delay-75">
                     <Globe className="h-4 w-4 text-emerald-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest">Web</span>
                   </div>
                </div>
              </div>
              <div className="w-full md:w-auto flex flex-col gap-3">
                <a 
                  href="#" 
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-12 rounded-2xl border-border/60 font-bold hover:bg-muted/50"
                  )}
                >
                  View Docs
                </a>
                <Button className="h-12 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/20 px-8" onClick={() => navigate({ to: '/dashboard/analytics' })}>
                  Check Analytics
                </Button>
              </div>
           </div>
        </section>

      </div>
    </div>
  )
}
