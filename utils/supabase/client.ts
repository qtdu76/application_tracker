import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // Support both standard anon key and publishable key naming
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!url || !anonKey) {
    throw new Error('Missing Supabase environment variables. Need NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
  }

  // Check if service_role/secret key is accidentally being used
  // Publishable keys start with "sb_", anon keys start with "eyJ", service_role keys are longer and start with "eyJ" but are much longer
  // Simple check: if it doesn't start with "sb_" or "eyJ", it's likely wrong
  if (!anonKey.startsWith('sb_') && !anonKey.startsWith('eyJ')) {
    console.warn(
      '⚠️ WARNING: Your Supabase key format looks unusual. ' +
      'Publishable keys start with "sb_", anon keys start with "eyJ". ' +
      'Make sure you are using the publishable/anon key, NOT the service_role/secret key.'
    )
  }

  return createBrowserClient(url, anonKey)
}

