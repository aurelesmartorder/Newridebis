# Recette du lot 1 — 17 novembre 2026

## Réalisé

- TypeScript strict et build de production Vite réussis.
- Six groupes de tests métier réussis : cheval connu et unicité de séance ; pause/reprise et durée ; bilan terminé immuable ; lecture des sauvegardes et rejet de formats invalides ; favoris réversibles ; cohérence des durées d’exercices.
- Audit npm des dépendances de production : aucune vulnérabilité signalée à la date du contrôle. Cela ne constitue pas un audit de sécurité complet.
- Recette dans Chrome : création d’un cheval synthétique, rechargement, préparation de séance avec prérequis, démarrage, pause, reprise, arrêt, saisie et enregistrement d’un bilan, rechargement du bilan et persistance vérifiée.
- Recette responsive dans une iframe de largeur contrôlée : 320, 390 et 768 px. Débordement initial d’en-tête à 320 px corrigé. Largeur de défilement égale à la largeur du body sur les vues contrôlées. Navigation basse et filtre de favoris vérifiés ; cinq cibles de navigation mesurées à environ 71 × 57 px dans le format 390 px.
- Séance de recette explicitement décrite comme technique, sans pratique physique ni mesure de capteurs. Aucun utilisateur ou contenu de production modifié.
- Thème et lecture sur desktop inspectés visuellement. La photographie est optimisée et servie localement, sans requête tierce à chaque affichage. Polices auto-hébergées.

## Non réalisé / limites

Aucune recette physique iPhone/Android, microphone, BLE, réseau mobile en conditions réelles ou coaching équestre. Aucun test Supabase puisque ce lot reste local. Pas d’audit WCAG exhaustif, de test lecteur d’écran complet, de validation scientifique, de revue d’enseignant, de test de charge ou de garantie du suivi en arrière-plan. La lecture par speechSynthesis est implémentée mais la qualité audio réelle n’a pas été validée.

Les fonctionnalités non présentes sont décrites dans README.md. Les corpus candidats sont des documents de travail non activés. Les erreurs de console observées concernaient l’extension du navigateur ; aucun résultat de recette n’est fondé sur l’absence globale de logs.
