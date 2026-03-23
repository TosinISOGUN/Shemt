import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const signature = req.headers.get('x-paystack-signature')
    const body = await req.text()

    if (!signature) {
      return new Response('No signature', { status: 401 })
    }

    // --- HMAC-SHA512 Signature Verification ---
    const encoder = new TextEncoder()
    const keyData = encoder.encode(PAYSTACK_SECRET_KEY)
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    )
    
    const bodyData = encoder.encode(body)
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      bodyData
    )
    
    const hashArray = Array.from(new Uint8Array(signatureBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    if (hashHex !== signature) {
      console.warn('Invalid Paystack signature detected.')
      return new Response('Invalid signature', { status: 401 })
    }

    const event = JSON.parse(body)
    const { event: eventType, data } = event

    console.log(`Processing Paystack event: ${eventType}`)

    if (eventType === 'charge.success' || eventType === 'subscription.create') {
      const email = data.customer.email
      const customerCode = data.customer.customer_code
      const subscriptionCode = data.subscription_code || data.plan?.plan_code
      
      // Update user to PRO plan
      const { error } = await supabase
        .from('users')
        .update({
          plan: 'pro',
          paystack_customer_code: customerCode,
          paystack_subscription_code: subscriptionCode,
          subscription_status: 'active',
          subscription_at: new Date().toISOString()
        })
        .eq('email', email)

      if (error) {
        console.error('Error updating user plan:', error)
        return new Response('Error updating user', { status: 500 })
      }
      
      console.log(`User ${email} upgraded to PRO successfully.`)
    }

    if (eventType === 'subscription.disable' || eventType === 'subscription.not_renew') {
      const email = data.customer.email
      
      // Revert user to FREE plan
      await supabase
        .from('users')
        .update({
          plan: 'free',
          subscription_status: 'inactive'
        })
        .eq('email', email)
        
      console.log(`User ${email} subscription disabled/cancelled.`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Webhook Error', { status: 400 })
  }
})
