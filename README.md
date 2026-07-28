# NewRide — Coach IA Live

Version GitHub/Netlify sans clé intégrée dans le code source.

## Mise en ligne

1. Décompresse cette archive.
2. Mets **le contenu du dossier** à la racine du dépôt GitHub.
3. Dans Netlify, configure les variables d’environnement :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `MAPBOX_TOKEN`
   - `OPENAI_API_KEY`
   - `ANTHROPIC_API_KEY`
4. Lance un nouveau déploiement Netlify avec effacement du cache.

Pendant le build, `scripts/generate-config.mjs` crée automatiquement `config.js` à partir des trois variables publiques. Ce fichier est ignoré par Git et n’est donc jamais envoyé dans le dépôt.

Les clés OpenAI et Anthropic restent exclusivement dans les fonctions Netlify côté serveur.
