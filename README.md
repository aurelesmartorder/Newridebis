# NewRide AI — copie de développement sécurisée

Ce projet conserve l'application HTML d'origine dans `index.html`. Le fichier original que tu as envoyé reste séparé dans cette conversation et n'est pas ajouté au dépôt, afin de ne pas republier ses anciennes valeurs de configuration. La seule modification fonctionnelle apportée à `index.html` est le chargement de `config.js`, généré automatiquement par Netlify à partir de variables d'environnement publiques.

## Déploiement Netlify

1. Importer ce dépôt GitHub dans un **nouveau** projet Netlify.
2. Ajouter dans **Project configuration → Environment variables** :

### Variables publiques nécessaires
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `MAPBOX_TOKEN`

### Variables secrètes nécessaires
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY` si l'envoi des rapports doit fonctionner

### Variables facultatives
- `ANTHROPIC_MODEL` (défaut : `claude-sonnet-4-6`)
- `OPENAI_TTS_MODEL` (défaut : `tts-1`)
- `OPENAI_TTS_VOICE` (défaut : `nova`)
- `OPENAI_TRANSCRIPTION_MODEL` (défaut : `whisper-1`)
- `REPORT_FROM_EMAIL`

3. Déployer. Netlify exécute `npm run build`, qui crée `config.js`.

## Structure

- `index.html` : vraie application NewRide
- `netlify/functions/coach-chat.js` : coach Anthropic
- `netlify/functions/text-to-speech.js` : voix OpenAI
- `netlify/functions/transcribe-audio.js` : transcription audio pour la future commande vocale iPhone
- `netlify/functions/send-report.js` : envoi des rapports via Resend

## Sécurité

Aucune clé secrète n'est incluse dans le dépôt. Les valeurs publiques Supabase et Mapbox sont elles aussi injectées pendant le déploiement pour éviter les alertes GitHub.
