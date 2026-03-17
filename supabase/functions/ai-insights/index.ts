import { createClient } from "npm:@supabase/supabase-js";
import OpenAI from "npm:openai";

// CORS headers for security
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Production domain restriction recommended
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. Fetch backend configuration from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!supabaseUrl || !supabaseAnonKey || !openaiApiKey) {
      console.error("Critical Failure: Missing environment configuration for AI Insights");
      return new Response(
        JSON.stringify({ error: "Service Unavailable: Backend configuration incomplete" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // 2. Authentication: Verify the user's session token via Supabase
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Access token required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract Bearer token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Session is invalid or expired" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Request Parsing: Extract user question and data context
    const { question, dataSummary, history = [] } = await req.json();

    if (!question || !dataSummary) {
      return new Response(
        JSON.stringify({ error: "Bad Request: 'question' and 'dataSummary' are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. AI Insight Generation: Prepare system prompt and query OpenAI
    const openai = new OpenAI({ apiKey: openaiApiKey });

    const systemPrompt = `You are a professional data analyst for Shemt, a SaaS analytics platform.
You analyze revenue, users, and conversion metrics provided in the context.
Explain trends clearly, provide actionable insights, and make recommendations.
Be concise but thorough. Use a friendly, professional tone.

DATA CONTEXT:
${dataSummary}

FORMATTING:
Use markdown for formatting. Use bold for key figures. Use bullet points for lists.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: question }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective and powerful
      messages: messages as any,
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;

    return new Response(JSON.stringify({ answer: response }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("AI Insights Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);
