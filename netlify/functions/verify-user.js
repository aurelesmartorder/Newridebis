// Module partagé : vérifie qu'une requête vient bien d'un utilisateur NewRide réellement
// connecté (via Supabase Auth), et pas de quelqu'un qui aurait juste découvert l'adresse
// de cette fonction et l'appellerait directement pour utiliser les clés API (Claude, OpenAI,
// Resend...) à nos frais, sans aucune limite.
//
// Réutilise SUPABASE_URL et SUPABASE_ANON_KEY, déjà requises comme variables d'environnement
// Netlify pour générer config.js (voir scripts/generate-config.mjs) — aucune nouvelle variable
// à ajouter. La anon key n'est pas secrète (elle est déjà visible côté navigateur), mais on la
// lit depuis l'environnement plutôt que de la coder en dur, pour rester cohérent avec le reste
// de cette version ("sans clé intégrée dans le code source").

export async function verifyUser(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return null;

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('verifyUser: SUPABASE_URL / SUPABASE_ANON_KEY non configurées côté fonctions Netlify');
    return null;
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });
    if (!res.ok) return null;
    const user = await res.json();
    return user?.id ? user : null;
  } catch (e) {
    return null;
  }
}

export function unauthorizedResponse() {
  return {
    statusCode: 401,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ error: 'Connexion requise' }),
  };
}
