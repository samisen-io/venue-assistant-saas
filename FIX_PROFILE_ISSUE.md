# Fix Profile Issue

## Problem
The "Refresh Demo Data" feature is failing because user profiles aren't being automatically created when users sign up.

## Solution

You need to run a SQL script in Supabase to:
1. Create a trigger that automatically creates profiles for new users
2. Create profiles for any existing users who don't have one

## Steps to Fix

### 1. Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"

### 2. Run the Profile Trigger Script

Copy and paste this SQL and click "Run":

```sql
-- Create the function that will be called by the trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Demo User')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 3. Create Profiles for Existing Users

Run this SQL to create profiles for any users who signed up before the trigger was added:

```sql
-- Insert profiles for existing users who don't have one
INSERT INTO public.profiles (id, email, full_name)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', 'Demo User') as full_name
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
```

### 4. Verify It Worked

Run this query to check that profiles exist:

```sql
SELECT COUNT(*) as profile_count FROM public.profiles;
```

You should see at least 1 profile (yours).

## Done!

After running these SQL scripts:
- All existing users will have profiles
- New users will automatically get profiles when they sign up
- The "Refresh Demo Data" button will work correctly

Try the "Refresh Demo Data" button again and it should work!
