import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import OpenAI from "https://esm.sh/openai@4.24.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "*", // Broaden to allow all headers temporarily for debugging
  "Access-Control-Max-Age": "86400",
};

async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("Origin") || "*";
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-region",
    "Access-Control-Allow-Credentials": "true",
  };

  const method = req.method;
  console.log(`DEBUG: Request Method: ${method} | Time: ${new Date().toISOString()}`);

  if (method === "OPTIONS") {
    console.log("DEBUG: Handling OPTIONS preflight...");
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    console.log("DEBUG: Entering Try block...");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    console.log(`DEBUG: Env Status - URL: ${!!supabaseUrl}, Key: ${!!supabaseAnonKey}, AI: ${!!openaiApiKey}`);

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase system variables.");
    }
    
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set in Supabase Secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 1. Auth Verification
    console.log("DEBUG: Verifying user session...");
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No Authorization header provided.");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error("DEBUG: Auth error:", authError?.message);
      throw new Error("Invalid or expired session.");
    }
    console.log(`DEBUG: User verified: ${user.id}`);

    // 2. Parse Payload
    console.log("DEBUG: Parsing request body...");
    const { question, dataSummary, history = [] } = await req.json();

    if (!question || !dataSummary) {
      console.error("DEBUG: Missing required fields in payload.");
      throw new Error("Question and dataSummary are required.");
    }

    // 3. OpenAI AI Process
    console.log("DEBUG: Initializing OpenAI and sending request...");
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
      ],
      temperature: 0.7,
    });

    console.log("DEBUG: OpenAI request successful.");
    const answer = completion.choices[0].message.content;

    return new Response(JSON.stringify({ answer }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("--- FUNCTION ERROR ---");
    console.error(`Type: ${error.name}`);
    console.error(`Message: ${error.message}`);
    
    // SMART MOCK FALLBACK: If OpenAI quota is hit, return a simulated response instead of failing
    if (error.message?.includes("quota") || error.message?.includes("429")) {
      console.log("DEBUG: OpenAI Quota hit. Switching to Smart Mock Mode...");
      
      const mockAnswer = `
### 🤖 [MOCK MODE] Shemt AI Analyst

It looks like your OpenAI quota is currently reached, but here is what I can see from your data:

**Performance Summary:**
- **Revenue**: Your recent revenue trends are looking stable based on the events provided.
- **Goal**: You should focus on increasing the 'conversion' event frequency to optimize your funnel.
- **Insight**: User activity is concentrated in the latest logs, showing potential for a growth spike if engagement is sustained.

*Note: This is a simulated response for testing. Once you top up your OpenAI credits, I will return to providing full GPT-4o powered deep analysis.*
      `.trim();

      return new Response(JSON.stringify({ answer: mockAnswer }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);
