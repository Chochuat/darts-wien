-- Fix: infinite recursion in profiles RLS policies.
-- The "Admins can read all profiles" policy queried profiles from within a
-- policy ON profiles, causing infinite recursion. Replace with a
-- SECURITY DEFINER function that reads the caller's role bypassing RLS.

-- Drop the recursive policies (they error on every query).
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- SECURITY DEFINER function: returns the caller's role, bypassing RLS.
-- SECURITY DEFINER runs with the function owner's privileges (postgres),
-- so the inner SELECT on profiles is NOT subject to RLS.
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated, anon;

-- Re-create policies using the function (no recursion).
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id AND role = 'pending');

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_my_role() = 'admin');

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.get_my_role() = 'admin');
