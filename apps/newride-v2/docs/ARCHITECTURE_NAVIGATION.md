# Architecture de navigation NewRide V2

Implémentation web React 19 / TypeScript / React Router 7, distincte de la production originale. Direction visuelle validée par Aurélie le 17 novembre 2026 : photographie équestre plein cadre, vert profond, crème, typographie sportive et accent corail. Références : https://dribbble.com/tags/mobile-app-design et https://dribbble.com/search/coaching-app ; aucune maquette ou image Dribbble reproduite.

```mermaid
flowchart TD
 Root["Shell adaptatif"] --> Today["Aujourd’hui"]
 Root --> Community["Communauté"]
 Root --> Live["Live"]
 Root --> Ali["ALI"]
 Root --> Stable["Écurie"]
 Community --> Discover["Social · balades · événements · services"]
 Live --> Activity["Séance · performances · carte"]
 Ali --> Learn["Leçons · exercices · en savoir plus"]
 Ali --> Guard["Conversation protégée"]
 Guard --> Login["Connexion puis retour demandé"]
 Stable --> Personal["Cavalier · chevaux · Pro"]
 Root --> Modals["Aide · notifications · dialogues"]
```

| Espace | Racine | Sous-parcours |
|---|---|---|
| Aujourd’hui | `/` | Accueil photographique, raccourcis, carnet réel local |
| Communauté | `/discover` | `rubrique=social/routes/events/services/top` |
| Live | `/live` | `/performances`, `/carte`, `/seance-guidee`, `/seances/:id` |
| ALI | `/coaching` | `/lecons`, `/ali`, `/ali/conversation`, `/ali/a-propos`, `/exercices`, `/coaching/:id`, `/sources` |
| Écurie | `/ecurie` | profil cavalier, chevaux locaux, `/pro`, `/experts` |

## Organisation et code

- `src/app/navigation.ts` : identifiants typés, appartenance des routes, parents de liens profonds et contrôle de destination après connexion.
- `src/app/NavigationState.tsx` : dernière route par espace, positions de défilement et reconstruction du parent au chargement direct.
- `src/app/routes.tsx` : configuration déclarative complète. React Activity garde les vues des espaces visités en mémoire ; bibliothèques chargées à la demande.
- `src/app/LegacySession.tsx` : état de connexion issu du moteur existant, garde et retour à la destination autorisée. Aucun jeton ne traverse le pont.
- `src/app/App.tsx` : navigation à cinq destinations, barre mobile, rail desktop rétractable, dialogues et moteur persistant.
- `src/features/` : Dashboard, AliHub/Lessons/AboutAli, Newridebis, Coaching, Live, Stable, Experts.
- `src/components/ui.tsx` : boutons, cartes, badges, skeletons et dialogues réutilisés.
- `src/design/` : thème existant, styles communs et direction éditoriale `editorial.css`.
- `public/newridebis/` : moteur historique repris, adaptateur de navigation et feuille de style spécifique ; ses fonctions ne sont pas réécrites artificiellement.
- `public/photos/` : photographies optimisées et servies localement ; provenance dans `docs/PHOTOGRAPHIES.json`.

## Comportement

Changer d’espace revient à son dernier sous-parcours et conserve ses saisies en mémoire. Retoucher l’espace actif ramène à sa racine. Un moteur historique unique reste monté pour éviter de couper une conversation lorsqu’on consulte un autre espace ; un indicateur global signale une voix active. Les messages du pont vérifient l’origine et la fenêtre émettrice. Les commandes de navigation ne déclenchent jamais le microphone.

L’exploration ne crée pas automatiquement de compte. `/ali/conversation` mène à `/connexion?retour=...` si nécessaire. La destination est restreinte aux routes internes connues ; pas de redirection vers un site tiers. Les identifiants sont saisis dans le formulaire NewRidebis, pas dans le shell. Les actions cloud restent soumises aux contrôles du backend d’origine.

Les cinq piles sont des états de vues web conservés, pas cinq navigateurs natifs. Une actualisation reconstruit la route et son parent mais ne restaure pas les saisies transitoires. La recette clavier, mobile réel et conversation authentifiée doit être complétée avant une qualification production.

## Design et accessibilité

Accueil : grande photographie, accroche, accès séance et carte ALI ; puis entrées photographiques apprendre/explorer/partager. ALI : conversation mise en avant, catalogue et fonctions ; intention et limites dans « En savoir plus ». Live : commandes réelles du moteur repris. Écurie : partenaire, profil et carnet local.

Entrée par léger zoom photographique et apparition du texte, sans écran bloquant. `prefers-reduced-motion` supprime les animations. Police locale Inter / Barlow Condensed. Pictogrammes vectoriels monochromes cohérents, sans emojis décoratifs dans le coaching repris. Cibles principales de 48 px minimum ; navigation et contenus adaptés aux petits écrans.

## Preuves et limites

Huit tests unitaires : état de séance, chronométrage, sauvegarde, favoris, durées, destinations sûres et parents de navigation. Compilation TypeScript stricte et build Vite. Recette navigateur : accueil photographique, catalogue et recherche « contact » conservée après changement d’espace.

La présence du code vocal et de ses boutons n’est pas une validation d’une conversation réelle. Même réserve pour le social partagé, l’analyse vidéo, la réservation et le casque BLE. La V2 utilise les services Supabase/fonctions du produit existant pour les fonctions reprises : elle n’est pas un environnement de données isolé. Aucun schéma, politique RLS ou réglage Supabase de production modifié pour cette livraison.
