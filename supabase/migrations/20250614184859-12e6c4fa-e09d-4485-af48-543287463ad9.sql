
-- First, let's check if we need to add a trigger to handle user signup and profile creation
-- This will automatically create a profile with the correct role when a user signs up

-- Update the existing handle_new_user function to properly handle roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, employee_id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'employee_id', 'EMP' || EXTRACT(epoch FROM NOW())::text),
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'employee')
  );
  RETURN new;
END;
$function$;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing profiles that might not have proper roles set
UPDATE public.profiles 
SET role = 'employee' 
WHERE role IS NULL OR role = '';

-- If you want to manually set some users as admin, you can do:
-- UPDATE public.profiles SET role = 'admin' WHERE employee_id = 'your_admin_employee_id';
