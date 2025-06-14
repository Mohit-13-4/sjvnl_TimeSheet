
-- Drop all existing policies with their exact names
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users on their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for users on their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for users on their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for admin users" ON public.profiles;

-- Disable RLS temporarily to clean up
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create new simple, non-recursive policies with unique names
CREATE POLICY "Profile read access for own user" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Profile update access for own user" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Profile insert access for own user" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow admins to read all profiles using the security definer function
CREATE POLICY "Admin read access to all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (public.get_current_user_role() = 'admin');
