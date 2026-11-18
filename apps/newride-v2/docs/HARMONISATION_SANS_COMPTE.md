# Livraison — écrans harmonisés et exploration sans compte

L’accueil photographique validé par Aurélie est conservé sans changement. Les pages Live, Performances, Carte, Communauté, Pro et Conversation ALI sont désormais des écrans React utilisant la même direction visuelle. Aucun écran HTML historique ni formulaire d’authentification n’est affiché dans le produit. L’ancien moteur reste uniquement un adaptateur de service invisible pour les sessions déjà authentifiées, sans demande de connexion ou permission automatique.

## Comportement vérifié

- Accès direct à `/ali/conversation`, `/performances`, `/discover` et `/pro` sans redirection vers la connexion.
- Le bouton ALI sans session serveur affiche une explication dans la page ; il ne crée pas de fenêtre de connexion et ne démarre pas le microphone.
- Brouillon communautaire conservé en mémoire lors du passage par l’espace Pro puis du retour au fil.
- Performances calculées sur les véritables séances locales existantes. Aucun score d’acquisition de compétence.
- Dix tests unitaires et compilation TypeScript/build Vite réussis.

## Disponible localement

Exercices guidés, sélection du cheval, chronomètre, bilan, journal, brouillons privés, carnet de contacts et export des tracés. Nouveau suivi GPS du téléphone : démarrage explicite, précision filtrée, arrêt, conservation locale, tracé et export JSON. Le suivi reste global pendant la navigation. Les tests automatiques vérifient le calcul de distance et le rejet de points invalides, imprécis ou incohérents. Aucun essai GPS extérieur ou suivi en arrière-plan n’a été validé.

## Toujours distinct d’un service validé

L’absence de compte demandé pour la navigation ne rend pas publics les services privés ou payants. La voix ALI en mode invité, les réponses en ligne, la publication partagée, l’analyse vidéo, la réservation et la télémétrie du casque ne sont pas déclarées opérationnelles par cette livraison. Aucune protection serveur ou RLS n’est supprimée. Aucun casque ou utilisateur fictif ne remplit les écrans vides.

Les brouillons, notes, contacts et séances de cette exploration sont locaux ; ils ne sont pas synchronisés avec le compte historique. La disponibilité du service original et son authentification restent nécessaires pour les commandes qui utilisent son backend.

## Publication

Code sauvegardé dans la branche V2, production originale intacte. Les tentatives de publication Netlify du 17 novembre ont été suivies d’erreurs 404 sur le site V2 et son tableau de bord projet. La publication publique n’est donc pas considérée comme validée. Le build est disponible pour reprise du déploiement ; l’aperçu de développement sert à la recette.
