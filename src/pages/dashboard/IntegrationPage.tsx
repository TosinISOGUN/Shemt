import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  ExternalLink,
  ShieldCheck,
  Zap,
  BookOpen
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function IntegrationPage() {
  const [copied, setCopied] = useState(false)
  
  // In a real app, this would be the user's project ID from the database
  const projectId = "proj_live_8zf9x2n4" 
  
  const snippet = `<script 
  src="https://shemt.vercel.app/shemt.js" 
  data-project-id="${projectId}"
  async
></script>`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    toast.success('Snippet copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-2">
            <Badge variant="outline" className="rounded-full px-4 py-1 border-primary/20 bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest">Setup Guide</Badge>
            <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                GDPR Compliant
            </span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2 italic">Connect Your Site</h1>
        <p className="text-muted-foreground font-medium text-lg max-w-2xl">Copy and paste this snippet into your website's <code className="text-primary font-bold">&lt;head&gt;</code> tag to start gathering AI-powered insights.</p>
      </div>

      <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl border-l-4 border-l-primary">
        <CardHeader className="p-8 border-b border-border/10 bg-primary/5 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black italic flex items-center gap-3">
              <Terminal className="h-5 w-5 text-primary" />
              Tracking Snippet
            </CardTitle>
            <CardDescription className="font-medium">Compatible with Next.js, React, Vue, and Webflow.</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-primary/20 hover:bg-primary/10 transition-all font-bold gap-2"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Snippet'}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
           <pre className="p-8 bg-zinc-950/80 text-zinc-300 font-mono text-xs sm:text-sm overflow-x-auto selection:bg-primary/30">
             {snippet}
           </pre>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="p-8 rounded-3xl bg-secondary/10 border border-primary/5 space-y-4 hover:border-primary/20 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-black italic">Instant Activation</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Once the script is installed, shemt will automatically detect page views. Open your dashboard in another tab to see real-time events.
            </p>
            <button className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:translate-x-1 transition-transform">
                View Live Feed <ExternalLink className="h-3 w-3" />
            </button>
        </div>

        <div className="p-8 rounded-3xl bg-secondary/10 border border-primary/5 space-y-4 hover:border-primary/20 transition-all group">
            <div className="h-12 w-12 rounded-2xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-black italic">Custom Events</h3>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Track custom actions like button clicks or purchases using our simple JS API: <br/>
                <code className="bg-background/50 px-2 py-0.5 rounded text-primary border border-primary/10 mt-2 inline-block">shemt.track('paid', {'{'} price: 99 {'}'})</code>
            </p>
            <button className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:translate-x-1 transition-transform">
                SDK Documentation <ExternalLink className="h-3 w-3" />
            </button>
        </div>
      </div>
    </div>
  )
}
