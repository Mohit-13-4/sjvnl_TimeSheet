
-- Create a security definer function to get user role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Drop the problematic admin policy
DROP POLICY IF EXISTS "Enable read access for admin users" ON profiles;

-- Create a better admin policy using the function
CREATE POLICY "Enable read access for admin users" 
ON profiles FOR SELECT 
USING (public.get_current_user_role() = 'admin');
