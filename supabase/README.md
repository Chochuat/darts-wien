# Supabase Migrations & Bootstrap

## Running migrations

Execute the files in `supabase/migrations/` in numeric order (`0001` → `0025`)
via the Supabase Dashboard **SQL Editor**. Each file is idempotent (`IF NOT
EXISTS`) but the order matters because of foreign-key dependencies.

## Bootstrap: creating the first admin

Supabase Auth does not accept hand-INSERTed plaintext passwords. Create the
first admin user through the Dashboard, then link a `profiles` row:

1. **Dashboard → Authentication → Users → "Add user"**
   - Email: `admin@darts-wien.local` (or your choice)
   - Password: `admin` (or your choice)
   - Tick **"Auto Confirm User"**
2. Copy the user's **UUID** from the user list.
3. Open the **SQL Editor** and run:

```sql
INSERT INTO public.profiles (user_id, role, display_name)
VALUES ('PASTE-THE-UUID-HERE', 'admin', 'Club Admin');
```

4. Log in at `/admin/login` with the email and password.

## Promoting a signed-up user

Users who self-sign up land in `profiles` with `role = 'pending'`. An admin
promotes them via the `/admin/users` screen, or directly in SQL:

```sql
UPDATE public.profiles
SET role = 'scorekeeper'
WHERE user_id = 'PASTE-USER-UUID-HERE';
```

Roles: `pending` (no access), `scorekeeper` (enter results for in-progress
tournaments), `admin` (full access).

## Environment variables

See `.env.example`. The admin Route Handlers require an additional server-only
variable:

```
SUPABASE_SECRET_KEY=sb_secret_your-key-here
```

Get it from **Dashboard → Settings → API Keys** → create a secret key
(`sb_secret_...`). **Never** prefix this with `NEXT_PUBLIC_` — it bypasses
RLS and must never reach the browser.
