# Lost and Found Tour 

## First-time Experience
- [x] New user sees tour automatically on first login
- [x] Returning user does NOT see tour automatically

## Tour Navigation
- [x] "Next" button advances to next step
- [x] "Back" button goes back 
- [x] "Finish" closes tour
- [x] Each step highlights correct UI element

## Skip Functionality
- [x] "Skip" button closes tour immediately
- [x] After skipping, tour does not restart on page refresh
- [x] After skipping, tour does not restart on next login

## Supabase Persistence
- [x] Completing tour saves `has_seen_tour = true` to Supabase
- [x] Skipping tour saves `has_seen_tour = true` to Supabase
- [x] Value persists across different browsers/devices
