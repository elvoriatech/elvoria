/**
 * Compatibility shim — previously backed by Supabase, now backed by a pg Pool.
 * All stores import isDbConfigured / isSupabaseConfigured from here so they don't
 * need to change their import paths.
 */
export { isDbConfigured as isSupabaseConfigured, isDbConfigured as isBookingDatabaseConfigured, getPool as createAdminClient } from '@/lib/db';
