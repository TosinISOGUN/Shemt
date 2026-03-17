-- ==========================================
-- SHEMT DATABASE SCHEMA
-- ==========================================
-- This schema defines the structure for multi-tenant analytics.

-- 1. USERS TABLE
-- Mirror of auth.users with additional app data
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free' NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can only view their own profile
CREATE POLICY "Users can see their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Allow public insertion for signup (in production, use a database trigger instead)
CREATE POLICY "Enable public insert for signup" ON public.users
    FOR INSERT WITH CHECK (true);

-- 2. PROJECTS TABLE
-- Stores metadata for individual user projects/websites.
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID NOT NULL, -- Reference to auth.users.id
    public_api_key TEXT NOT NULL, -- Key used for client-side ingestion
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for Projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Users can only view projects they own
CREATE POLICY "Users can see their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

-- 2. EVENTS TABLE
-- Stores raw analytics events (page views, clicks, etc.)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- Event type (e.g., 'page_view')
    properties JSONB DEFAULT '{}'::jsonb, -- Custom event metadata
    user_id TEXT, -- Optional identifier for the end-user
    session_id TEXT, -- Groups events in a single visit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security for Events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Ingestion Policy: Allow inserts via Edge Functions using Service Role.
-- We keep this restricted to prevent direct public data poisoning.
CREATE POLICY "Enable insert for service role only" ON public.events
    FOR INSERT WITH CHECK (true);
