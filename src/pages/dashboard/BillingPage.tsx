import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  CreditCard, 
  Check, 
  Zap, 
  Shield, 
  Crown,
  History,
  ArrowRight,
  Loader2,
  AlertCircle,
  ChevronLeft
} from 'lucide-react'
import { usePaystackPayment } from 'react-paystack'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { toast } from 'sonner'

const PRO_PLAN_CODE = 'PLN_9zhunyv04d9bt5i'
const PAYSTACK_PUBLIC_KEY = (import.meta as any).env.VITE_PAYSTACK_PUBLIC_KEY || ''

export function BillingPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (data) setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [user])

  const config = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: 10000, // Amount in kobo (100 NGN)
    publicKey: PAYSTACK_PUBLIC_KEY,
    plan: PRO_PLAN_CODE,
  }

  // @ts-ignore
  const initializePayment = usePaystackPayment(config)

  const onSuccess = (reference: any) => {
    console.log('Payment successful!', reference)
    toast.success('Subscription successful! Upgrading your account...')
    // Webhook will update database, but we refresh for visibility
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  const onClose = () => {
    console.log('Payment modal closed')
  }

  const handleUpgrade = () => {
    if (!PAYSTACK_PUBLIC_KEY) {
      alert('Paystack Public Key not found in environment variables.')
      return
    }
    // @ts-ignore
    initializePayment(onSuccess, onClose)
  }

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary/40" />
    </div>
  )

  const isPro = profile?.plan === 'pro'

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight mb-2 italic">Billing & Subscription</h1>
        <p className="text-muted-foreground font-medium text-lg">Manage your workspace plan and payment methods.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Current Plan Status */}
        <Card className="md:col-span-2 border-border/40 bg-card/20 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
           <CardHeader className="p-8 border-b border-border/20 bg-primary/5">
              <div className="flex items-center justify-between mb-4">
                 <Badge variant={isPro ? "default" : "secondary"} className="rounded-full px-4 py-1 font-black uppercase tracking-tighter italic">
                    {isPro ? 'Pro Active' : 'Free Plan'}
                 </Badge>
                 <CreditCard className="h-5 w-5 text-primary/40" />
              </div>
              <CardTitle className="text-3xl font-black italic">
                {isPro ? 'Shemt Professional' : 'Shemt Basic'}
              </CardTitle>
              <CardDescription className="text-base font-medium">
                {isPro 
                  ? 'Your professional subscription is active and renewing.' 
                  : 'You are currently using our free tier with limited capacity.'}
              </CardDescription>
           </CardHeader>
           <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="p-5 rounded-2xl bg-secondary/10 border border-primary/5 space-y-2">
                    <p className="text-xs font-black uppercase text-primary/60 tracking-widest">Billing Interval</p>
                    <p className="text-lg font-bold">Monthly</p>
                 </div>
                 <div className="p-5 rounded-2xl bg-secondary/10 border border-primary/5 space-y-2">
                    <p className="text-xs font-black uppercase text-primary/60 tracking-widest">Next Invoice</p>
                    <p className="text-lg font-bold">{isPro ? 'Next billing cycle' : '—'}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="font-black text-sm uppercase tracking-widest text-muted-foreground">Plan Features</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      'Up to 100k events',
                      'AI Analytics Assistant',
                      'Priority support',
                      'Custom alerts',
                      'Real-time data ingestion',
                      'Up to 10 projects'
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={cn(
                          "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                          isPro ? "bg-emerald-500/20 text-emerald-400" : "bg-primary/10 text-primary/40"
                        )}>
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                 </div>
              </div>

              {!isPro && (
                <div className="pt-4">
                  <Button 
                    size="lg" 
                    className="w-full h-auto py-5 sm:h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-sm sm:text-xl italic shadow-2xl shadow-primary/20 transition-all active:scale-95 group px-4"
                    onClick={handleUpgrade}
                  >
                    Upgrade to Pro — ₦100/mo
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform shrink-0" />
                  </Button>
                  <p className="text-center text-[10px] uppercase font-bold text-muted-foreground tracking-widest mt-4 flex items-center justify-center gap-2">
                    <Shield className="h-3 w-3" />
                    Secure payment via Paystack
                  </p>
                </div>
              )}
           </CardContent>
        </Card>

        {/* Right Column: Mini Stats/Actions */}
        <div className="space-y-6">
           <div className="p-8 rounded-3xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-2xl space-y-6 relative overflow-hidden group">
              <Crown className="absolute -top-6 -right-6 h-32 w-32 opacity-10 group-hover:rotate-12 transition-transform duration-700" />
              <div className="space-y-2 relative z-10">
                 <Zap className="h-8 w-8 text-white fill-white/20" />
                 <h3 className="text-2xl font-black italic leading-tight">Unlock Unlimited Insights</h3>
              </div>
              <p className="text-primary-foreground/80 text-sm font-medium leading-relaxed relative z-10">
                Get more from your data with advanced heatmaps, custom attributes, and export functionality.
              </p>
           </div>

           <Card className="border-border/40 bg-card/20 backdrop-blur-xl rounded-2xl overflow-hidden shadow-xl">
              <CardHeader className="p-6 border-b border-border/20">
                 <CardTitle className="text-lg font-black italic flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Billing History
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                 {isPro ? (
                   <div className="space-y-4 text-center py-4">
                      <p className="text-sm text-muted-foreground">History is being generated for your recurring payments.</p>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 opacity-40">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-xs font-bold uppercase tracking-widest">No transaction history</p>
                   </div>
                 )}
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  )
}
