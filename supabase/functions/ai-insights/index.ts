/**
 * AI Insights Edge Function (Hardened)
 * 
 * Includes:
 * - User-based rate limiting
 * - Strict Zod validation
 * - Auth token verification
 */

import { createClient } from "npm:@supabase/supabase-js";
import OpenAI from "npm:openai";
import { z } from "npm:zod";

const RequestSchema = z.object({
  question: z.string().min(5).max(500),
  dataSummary: z.string().min(10),
  history: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).optional(),
});

// User-based Rate Limiter (In-Memory)
const USER_RATE_LIMITS = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_WINDOW = 20; 
const WINDOW_MS = 60 * 60 * 1000; 

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const limit = USER_RATE_LIMITS.get(userId) || { count: 0, resetAt: now + WINDOW_MS };
  
  if (now > limit.resetAt) {
    limit.count = 0;
    limit.resetAt = now + WINDOW_MS;
  }
  
  if (limit.count >= MAX_REQUESTS_PER_WINDOW) return true;
  
  limit.count++;
  USER_RATE_LIMITS.set(userId, limit);
  return false;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY")!;
    
    if (!openaiApiKey) throw new Error("OPENAI_API_KEY is not set");

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Auth Verification
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Invalid session");

    // 2. Rate Limiting
    if (checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ error: "AI limit reached. Try again in an hour." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Payload Validation
    const body = await req.json();
    const result = RequestSchema.safeParse(body);
    if (!result.success) {
      return new Response(JSON.stringify({ error: "Invalid Data", details: result.error.format() }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { question, dataSummary, history = [] } = result.data;

    // 4. OpenAI AI Process
    const openai = new OpenAI({ apiKey: openaiApiKey });
    const systemPrompt = `You are SHEMT ANALYST, a world-class growth hacker and data scientist.
Your goal is to provide actionable, premium insights for startup founders.
Use professional tone and markdown formatting. 
Focus on: Revenue Growth, Conversion Optimization, and User Retention.

CONTEXT DATA:
${dataSummary}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...history,
        { role: "user", content: question }
      ] as any,
      temperature: 0.7,
    });

    return new Response(JSON.stringify({ answer: completion.choices[0].message.content }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error('AI Insight Error:', error);
    return new Response(JSON.stringify({ error: error.message || "Internal Error" }), {
      status: error.message === "Unauthorized" || error.message === "Invalid session" ? 401 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);
