/**
 * LandingPage - Shemt premium marketing landing page
 * 
 * Features:
 * - High-fidelity design with Ocean Teal theme
 * - Auth-aware navigation
 * - Features, Screenshots, How it works, Pricing, Testimonials
 * - SEO optimized metadata
 */

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
  Layout
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/useAuth'

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
    price: '$0',
    description: 'Perfect for side projects',
    features: ['Up to 1,000 events', 'Basic dashboards', 'Community support'],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'For growing startups',
    features: ['Up to 100k events', 'AI Analytics Assistant', 'Priority support', 'Custom alerts'],
    cta: 'Start Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Unlimited events', 'Custom AI models', 'Dedicated account manager', 'SLA guarantees'],
    cta: 'Contact Sales',
    popular: false
  },
]

export function LandingPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

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
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Testimonials</a>
          </nav>

          <div className="flex items-center gap-4">
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
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/signup">
                  <Button className="shadow-lg shadow-primary/20">Get Started</Button>
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
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30 blur-3xl pointer-events-none">
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Now with GPT-4o Powered Insights
              </Badge>
              <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-8">
                AI-Powered Analytics for <br />
                <span className="text-primary italic">Modern Startups</span>
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
                Understand your revenue, users, and growth with Shemt. 
                Our AI analyst uncovers hidden trends in your data so you can focus on building what matters.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/signup">
                  <Button size="lg" className="h-12 px-8 text-lg gap-2 shadow-xl shadow-primary/20 w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg w-full sm:w-auto">
                  Watch Demo
                </Button>
              </div>
            </motion.div>

            {/* Product Screenshot */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="mt-20 relative"
            >
              <div className="relative mx-auto max-w-5xl rounded-2xl border border-border/50 bg-muted/30 p-2 backdrop-blur-sm shadow-2xl overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none z-10" />
                <img 
                  src={DASHBOARD_SCREENSHOT} 
                  alt="Shemt Dashboard Overview" 
                  className="rounded-xl w-full h-auto shadow-inner transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
              
              {/* Floating element 1 */}
              <div className="absolute -top-6 -left-6 hidden lg:block animate-bounce-slow">
                <Card className="p-4 shadow-xl border-primary/20 bg-background/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue Up</p>
                      <p className="text-sm font-bold">+24.5%</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Floating element 2 */}
              <div className="absolute -bottom-10 -right-6 hidden lg:block animate-float">
                <Card className="p-4 shadow-xl border-primary/20 bg-background/80 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">AI Insight</p>
                      <p className="text-sm font-bold italic">"Growth trend is healthy"</p>
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Logo Cloud (Trust) */}
        <section className="py-12 border-y bg-muted/20">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
              Trusted by fast-growing startups
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:opacity-100 transition-opacity">
              {['Acme', 'Stripe', 'Vercel', 'Linear', 'Supabase'].map(logo => (
                <span key={logo} className="text-2xl font-bold italic text-foreground tracking-tighter">{logo}</span>
              ))}
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
              className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature, index) => (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="h-full transition-all hover:shadow-xl hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm group">
                    <CardContent className="pt-8">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                        <feature.icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
                <div className="relative rounded-2xl border border-border/50 bg-muted p-4 shadow-2xl">
                  <div className="aspect-[4/3] rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                    {/* Placeholder for interactive demo or secondary screenshot */}
                    <div className="p-8 text-center space-y-4">
                      <MessageSquare className="h-16 w-16 text-primary mx-auto opacity-50" />
                      <p className="text-slate-400 font-mono text-sm">
                        {"User: Why did conversion drop?"} <br />
                        {"AI: Looking at your landing page traffic..."}
                      </p>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary animate-progress-fast" />
                      </div>
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
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                Simple, transparent pricing
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Scale from your first user to your first million.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <Card 
                  key={index} 
                  className={plan.popular ? 'border-primary shadow-2xl relative scale-105 z-10' : 'border-border/50 bg-card/50'}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                      Most Popular
                    </div>
                  )}
                  <CardHeader className="pt-10">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-extrabold tracking-tight">{plan.price}</span>
                      {plan.name !== 'Enterprise' && <span className="text-muted-foreground">/mo</span>}
                    </div>
                    <ul className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm">
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup" className="block">
                      <Button 
                        className="w-full h-12 text-md" 
                        variant={plan.popular ? 'default' : 'outline'}
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

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl mb-4">
                Loved by growth teams
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join the startups scaling their business with Shemt
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((t, index) => (
                <Card key={index} className="bg-muted/30 border-border/50">
                  <CardContent className="pt-8">
                    <p className="text-lg italic text-muted-foreground mb-8 leading-relaxed">
                      "{t.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {t.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold">{t.author}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </div>
                    </div>
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
                Join 5,000+ companies already using Shemt.
              </p>
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="h-14 px-10 text-lg gap-2 shadow-xl hover:scale-105 transition-transform">
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
                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-semibold">
            <p>&copy; 2024 Shemt Analytics Inc. All rights reserved.</p>
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
