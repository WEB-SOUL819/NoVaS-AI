
-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'owner');

-- Create enum for subscription tiers
CREATE TYPE public.subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');

-- Create user roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier public.subscription_tier NOT NULL DEFAULT 'free',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  auto_renew BOOLEAN NOT NULL DEFAULT false,
  payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add automation tables
CREATE TABLE public.automation_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  details TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  schedule TEXT,
  trigger_condition TEXT
);

CREATE TABLE public.automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  condition TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.automation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID REFERENCES public.automation_workflows(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_actions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- User roles policies
CREATE POLICY "Users can view their own role" 
  ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all user roles" 
  ON public.user_roles 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Admins can view all user roles" 
  ON public.user_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'owner')
    )
  );

-- User subscriptions policies
CREATE POLICY "Users can view their own subscriptions" 
  ON public.user_subscriptions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can manage all subscriptions" 
  ON public.user_subscriptions 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Admins can view all subscriptions" 
  ON public.user_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'owner')
    )
  );

-- Automation tasks policies
CREATE POLICY "Users can manage their own tasks" 
  ON public.automation_tasks 
  USING (auth.uid() = user_id);

-- Automation workflows policies
CREATE POLICY "Users can manage their own workflows" 
  ON public.automation_workflows 
  USING (auth.uid() = user_id);

-- Automation triggers policies
CREATE POLICY "Users can manage triggers for their workflows" 
  ON public.automation_triggers 
  USING (
    EXISTS (
      SELECT 1 FROM public.automation_workflows
      WHERE id = workflow_id AND user_id = auth.uid()
    )
  );

-- Automation actions policies
CREATE POLICY "Users can manage actions for their workflows" 
  ON public.automation_actions 
  USING (
    EXISTS (
      SELECT 1 FROM public.automation_workflows
      WHERE id = workflow_id AND user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
  
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
  
CREATE TRIGGER update_automation_workflows_updated_at
  BEFORE UPDATE ON public.automation_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert owner role for the specified email
CREATE OR REPLACE FUNCTION public.set_initial_owner()
RETURNS TRIGGER AS $$
DECLARE
  owner_user_id UUID;
BEGIN
  -- Find the user ID for the owner email
  SELECT id INTO owner_user_id FROM auth.users 
  WHERE email = 'fortwoyears172@gmail.com' LIMIT 1;
  
  -- If user exists, set as owner
  IF owner_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (owner_user_id, 'owner')
    ON CONFLICT (user_id) DO UPDATE SET role = 'owner';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set initial owner after this migration runs
CREATE TRIGGER set_initial_owner_trigger
  AFTER INSERT ON public.user_roles
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.set_initial_owner();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user_with_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN NEW.email = 'fortwoyears172@gmail.com' THEN 'owner' ELSE 'user' END);
  
  -- Insert free subscription that's valid for 30 days
  INSERT INTO public.user_subscriptions (
    user_id, 
    tier, 
    start_date,
    end_date, 
    is_active,
    auto_renew
  )
  VALUES (
    NEW.id, 
    'free', 
    now(),
    now() + interval '30 days', 
    true,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function for each new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_role();

-- Insert any existing users into roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, CASE WHEN email = 'fortwoyears172@gmail.com' THEN 'owner'::public.app_role ELSE 'user'::public.app_role END
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Insert free subscription for existing users
INSERT INTO public.user_subscriptions (user_id, tier, start_date, end_date, is_active, auto_renew)
SELECT id, 'free'::public.subscription_tier, now(), now() + interval '30 days', true, false
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
