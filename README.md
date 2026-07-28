# NewRidebis V4 — déploiement Netlify sécurisé

Le dépôt ne contient aucune clé Mapbox, Supabase, Anthropic ou OpenAI.

## Réglages Netlify

- Base directory : vide
- Build command : `npm run build`
- Publish directory : `.`
- Functions directory : `netlify/functions`

## Variables Netlify à ajouter

Obligatoires au chargement de l’application :

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` — uniquement la clé publique `anon` / `publishable`, jamais `service_role`
- `MAPBOX_TOKEN` — token public commençant par `pk.`

Obligatoires pour le coach vocal et IA :

- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

Facultatives pour l’envoi de rapports :

- `RESEND_API_KEY`
- `REPORT_FROM_EMAIL`

À chaque déploiement, `scripts/generate-config.mjs` génère automatiquement `config.js` à partir des trois variables publiques. Le fichier généré existe uniquement dans le déploiement Netlify et n’est pas enregistré dans GitHub.
