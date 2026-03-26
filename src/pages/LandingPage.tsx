/**
 * LandingPage - Shemt premium marketing landing page
 * 
 * Features:
 * - High-fidelity design with Ocean Teal theme
 * - Auth-aware navigation
 * - Features, Screenshots, How it works, Pricing, Testimonials
 * - SEO optimized metadata
 */

import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Shield,
  Zap,
  CheckCircle2,
  Cpu,
  MousePointer2,
  PieChart as PieChartIcon,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Globe,
  Layout,
  Lock,
  ShieldCheck,
  EyeOff,
  Server
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'
import { analytics } from '@/services/analyticsService'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'

const DASHBOARD_SCREENSHOT = 'https://v3b.fal.media/files/b/0a91fdfb/hF0WHnEvu0FUjBnoyH3fk_VioEW37q.png'

const features = [
  {
    icon: Cpu,
    title: 'AI Analytics Insights',
    description: 'Ask our AI any question about your data and get instant, actionable insights.'
  },
  {
    icon: BarChart3,
    title: 'Revenue Tracking',
    description: 'Monitor your MRR, LTV, and churn with real-time financial dashboards.'
  },
  {
    icon: Users,
    title: 'User Growth Monitoring',
    description: 'Understand how users find and use your product with deep behavioral analysis.'
  },
  {
    icon: Zap,
    title: 'Real-time Dashboard',
    description: 'Your data is live. No refreshing required. See events as they happen.'
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption and SOC2 compliance to keep your data safe.'
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description: 'Analyze millions of events per second with our high-performance infrastructure.'
  },
]

const steps = [
  {
    number: '01',
    title: 'Connect your data',
    description: 'Integrate your Stripe, Supabase, or custom API in just a few clicks.'
  },
  {
    number: '02',
    title: 'Track analytics',
    description: 'Watch as Shemt automatically builds beautiful dashboards for your team.'
  },
  {
    number: '03',
    title: 'Ask AI for insights',
    description: 'Use our AI analyst to uncover trends and growth opportunities instantly.'
  }
]

const testimonials = [
  {
    quote: "Shemt transformed how we track our KPIs. The AI assistant is like having a data scientist on call 24/7.",
    author: "Sarah Johnson",
    role: "CTO at TechCorp",
    avatar: "SJ"
  },
  {
    quote: "The best analytics tool we've used. Simple, powerful, and actually beautiful.",
    author: "Michael Chen",
    role: "Founder at StartupX",
    avatar: "MC"
  },
  {
    quote: "Our team productivity increased by 40% after switching to Shemt. Highly recommended.",
    author: "Emily Davis",
    role: "VP of Operations at ScaleUp",
    avatar: "ED"
  },
]

const plans = [
  {
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    description: 'Perfect for side projects',
    features: ['Up to 1,000 events', 'Basic dashboards', 'Community support'],
    cta: 'Get Started',
    popular: false,
    limitNote: 'Free forever'
  },
  {
    name: 'Pro',
    monthlyPrice: '$0.10',
    yearlyPrice: '$0.08',
    subPrice: '₦100',
    description: 'For growing startups',
    features: ['Up to 100k events', 'AI Analytics Assistant', 'Priority support', 'Custom alerts'],
    cta: 'Start Free Trial',
    popular: true,
    limitNote: 'Soft limit — we never block your data'
  },
  {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    yearlyPrice: 'Custom',
    description: 'For large organizations',
    features: ['Unlimited events', 'Custom AI models', 'Dedicated account manager', 'SLA guarantees'],
    cta: 'Contact Sales',
    popular: false
  },
]

export function LandingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">Shemt</span>
          </div>
          
          <nav className="hidden lg:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">How it works</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {loading ? (
              <div className="h-9 w-20 animate-pulse bg-muted rounded-md" />
            ) : user ? (
              <Link to="/dashboard">
                <Button variant="default" className="gap-2">
                  <Layout className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button 
                    className="shadow-lg shadow-primary/20"
                    onClick={() => analytics.track('cta_click', { location: 'header', label: 'Get Started' })}
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30 dark:opacity-20 blur-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/40 rounded-full" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/30 rounded-full" />
          </div>

          <div className="container mx-auto px-4 text-center relative min-h-[60vh] flex flex-col items-center justify-center">
            
            {/* Abstract 3D Geometric Animation (Behind Text) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 1.2 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none w-full max-w-3xl opacity-50 z-0"
            >
              {/* Background Ambient Glow */}
              <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full" />

              {/* Central Glowing Core */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute w-48 h-48 bg-primary/10 rounded-full blur-[40px] z-0"
              />

              {/* Floating Ring 1 (Horizontalish) */}
              <motion.div
                animate={{
                  rotateX: [60, 75, 60],
                  rotateY: [0, 180, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-64 h-64 md:w-80 md:h-80 border border-primary/20 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.02)] border-t-primary/40 border-b-primary/5"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Orbiting Satellite 1 */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-primary/80 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
              </motion.div>

              {/* Floating Ring 2 (Verticalish) */}
              <motion.div
                animate={{
                  rotateX: [70, 50, 70],
                  rotateY: [360, 180, 0],
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute w-80 h-80 md:w-96 md:h-96 border border-primary/10 rounded-full border-r-primary/30 border-l-primary/5"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Orbiting Satellite 2 */}
                <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-emerald-400/80 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              </motion.div>

              {/* Floating Box/Node 1 */}
              <motion.div
                animate={{
                  y: [-15, 15, -15],
                  rotateZ: [0, 10, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -left-12 lg:-left-24 top-1/4 w-12 h-12 md:w-16 md:h-16 bg-card/10 backdrop-blur-sm border border-border/50 rounded-xl shadow-xl flex items-center justify-center p-3"
              >
                <div className="w-full h-full border border-primary/20 rounded-lg flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-pulse" />
                </div>
              </motion.div>

              {/* Floating Box/Node 2 */}
              <motion.div
                animate={{
                  y: [20, -20, 20],
                  rotateZ: [0, -5, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -right-4 lg:-right-16 bottom-1/4 w-16 h-16 md:w-20 md:h-20 bg-card/10 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl flex items-center justify-center"
              >
                <div className="grid grid-cols-2 gap-1.5 p-3 w-full h-full opacity-40">
                  <div className="bg-primary/40 rounded-sm" />
                  <div className="bg-primary/20 rounded-sm" />
                  <div className="bg-primary/20 rounded-sm" />
                  <div className="bg-primary/60 rounded-sm" />
                </div>
              </motion.div>
            </motion.div>

            {/* Floating AI Insight Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.8 }}
              className="absolute hidden md:flex bottom-10 left-10 lg:left-20 z-20 items-center gap-3 bg-card/60 backdrop-blur-md border border-primary/20 rounded-2xl p-4 shadow-2xl"
            >
              <div className="bg-primary/20 p-2 rounded-full">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-primary" /> AI Insight
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Your MRR increased by 15% this week.</p>
              </div>
            </motion.div>

            {/* Hero Text Foreground */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 w-full max-w-4xl mx-auto"
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Now with GPT-4o Powered Insights
              </Badge>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-8">
                AI-Powered Analytics for <br className="hidden sm:block" />
                <span className="text-primary italic">Modern Startups</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                Understand your revenue, users, and growth with Shemt. 
                Our AI analyst uncovers hidden trends in your data so you can focus on building what matters.
              </p>
              <div className="mt-10 flex flex-col items-center">
                <div className="flex flex-col sm:flex-row justify-center gap-4 w-full">
                  <Link to="/signup">
                    <Button 
                      size="lg" 
                      className="h-12 px-8 text-lg gap-2 shadow-xl shadow-primary/20 w-full sm:w-auto"
                      onClick={() => analytics.track('cta_click', { location: 'hero', label: 'Get Started Free' })}
                    >
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="h-12 px-8 text-lg w-full sm:w-auto bg-background/50 backdrop-blur-md"
                    onClick={() => analytics.track('cta_click', { location: 'hero', label: 'Watch Demo' })}
                  >
                    Watch Demo
                  </Button>
                </div>
                <p className="mt-4 text-xs font-medium text-muted-foreground">
                  No credit card required • Setup in 2 minutes
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Logo Cloud (Trust) */}
        <section className="py-12 border-y bg-muted/20">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              Enterprise-grade security & privacy
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-70">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span>SOC2 Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Lock className="h-5 w-5 text-primary" />
                <span>End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <EyeOff className="h-5 w-5 text-primary" />
                <span>Privacy First</span>
              </div>
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Server className="h-5 w-5 text-primary" />
                <span>Data Residency</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                Everything you need to grow
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Ditch the spreadsheets. Shemt provides a complete analytics engine out of the box.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 auto-rows-[250px]"
            >
              {/* 1. Large Feature span 2 cols, 2 rows */}
              <motion.div variants={itemVariants} className="md:col-span-2 md:row-span-2">
                <Card className="h-full border-border/50 bg-card/50 dark:bg-card/50 backdrop-blur-sm overflow-hidden relative group shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 md:p-8 flex flex-col h-full z-10 relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-6 text-primary">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">AI Analytics Insights</h3>
                    <p className="text-muted-foreground text-lg mb-8 max-w-sm">
                      Ask our AI any question about your data and get instant, actionable insights without writing SQL.
                    </p>
                    {/* Visual */}
                    <div className="mt-auto h-48 rounded-xl bg-gradient-to-t from-background to-muted/50 border flex items-end p-4 md:p-6 relative overflow-hidden">
                      <div className="w-full bg-card border rounded-lg p-4 shadow-xl opacity-90 transition-transform duration-500 group-hover:-translate-y-2">
                         <div className="flex items-center gap-2 mb-3"><Sparkles className="h-4 w-4 text-primary animate-pulse"/> <span className="text-sm font-semibold">Generating query...</span></div>
                         <div className="space-y-2">
                           <div className="h-2 w-3/4 bg-muted-foreground/20 rounded-full"></div>
                           <div className="h-2 w-1/2 bg-muted-foreground/20 rounded-full"></div>
                           <div className="h-2 w-5/6 bg-muted-foreground/10 rounded-full"></div>
                         </div>
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Card>
              </motion.div>

              {/* 2. Top Right Feature */}
              <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
                <Card className="h-full border-border/50 bg-card/50 dark:bg-card/50 backdrop-blur-sm group overflow-hidden relative shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4 text-primary">
                      <Zap className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Real-time Dashboard</h3>
                    <p className="text-muted-foreground text-sm flex-1">
                      Live data streaming. See events exactly as they happen.
                    </p>
                    <div className="h-20 w-full mt-4 flex items-end gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                       {[40, 70, 45, 90, 65, 80, 100, 55, 75].map((h, i) => (
                         <motion.div 
                           key={i} 
                           className="flex-1 bg-primary rounded-t-sm" 
                           initial={{height: `${h}%`}} 
                           animate={{height: [`${h}%`, `${Math.min(100, h+20)}%`, `${Math.max(10, h-20)}%`, `${h}%`]}} 
                           transition={{duration: Math.random()*2+2, repeat: Infinity, ease: "easeInOut"}} 
                         />
                       ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 3. Bottom Right Feature */}
              <motion.div variants={itemVariants} className="md:col-span-1 md:row-span-1">
                <Card className="h-full border-border/50 bg-card/50 dark:bg-card/50 backdrop-blur-sm group relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full z-10 relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4 text-primary">
                      <Shield className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Enterprise Security</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      SOC2 compliance, End-to-end encryption, and role-based access control built in.
                    </p>
                    <div className="mt-auto grid grid-cols-2 gap-2">
                       <div className="text-[10px] font-mono border rounded px-2 py-1 flex items-center justify-center text-muted-foreground bg-muted/30">SOC2 Type II</div>
                       <div className="text-[10px] font-mono border rounded px-2 py-1 flex items-center justify-center text-muted-foreground bg-muted/30">GDPR Ready</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 lg:py-32 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1">
                <Badge variant="outline" className="mb-4 text-primary border-primary/20 bg-primary/5">
                  The Workflow
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-8">
                  Data analysis in minutes, <br />
                  not days.
                </h2>
                <div className="space-y-10">
                  {steps.map((step, i) => (
                    <div key={i} className="flex gap-6">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
                        {step.number}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">{step.title}</h4>
                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 relative">
                <div className="relative rounded-2xl border border-border/50 bg-muted/30 p-2 shadow-2xl backdrop-blur-sm">
                  <div className="aspect-[4/3] rounded-xl bg-card border flex flex-col overflow-hidden relative">
                    {/* Chat Header */}
                    <div className="h-12 border-b bg-muted/30 flex items-center px-4 gap-2 shrink-0">
                      <div className="flex gap-1.5 mr-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                        <div className="h-2.5 w-2.5 rounded-full bg-green-400/80" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">Shemt AI Analyst</span>
                    </div>
                    {/* Chat Body */}
                    <div className="flex-1 p-4 sm:p-6 flex flex-col gap-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 to-transparent overflow-hidden">
                      {/* User Message */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="self-end max-w-[85%] bg-primary text-primary-foreground text-sm sm:text-base rounded-2xl rounded-tr-sm px-4 py-2.5 shadow-sm"
                      >
                        Why did conversion drop yesterday?
                      </motion.div>
                      {/* AI Response */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="self-start max-w-[90%] bg-muted/80 backdrop-blur-sm border text-sm sm:text-base rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-3"
                      >
                        <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="space-y-3 w-full">
                          <p className="leading-relaxed">Traffic from your Facebook Ad campaign spiked, but the bounce rate was <span className="font-bold text-red-400">85%</span>.</p>
                          <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              whileInView={{ width: "85%" }} 
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 1 }}
                              className="h-full bg-red-400" 
                            />
                          </div>
                          <p className="text-xs text-muted-foreground font-mono bg-background/50 p-2 rounded border">Insight: Mobile load times averaged 4.2s.</p>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
                {/* Decorative dots */}
                <div className="absolute -z-10 -bottom-10 -right-10 w-40 h-40 bg-[radial-gradient(hsl(var(--primary))_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 lg:py-32 bg-muted/20 border-y">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                Simple, transparent pricing
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Scale from your first user to your first million.
              </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center items-center gap-4 mb-16">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
              <button 
                onClick={() => {
                  const newCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly';
                  setBillingCycle(newCycle);
                  analytics.track('billing_cycle_toggle', { cycle: newCycle });
                }}
                className="relative w-12 h-6 rounded-full bg-muted border border-border p-1 transition-colors hover:border-primary/50"
              >
                <motion.div 
                  animate={{ x: billingCycle === 'monthly' ? 0 : 24 }}
                  className="w-4 h-4 rounded-full bg-primary"
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-foreground' : 'text-muted-foreground'}`}>Yearly</span>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] py-0 px-1.5 pt-0.5">Save 20%</Badge>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto pt-4 md:pt-8">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={plan.popular 
                    ? 'border-primary shadow-2xl relative md:scale-105 z-10 overflow-visible bg-background dark:bg-card/50' 
                    : 'border-border/50 bg-background/50 dark:bg-card/50 backdrop-blur-sm shadow-sm'
                  }
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full z-20">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="pt-10">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-extrabold tracking-tight">
                          {billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                        </span>
                        {plan.name !== 'Enterprise' && <span className="text-muted-foreground">/mo</span>}
                      </div>
                      {plan.subPrice && billingCycle === 'monthly' && (
                        <span className="text-sm font-medium text-muted-foreground ml-1">
                          (approx. {plan.subPrice}/mo)
                        </span>
                      )}
                      {plan.subPrice && billingCycle === 'yearly' && (
                        <span className="text-sm font-medium text-muted-foreground ml-1">
                          (approx. ₦6,000/mo billed annually)
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <ul className="space-y-4">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                            <span className="text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      {plan.limitNote && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                          <Zap className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-medium text-primary uppercase tracking-wider">{plan.limitNote}</span>
                        </div>
                      )}
                    </div>
                    
                    <Link to="/signup" className="block">
                      <Button 
                        className="w-full h-12 text-md" 
                        variant={plan.popular ? 'default' : 'outline'}
                        onClick={() => analytics.track('plan_selection_click', { 
                          plan: plan.name, 
                          billingCycle,
                          price: billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice
                        })}
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 -z-10" />
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto rounded-3xl bg-primary px-8 py-16 text-primary-foreground shadow-2xl shadow-primary/30 relative"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles className="h-32 w-32" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl mb-6">
                Start analyzing your data <br />
                with AI today.
              </h2>
              <p className="mb-10 text-lg opacity-90 max-w-2xl mx-auto">
                No credit card required. Connect your data and see insights in minutes. 
                Start your journey towards data-driven growth today.
              </p>
              <Link to="/signup">
                <Button 
                  size="lg" 
                  variant="secondary" 
                  className="h-14 px-10 text-lg gap-2 shadow-xl hover:scale-105 transition-transform"
                  onClick={() => analytics.track('cta_click', { location: 'footer', label: 'Create Free Account' })}
                >
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-20 bg-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BarChart3 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold tracking-tight">Shemt</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                The next generation of SaaS analytics. Powered by AI, built for growth teams who demand more from their data.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">AI Insights</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Dashboards</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it works</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-semibold">
            <p>&copy; {new Date().getFullYear()} Shemt Analytics Inc. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-primary transition-colors">GitHub</a>
              <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
