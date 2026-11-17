# Préparation des essais entre deux comptes

## État au 17 novembre 2026

Les nouveaux identifiants proposés `newride.testeur.a@example.com` et `newride.testeur.b@example.com` ne correspondent pas encore à des utilisateurs Supabase lors de la dernière vérification SQL. Deux formulaires de création ont été préparés dans le tableau de bord ; la saisie des nouveaux mots de passe et la validation restent à effectuer par Aurélie. Ce sont des identifiants techniques, pas des boîtes de réception. Ne pas déclarer les accès utilisables avant confirmation des utilisateurs et essai de connexion.

Deux anciens comptes, `test@test.com` et `test1@test.com`, existent et sont confirmés, avec profils équestres. Leurs mots de passe n’ont pas été lus ni modifiés. Ils ne sont pas réaffectés automatiquement à de nouveaux testeurs.

## Application V2

- `/acces-test` : connexion facultative par email/mot de passe, sans garde sur les autres rubriques. Le mot de passe n’est pas stocké par la V2, n’est pas journalisé ni inclus dans les messages d’état ; le champ est vidé à la soumission et à la sortie de la vue.
- Supabase conserve sa session normale dans le navigateur. Deux onglets ordinaires partagent cette session : utiliser deux navigateurs ou une fenêtre privée distincte pour A et B.
- Le pont de service vérifie l’origine et la fenêtre émettrice. Aucun jeton ne traverse le pont ; seules les données nécessaires à l’affichage sont communiquées.
- Le moteur invisible est recréé après déconnexion. Les retours de requêtes amis/publications/séances vérifient encore l’identité qui a initié la lecture avant de modifier l’état.
- Communauté : recherche par pseudo exact, demande d’amitié, acceptation explicite, publication texte, likes, commentaires et actualisation manuelle. Les likes et commentaires s’affichent de manière optimiste et reviennent à leur état précédent en cas d’erreur signalée. Aucune réservation ni actualisation Realtime n’est prétendue par ces commandes.
- Les brouillons privés restent distincts des publications partagées. Aucune publication de démonstration n’est ajoutée.

## Configuration

La configuration du service Supabase ne dépend plus du `config.js` du site original, observé vide pendant la recette. `vite.config.ts` émet `newridebis/config.js` à partir de `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY`. Le build nécessite ces variables ; `.env.example` documente leur format. Le fichier local de configuration est ignoré par Git. Seule une clé publique publishable est utilisée, jamais `service_role`. Les appels IA restent dirigés vers le backend original ; ils ne sont pas validés par la connexion sociale.

## Recette à exécuter après création des comptes

1. A et B se connectent dans deux sessions de navigateur isolées ; relever leur pseudo affiché.
2. A demande B en ami. Avant acceptation, B ne doit pas voir les publications privées de A.
3. B actualise puis accepte la demande.
4. A publie un message explicitement identifié comme test. B actualise et doit le voir.
5. B aime et commente ; A actualise et vérifie le résultat.
6. B retire son like ; A vérifie le compteur après actualisation.
7. Déconnecter A et vérifier que le fil et ses relations ne restent pas affichés dans l’accès sans compte.
8. Tester une troisième identité non amie pour vérifier l’isolation réelle des publications.

## Preuves et limites

Quinze tests automatisés passent, dont deux tests utilisant les fonctions réelles de lecture du moteur dans un environnement isolé : une réponse arrivée après changement de compte n’injecte pas les amis ou le fil précédents. TypeScript et build Vite passent. Le formulaire d’accès test devient disponible dans le navigateur après correction de la configuration publique.

Aucun échange authentifié A↔B n’a encore été effectué : aucun compte, mot de passe, demande d’amitié, publication ou commentaire de test n’a été créé par cette livraison dans Supabase. Aucun schéma ou réglage Auth/RLS de production modifié. Le câblage logiciel n’est pas une preuve d’intégration fonctionnelle complète.

Les politiques consultées montrent une lecture des posts limitée à soi et aux amis acceptés. Les politiques SELECT des commentaires et des likes sont actuellement plus larges ; leur exposition directe mérite une revue distincte avant présentation comme réseau privé. Aucun durcissement n’a été appliqué sur la base de production sans accord spécifique.
