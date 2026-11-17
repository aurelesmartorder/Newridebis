# NewRide V2

Application React/TypeScript séparée dans `apps/newride-v2`, branche `v2/product-refonte`. Ne pas fusionner vers la production originale pour présenter cette version.

## Livraison

Accueil photographique, animation respectueuse de la réduction des mouvements, cinq espaces, rail desktop rétractable et navigation mobile. ALI : accueil dédié, cinquante sujets en huit catégories, recherche, page « En savoir plus » et accès aux fonctions NewRidebis. Les anciens espaces Live, Perfs, Carte, Discover, Coach et Pro sont accessibles dans la nouvelle navigation.

Le moteur historique reste monté pendant le changement d’espace. La présentation du coaching est adaptée, les anciens blocs d’histoire et d’analyse artificielle sont masqués. L’exploration n’exige pas de création de compte ; les fonctions vocales et les données partagées demandent une authentification réelle. La V2 guidée conserve ses fiches chevaux, parcours, chronomètre et bilans locaux.

## Limites

Les fonctions reprises utilisent le backend Supabase et les fonctions Netlify existants, via des routes explicitement autorisées. Aucune clé secrète serveur n’est intégrée. Aucun paramètre, schéma, RLS ou enregistrement de production n’a été modifié pour la livraison. Une action explicite d’un utilisateur connecté peut néanmoins écrire dans son compte existant : cette V2 n’est pas un bac à sable de données.

Le fonctionnement vocal authentifié, le social partagé, la vidéo et les capteurs doivent faire l’objet d’essais distincts avant d’être déclarés validés. Aucun casque, allure, chute ou mesure n’est simulé. Les deux espaces de chevaux (local V2 et compte NewRidebis) ne sont pas encore synchronisés. Une conversation ou l’ouverture d’une leçon ne prouve pas une compétence acquise. Le corpus scientifique candidat n’est pas déclaré ingéré par le moteur.

## Exécution

```sh
npm ci
npm test
npm run build
npm run dev
```

Huit tests unitaires et compilation TypeScript. Voir `docs/ARCHITECTURE_NAVIGATION.md`, `docs/REPRISE_NEWRIDEBIS.md` et `docs/PHOTOGRAPHIES.json`. Dépendances verrouillées. Les données du carnet local sont conservées dans ce navigateur ; ne pas y déposer de documents médicaux confidentiels.

## Déploiement

Site V2 distinct : https://jolly-figolla-b22e33.netlify.app/ . Publication manuelle de `dist`, `_headers` et `_redirects` inclus. Pas de synchronisation automatique GitHub/Netlify actuellement. Le site original reste intact. Les routes profondes sont réécrites vers le shell ; la configuration publique est chargée depuis le site d’origine et les sept fonctions reprises sont proxifiées vers leur backend d’origine. Ne jamais rendre une fonction payante ou privée publique pour contourner la connexion.

## Ressources

Photographies : Varvara Stesina, Valentin Zickner, Chinh Le Duc, YASU SHOTS / Unsplash ; provenance et licences dans le manifeste. Personnes photographiées à titre d’illustration, sans témoignage ou partenariat imputé. Inter et Barlow Condensed sous SIL Open Font License ; Lucide sous ISC. Références Dribbble utilisées comme inspiration, sans copie de leurs ressources.
