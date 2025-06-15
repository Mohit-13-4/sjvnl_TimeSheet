
-- First, let's create a security definer function to get the current user's role
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create new policies using the security definer function
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Admin policies for other tables (avoiding recursion)
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR ALL USING (public.get_current_user_role() = 'admin' OR id = auth.uid());
