import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Crear cliente mock si las variables de entorno no están disponibles
let supabase, supabaseAdmin;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Running in demo mode.')
  
  // Cliente mock que no falla pero no hace nada
  const mockClient = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: { message: 'Demo mode - authentication disabled' } }),
      signInWithPassword: () => Promise.resolve({ data: null, error: { message: 'Demo mode - authentication disabled' } }),
      signOut: () => Promise.resolve({ error: null })
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'DEMO_MODE', message: 'Demo mode - database disabled' } }) }) }),
      insert: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'DEMO_MODE', message: 'Demo mode - database disabled' } }) }) }),
      update: () => ({ eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { code: 'DEMO_MODE', message: 'Demo mode - database disabled' } }) }) }) })
    })
  }
  
  supabase = mockClient
  supabaseAdmin = mockClient
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  })

  // Cliente para operaciones de servidor con service role
  supabaseAdmin = createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export { supabase, supabaseAdmin }