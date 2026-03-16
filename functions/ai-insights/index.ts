import { createClient } from "npm:@blinkdotnew/sdk";
import OpenAI from "npm:openai";

// CORS headers - required for browser calls
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const projectId = Deno.env.get("BLINK_PROJECT_ID");
    const secretKey = Deno.env.get("BLINK_SECRET_KEY");
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    if (!projectId || !secretKey || !openaiApiKey) {
      console.error("Missing config:", { projectId: !!projectId, secretKey: !!secretKey, openaiApiKey: !!openaiApiKey });
      return new Response(
        JSON.stringify({ error: "Missing backend configuration" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const blink = createClient({ projectId, secretKey });
    
    // Verify user JWT from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const auth = await blink.auth.verifyToken(authHeader);
    if (!auth.valid) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request body
    const { question, dataSummary, history = [] } = await req.json();

    if (!question || !dataSummary) {
      return new Response(
        JSON.stringify({ error: "Bad Request: question and dataSummary are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
