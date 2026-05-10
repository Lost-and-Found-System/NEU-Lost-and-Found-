# ADR-002: Structured Error Handling with ErrorBoundary

**Status:** Decided  
**Date:** April 9, 2026  

## Context
The application needs consistent error handling for:
- Supabase database operations
- Authentication failures
- Runtime React errors
- Network issues

## Decision
Implement a multi-layer error handling strategy:

1. **ErrorBoundary Component** - Catches React runtime errors
2. **handleSupabaseError Function** - Structured logging for Supabase operations
3. **OperationType Enum** - Tracks operation context
4. **User-Friendly UI** - Graceful error messages with recovery options

## Implementation

### ErrorBoundary
- Class component that catches JavaScript errors anywhere in child component tree
- Displays user-friendly error screen
- Shows specific message for Supabase config errors
- Provides "Reload Application" button

### handleSupabaseError
- Accepts error object, operation type, and path
- Creates structured JSON error log
- Throws formatted error for ErrorBoundary to catch

### OperationType Enum
- CREATE, UPDATE, DELETE, LIST, GET, WRITE
- Provides context for debugging

## Benefits
- Consistent error logging format
- Better debugging with structured errors
- Graceful degradation
- User never sees raw error messages
