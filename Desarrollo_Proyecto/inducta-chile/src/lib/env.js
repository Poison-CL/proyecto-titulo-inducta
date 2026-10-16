const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const env = {
  clerkPublishableKey: publishableKey,
  supabaseUrl,
  supabaseAnonKey,
}

export function assertClientEnv() {
  const faltantes = Object.entries({
    VITE_CLERK_PUBLISHABLE_KEY: publishableKey,
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY: supabaseAnonKey,
  })
    .filter(([, valor]) => !valor)
    .map(([nombre]) => nombre)

  if (faltantes.length) {
    throw new Error(
      `Faltan variables de entorno: ${faltantes.join(', ')}. Copia .env.example a .env en la raíz del proyecto y reinicia.`,
    )
  }
}
