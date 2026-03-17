/**
 * Secure Event Ingestion Edge Function
 * 
 * This endpoint receives analytics events from the frontend, validates them 
 * against a project-specific API key, and persists them to Supabase.
 */

import { createClient } from "npm:@supabase/supabase-js";

// CORS headers to allow cross-origin requests from the analytics client
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Tighten this to specific domains in production
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

interface AnalyticsEvent {
  name: string;
  project_id: string;
  properties?: Record<string, any>;
  user_id?: string;
  session_id?: string;
  api_key?: string; // Optional in body if provided in header
}

async function handler(req: Request): Promise<Response> {
  // Gracefully handle browser CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // 1. Initialize Supabase client with Service Role key for full database access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Backend infrastructure misconfigured (Missing Supabase Secrets)");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // 2. Extract and validate the request payload
    const body: AnalyticsEvent = await req.json();
    const apiKey = req.headers.get("x-api-key") || body.api_key;

    if (!body.name || !body.project_id || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Validation Failed: name, project_id, and apiKey are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Security Check: Verify that the project exists and the API key is valid
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", body.project_id)
      .eq("public_api_key", apiKey)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid Project ID or API Key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Persistence: Insert the validated event into the database
    const { error } = await supabase
      .from("events")
      .insert({
        name: body.name,
        project_id: body.project_id,
        properties: body.properties || {},
        user_id: body.user_id,
        session_id: body.session_id,
      });

    if (error) {
      console.error("Database persistence error:", error);
      throw error;
    }

    return new Response(JSON.stringify({ success: true, message: "Event ingested successfully" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Critical Ingestion Failure:", error);
    return new Response(JSON.stringify({ error: error.message || "An internal error occurred" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

Deno.serve(handler);
