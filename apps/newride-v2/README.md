# NewRide V2 — lot 1

Application React/TypeScript isolée dans `apps/newride-v2`, branche `v2/product-refonte`. La racine du dépôt et le site NewRide existant restent inchangés. Ne pas fusionner ni redéployer la production existante pour présenter cette V2.

## Disponible dans ce lot

- Design system marine/sable, cinq onglets, navigation desktop et mobile, thème sombre pour Live, états vides, dialogues accessibles et chargements skeleton.
- Fiches chevaux locales, sélection du partenaire et profil cavalier.
- Trois parcours éditoriaux guidés avec prérequis, durées, limites et références. Ils nécessitent une revue par un enseignant avant validation pédagogique.
- Recherche d’exercices et favoris.
- Chronométrage, pause/reprise, lecture vocale à la demande avec la voix du navigateur, bilan et historique persistés localement, export JSON.
- Recherche externe de professionnels sans faux profils ni créneaux.
- Références scientifiques et corpus documentaire candidat dans `docs/` ; aucune ingestion de ce candidat par un moteur IA en production.

## Limites explicites

Ce lot n’est pas une application finale de coaching connecté. Aucun appel LLM, conversation vocale bidirectionnelle, Bluetooth casque, mesure d’allure/symétrie, diagnostic, alerte automatique, flux social partagé, réservation ou synchronisation Supabase n’est implémenté. Aucun score ou résultat de pratique n’est simulé. Les séances enregistrent le temps et le ressenti de l’utilisateur, pas une compétence certifiée. Le navigateur peut suspendre la page ; les essais matériels et mobiles réels restent nécessaires.

Les données restent dans ce navigateur (`newride.v2.local.v1`). Elles ne sont pas chiffrées par l’application et ne doivent pas contenir de pièces médicales confidentielles. Deux onglets simultanés ne sont pas synchronisés : utiliser une seule instance pour saisir une séance. En cas de sauvegarde illisible, l’ancien contenu n’est pas remplacé sans réinitialisation explicite ; export brut disponible. Aucune donnée de production copiée.

## Exécution

Node 24, npm et dépendances verrouillées par package-lock.json.

```sh
cd apps/newride-v2
npm ci
npm test
npm run build
npm run dev
```

`tests/mobile.html` est un banc de recette responsive accessible uniquement sur le serveur de développement ; il n’est pas inclus dans le build.

## Nouveau site Netlify

Une publication manuelle du dossier `dist` est aussi possible sur un nouveau site Netlify. Les fichiers `public/_redirects` et `public/_headers`, recopiés au build, préservent les routes profondes et les en-têtes lors d’un dépôt manuel. Cette méthode ne synchronise pas automatiquement les commits GitHub : il faut reconstruire puis republier, ou relier ultérieurement le nouveau site à cette branche. Le site V2 est marqué noindex pendant son développement.

Créer un **nouveau** site depuis la branche `v2/product-refonte`, répertoire de base `apps/newride-v2`, configuration `netlify.toml` dans ce répertoire, build `npm ci && npm run build`, publication `dist`. Ne pas réutiliser le site actuel. Ce lot n’a besoin d’aucune clé Supabase ou IA. Ne pas ajouter de service_role ni de secret au frontend. La CSP est limitée aux capacités actuellement implémentées ; adapter explicitement connect-src aux seuls domaines V2 lors de l’intégration backend.

Prochain lot : projet Supabase isolé, Auth invité contrôlée, schéma chevaux/séances privé, RLS testée entre deux identités, synchronisation idempotente, puis services vocaux protégés. Casque : obtenir protocole GATT, trames et appareil avant développement spécifique. Pour iPhone BLE, prévoir une couche native plutôt que promettre un support Web Bluetooth universel.

## Droits des ressources

Photographie de carrière : YASU SHOTS, Unsplash, https://unsplash.com/photos/a-person-rides-a-horse-in-a-sand-arena-iVcH9-iAovQ — téléchargement de la version gratuite de la page ; conserver cette attribution. Les personnes illustrées ne sont ni des utilisateurs NewRide identifiés ni des partenaires présentés. Aucun avis ou résultat attribué à ces personnes.

Inter : SIL Open Font License, fournie par @fontsource/inter ; Lucide : licence ISC fournie dans le package. Schémas de carrière : SVG originaux de cette V2, illustrations de trajectoire et non mesures réelles. Corpus : synthèses et références ; vérifier les obligations de chaque source avant toute reproduction, revue métier encore nécessaire.
