# NewRide V2

Application React/TypeScript distincte dans `apps/newride-v2`, branche `v2/product-refonte`. L’accueil photographique approuvé reste inchangé. La production originale n’est pas modifiée par cette expérimentation.

## Navigation et présentation

Cinq espaces : Aujourd’hui, Communauté, Live, ALI et Écurie. Rail desktop rétractable, barre mobile, sous-parcours conservés en mémoire et liens profonds. Toutes les rubriques sont explorables sans compte ; aucun formulaire d’authentification ne bloque les pages. Les écrans Live, Performances, Carte, Communauté, Pro et Conversation ALI sont des vues React harmonisées avec l’accueil. Le moteur historique n’est plus affiché.

## Fonctions locales

Chevaux, exercices guidés, sélection du partenaire, chronomètre, pause/reprise, bilan, historique et export. Journal d’observations, brouillons privés et carnet de contacts. Suivi GPS du téléphone sur démarrage explicite : filtrage des points, distance estimée, arrêt, conservation locale, tracé et export JSON. Le suivi est maintenu dans le shell lors des changements de rubrique ; aucun arrière-plan natif n’est garanti.

Les brouillons ne sont pas des publications partagées. Les observations ne certifient pas une compétence. Les parcours nécessitent une validation pédagogique distincte et le GPS n’a pas été testé sur une sortie réelle. Ne pas déposer de documents médicaux confidentiels dans le stockage du navigateur.

## Services existants

Le moteur NewRidebis reste un adaptateur invisible pour les sessions serveur déjà authentifiées. Il n’exige pas de connexion pour naviguer et n’ouvre pas automatiquement le microphone ou la localisation. Aucune clé secrète serveur n’est copiée ; la configuration publique est chargée depuis le site original. Les sept fonctions utilisent des chemins API explicitement autorisés.

La voix ALI en mode invité, les réponses en ligne, la publication partagée, l’analyse vidéo, la réservation et la télémétrie de casque ne sont pas déclarées opérationnelles par cette livraison. Leur indisponibilité n’ouvre pas de formulaire bloquant. Aucune protection serveur, RLS, table, donnée ou configuration Supabase de production modifiée. Le corpus documentaire candidat n’est pas déclaré ingéré dans chaque réponse d’ALI.

## Exécution et validation

```sh
npm ci
npm test
npm run build
npm run dev
```

Dix tests unitaires et compilation TypeScript/build Vite. Recette navigateur : accès libre, saisies conservées entre espaces, formulaire de connexion absent, petit écran de 320 px sans débordement horizontal sur ALI. Le banc `tests/mobile.html` est uniquement destiné au développement.

## Publication

Build prêt dans `dist`, `_headers` et `_redirects` inclus. Publication manuelle Netlify, sans CI automatique. Le site V2 `jolly-figolla-b22e33.netlify.app` et son tableau de bord ont renvoyé 404 après les tentatives du 17 novembre : la mise en ligne publique n’est pas validée. Ne pas présenter cette URL comme fonctionnelle avant nouvelle recette. Le site original reste distinct.

## Documentation et ressources

`docs/ARCHITECTURE_NAVIGATION.md`, `docs/HARMONISATION_SANS_COMPTE.md` et `docs/PHOTOGRAPHIES.json`. Photographies : Varvara Stesina, Valentin Zickner, Chinh Le Duc, YASU SHOTS / Unsplash. Illustrations sans témoignage ni partenariat imputé aux personnes photographiées. Inter et Barlow Condensed sous SIL Open Font License ; Lucide sous ISC. Références Dribbble utilisées pour la direction, sans copie de leurs ressources.
