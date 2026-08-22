import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase réservé au serveur.
 *
 * Il utilise la clé `service_role`, qui contourne RLS. Il ne doit donc JAMAIS
 * être importé depuis un composant client — la frontière est le fait que ce
 * module ne lit que des variables d'environnement non préfixées NEXT_PUBLIC_.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Variables d'environnement manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
