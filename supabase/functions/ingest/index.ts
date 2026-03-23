/**
 * Secure Event Ingestion Edge Function (Hardened)
 * 
 * Includes:
 * - Token-bucket rate limiting (per project API key)
 * - Strict Zod validation
 * - Security headers
 */

import { createClient } from "npm:@supabase/supabase-js";
import { z } from "npm:zod";

// 1. Define strict validation schema
const EventSchema = z.object({
  name: z.string().min(1).max(50),
  project_id: z.string().uuid(),
  properties: z.record(z.any()).optional(),
  user_id: z.string().max(100).optional(),
  session_id: z.string().max(100).optional(),
  api_key: z.string().optional(),
});

// 2. Simple In-Memory Rate Limiter (Token Bucket)
// Note: In a multi-instance production environment, use Redis/Upstash.
const RATE_LIMIT_STORES = new Map<string, { tokens: number; lastRefill: number }>();
const MAX_TOKENS = 100;
const REFILL_RATE = 10; // tokens per second

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = RATE_LIMIT_STORES.get(key) || { tokens: MAX_TOKENS, lastRefill: now };
  
  // Refill tokens
  const elapsed = (now - bucket.lastRefill) / 1000;
  const newTokens = Math.min(MAX_TOKENS, bucket.tokens + elapsed * REFILL_RATE);
  
  if (newTokens < 1) {
    return true; // Limited
  }
  
  RATE_LIMIT_STORES.set(key, { tokens: newTokens - 1, lastRefill: now });
  return false;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 3. Rate Limiting Check
    const apiKey = req.headers.get("x-api-key");
    if (apiKey && isRateLimited(apiKey)) {
      return new Response(JSON.stringify({ error: "Too many requests. Please slow down." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Strict Validation
    const json = await req.json();
    const result = EventSchema.safeParse({ ...json, api_key: apiKey || json.api_key });

    if (!result.success) {
      return new Response(JSON.stringify({ error: "Validation Error", details: result.error.format() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { name, project_id, properties, user_id, session_id, api_key } = result.data;

    if (!api_key) {
      return new Response(JSON.stringify({ error: "API Key required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Verify Project & API Key
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", project_id)
      .eq("public_api_key", api_key)
      .single();

    if (projectError || !project) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Persistence
    const { error } = await supabase.from("events").insert({
      name,
      project_id,
      properties: properties || {},
      user_id,
      session_id,
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Ingestion Error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);
