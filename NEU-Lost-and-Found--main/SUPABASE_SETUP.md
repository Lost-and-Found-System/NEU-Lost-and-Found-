# Supabase RLS Policies for Comment Restrictions

To prevent users from commenting on archived posts, you need to apply Row Level Security (RLS) policies to your Supabase database.

## How to Apply the Policies

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to the "SQL Editor" section
4. Copy and paste the contents of `supabase-rls-policies.sql`
5. Click "Run" to execute the SQL

## What These Policies Do

- **Prevent inserting comments** on posts with `status = 'archived'`
- **Prevent updating comments** on posts with `status = 'archived'`
- **Prevent deleting comments** on posts with `status = 'archived'`
- **Allow viewing all comments** (including on archived posts)

## Frontend Changes Made

The frontend has also been updated to:
- Show proper error messages when database operations are blocked
- Remove optimistic comments from the UI if they're rejected by the database
- Display clear messages like "Cannot comment on archived posts"

## Testing

After applying the policies:
1. Try to comment on an archived post
2. You should see an error message: "Cannot comment on archived posts"
3. The comment should not appear in the UI
4. Try editing/deleting comments on archived posts - these should also be blocked

## Note

Make sure your `items` table has a `status` column with possible values including 'archived'. If your table structure is different, you may need to adjust the SQL policies accordingly.