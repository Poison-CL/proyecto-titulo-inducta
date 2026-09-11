const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const env = {
  clerkPublishableKey: publishableKey,
  supabaseUrl,
  supabaseAnonKey,
}

export function assertClientEnv() {
  if (!publishableKey) {
    throw new Error(
      'Falta VITE_CLERK_PUBLISHABLE_KEY. Copia .env.example a .env en la raíz del proyecto y reinicia.',
    )
  }
}
