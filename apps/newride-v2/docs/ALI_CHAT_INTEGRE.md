# ALI — chat intégré et continuité

## Correction
L’envoi V2 ne dépend plus de l’élément DOM ci de l’ancienne interface. La commande chat appelle directement /api/coach-chat avec le jeton Supabase du compte courant. Aucun contournement de connexion, aucune clé serveur exposée, aucun changement de production.

Le moteur affiche immédiatement la question, annonce l’attente et expose les erreurs séparément de la réponse. Une erreur fournisseur ou un délai de 45 secondes ne se transforme pas en conseil fictif. L’interface conserve le texte pour réessayer. Un retour arrivé après changement de compte est rejeté, ainsi que l’utilisation d’un jeton d’un autre compte.

## Contexte
- Les derniers échanges chargés du compte et sa mémoire existante assurent la continuité.
- Une option volontaire permet de transmettre le cheval sélectionné, les cinq derniers bilans terminés et deux exercices pertinents par correspondance de mots. Les bilans sont déclaratifs, pas des preuves d’exécution.
- Les coordonnées de contacts, pièces médicales et médias ne sont pas transmis par ce constructeur de contexte.
- La bibliographie décrit les références disponibles et leurs limites ; elle n’équivaut pas à un index plein texte. Aucun moteur de recherche scientifique exhaustif ni ingestion de tous les corpus n’est revendiqué.
- Une réponse reçue est ensuite enregistrée dans ai_coach_messages sous l’utilisateur courant ; un échec de sauvegarde est signalé.

## Qualité à démontrer
Construire une évaluation avec enseignants : exactitude, adaptation aux prérequis, réponse à l’incertitude, bien-être, traçabilité des références et pertinence des exercices. Inclure débutants et confirmés, douleur/boiterie, absence de données et demandes hors compétence. Ne pas annoncer un niveau « meilleur expert mondial » sans évaluation indépendante.

## Vérification
Tests avec service simulé : réponse sans DOM historique, authentification transmise, panne serveur sans fausse réponse et réponse tardive A bloquée après passage à B. 22 tests de l’application passent. Compilation réussie. Service IA réel, mémoire intersessions et qualité pédagogique non validés de bout en bout dans ce lot.

## Publication
Le téléversement Netlify a été refusé pendant cette session. Les correctifs de ce lot sont préparés dans la branche V2 et ne doivent pas être annoncés comme déployés.
