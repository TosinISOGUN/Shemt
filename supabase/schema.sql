-- ==========================================
-- SHEMT DATABASE SCHEMA
-- ==========================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free' NOT NULL,
    avatar_url TEXT,
    paystack_customer_code TEXT,
    paystack_subscription_code TEXT,
    subscription_status TEXT,
    subscription_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies for users
DROP POLICY IF EXISTS "Users can see their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

CREATE POLICY "Users can see their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (
        (auth.uid() = id) AND 
        (plan = (SELECT plan FROM public.users WHERE id = auth.uid()))
    );

-- Trigger to protect plan and subscription fields from manual updates
CREATE OR REPLACE FUNCTION public.protect_subscription_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    -- Only allow the service role (used by Edge Functions) to change these fields
    IF (current_setting('role') <> 'service_role') THEN
      NEW.plan := OLD.plan;
      NEW.paystack_customer_code := OLD.paystack_customer_code;
      NEW.paystack_subscription_code := OLD.paystack_subscription_code;
      NEW.subscription_status := OLD.subscription_status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_update_protect_plan
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE public.protect_subscription_fields();

-- Trigger Function for User Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clean up existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    public_api_key TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'base64'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies for projects
DROP POLICY IF EXISTS "Users can see their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;

CREATE POLICY "Users can see their own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    properties JSONB DEFAULT '{}'::jsonb,
    user_id TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies for events
DROP POLICY IF EXISTS "Users can see events from their own projects" ON public.events;
DROP POLICY IF EXISTS "Allow service role insertion" ON public.events;

CREATE POLICY "Users can see events from their own projects" ON public.events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects p 
            WHERE p.id = project_id AND p.user_id = auth.uid()
        )
    );

CREATE POLICY "Allow service role insertion" ON public.events
    FOR INSERT WITH CHECK (true);

-- 4. ANALYTICS VIEWS (For AI Insights)
-- View for AI to see events with project info and readable names
CREATE OR REPLACE VIEW public.analytics_events AS
SELECT 
    e.id,
    e.name as event_type,
    COALESCE(e.properties->>'value', '0') as value,
    e.created_at,
    p.user_id,
    p.name as project_name
FROM public.events e
JOIN public.projects p ON e.project_id = p.id;

-- View for metrics summary (Aggregated)
CREATE OR REPLACE VIEW public.metrics_summary AS
SELECT 
    p.user_id,
    COALESCE(SUM((NULLIF(e.properties->>'value', '')::numeric)), 0) as revenue,
    COUNT(DISTINCT e.user_id) as active_users,
    CASE 
        WHEN COUNT(DISTINCT e.session_id) = 0 THEN 0
        ELSE ROUND((COUNT(DISTINCT CASE WHEN e.name = 'conversion' THEN e.session_id END)::numeric / NULLIF(COUNT(DISTINCT e.session_id), 0)::numeric) * 100, 2)
    END as conversion_rate
FROM public.projects p
LEFT JOIN public.events e ON p.id = e.project_id
GROUP BY p.user_id;

-- Ensure RLS on views (if supported) or handle via security definer functions if needed
-- Note: Views in Supabase/Postgres generally inherit permissions of the underlying tables

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications RLS Policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);

-- System can universally insert notifications 
CREATE POLICY "Allow service role insertion for notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

-- 6. TEAM MEMBERS TABLE
-- Tracks collaborators on projects
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(project_id, invited_email)
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team Members RLS Policies
DROP POLICY IF EXISTS "Project owners can manage team members" ON public.team_members;
DROP POLICY IF EXISTS "Members can see their own memberships" ON public.team_members;

-- 1. Project owners can see, invite, and remove members
CREATE POLICY "Project owners can manage team members" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.projects 
            WHERE id = team_members.project_id AND user_id = auth.uid()
        )
    );

-- 2. People who are invited can see their invitation (optional for future acceptance flow)
CREATE POLICY "Members can see their own invitations" ON public.team_members
    FOR SELECT USING (invited_email = auth.jwt() ->> 'email');
