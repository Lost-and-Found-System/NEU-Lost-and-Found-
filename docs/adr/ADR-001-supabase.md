# ADR-001: Use Supabase as the Backend (over Firebase)

**Status:** Decided  
**Date:** April 8, 2026  

## Context
NEU Found Hub needs a backend that provides:
- User authentication (Google OAuth)
- Real-time database for live item feed updates
- Row-level security to protect user data

## Decision: Supabase

## Reasons
1. **PostgreSQL** gives us real SQL queries for search and filter features
2. **Row-Level Security (RLS)** enforces data access rules at database level
3. **Real-time** uses postgres_changes subscriptions natively
4. **Free tier** is sufficient for capstone demo

## NEU Domain Restriction
Google OAuth is configured to only allow @neu.edu.ph email addresses ensuring:
- Knowledge provenance — every item record is traceable to verified NEU community member
- Trusted network of knowledge contributors rather than anonymous public forum
