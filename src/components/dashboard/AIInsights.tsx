/**
 * AIInsights - Interactive AI Analytics Assistant for Shemt
 * 
 * Features:
 * - Chat interface with data-aware responses
 * - Suggested insights on load
 * - Loading and streaming states
 * - Auto-scroll and focus
 */

import { useState, useEffect, useRef } from 'react'
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  TrendingUp, 
  ChevronDown,
  RefreshCw,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { aiService, type AIMessage } from '@/services/aiService'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

export function AIInsights({ projectId }: { projectId?: string }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestedInsights, setSuggestedInsights] = useState<string[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load suggested insights on mount or when project changes
  useEffect(() => {
    if (projectId) {
      loadInsights(projectId)
    }
  }, [projectId])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const loadInsights = async (id: string) => {
    setLoadingInsights(true)
    try {
      const insights = await aiService.generateSuggestedInsights(id)
      setSuggestedInsights(insights)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingInsights(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !projectId || loading) return

    const userMessage: AIMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await aiService.askAnalyticsQuestion(projectId, input, messages)
      const assistantMessage: AIMessage = { role: 'assistant', content: response }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}. Please check your configuration.` 
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
      {/* Chat Interface */}
      <Card className="flex flex-col h-[600px] border-border/50 shadow-sm relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <CardHeader className="border-b bg-card/50 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Analytics Assistant</CardTitle>
                <CardDescription>Ask anything about your data</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
              GPT-4o Powered
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden relative z-10">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[400px] text-center space-y-4 opacity-60">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="max-w-[250px]">
                    <p className="font-medium">No messages yet</p>
                    <p className="text-sm">Try asking: "Why did revenue spike last week?" or "Show me my conversion trends."</p>
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <Avatar className={cn(
                    "h-8 w-8 shrink-0",
                    m.role === 'user' ? "bg-primary" : "bg-muted"
                  )}>
                    <AvatarFallback className={m.role === 'user' ? "text-primary-foreground" : ""}>
                      {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                    m.role === 'user' 
                      ? "bg-primary text-primary-foreground rounded-tr-none" 
                      : "bg-muted/50 text-foreground border border-border/50 rounded-tl-none"
                  )}>
                    <div className="whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert">
                      {m.content}
                    </div>
                    <div className={cn(
                      "text-[10px] mt-1 opacity-50",
                      m.role === 'user' ? "text-right" : "text-left"
                    )}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 max-w-[85%] mr-auto">
                  <Avatar className="h-8 w-8 shrink-0 bg-muted">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="bg-muted/50 text-foreground border border-border/50 rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                    <span>Analyzing your data...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="border-t p-4 bg-card/50 backdrop-blur-sm z-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex w-full items-center gap-2"
          >
            <Input
              placeholder="Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-background border-border/50 focus-visible:ring-primary"
              autoFocus
            />
            <Button size="icon" type="submit" disabled={loading || !input.trim()}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </CardFooter>
      </Card>

      {/* Suggested Insights Panel */}
      <div className="space-y-6">
        <Card className="border-border/50 shadow-sm bg-primary/5 border-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
            <Sparkles className="h-12 w-12 text-primary" />
          </div>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                AI Suggested Insights
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-primary"
                onClick={loadInsights}
                disabled={loadingInsights}
              >
                <RefreshCw className={cn("h-3 w-3", loadingInsights && "animate-spin")} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingInsights ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-16 bg-card rounded-lg animate-pulse border border-border/20" />
              ))
            ) : suggestedInsights.length > 0 ? (
              suggestedInsights.map((insight, i) => (
                <div 
                  key={i} 
                  className="p-3 bg-card rounded-lg text-xs leading-relaxed border border-border/30 hover:border-primary/30 transition-colors cursor-default"
                >
                  {insight}
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-4 italic">
                No insights generated. Try refreshing.
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-0 pb-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-[10px] h-7 bg-card/50"
              onClick={() => {
                const q = "Explain my recent revenue trends in detail."
                setInput(q)
              }}
            >
              Learn More
            </Button>
          </CardFooter>
        </Card>

        {/* Quick Tips */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-1">Example Prompts</h4>
          <div className="space-y-1">
            {[
              "Why did revenue drop last month?",
              "Which day had the most users?",
              "Show conversion trend this quarter.",
              "Forecast users for next month."
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => setInput(p)}
                className="w-full text-left p-2 text-[11px] rounded-md bg-muted/30 hover:bg-muted/60 transition-colors text-muted-foreground border border-transparent hover:border-border/50"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
