# Reprise de compatibilité NewRidebis

Source : dépôt Newridebis, socle 846ca5478396cb051020760fef428814b32e93c9 avec les correctifs locaux de progression déjà testés. SHA256 de la source de travail : 281c846d9f936d77da4661387e96bc411764febd59c4b43891b5a1d5a0165dde

Le module sert une copie locale de l’interface historique dans une frame de même origine. Ses requêtes métier sont relayées vers les fonctions du site historique ; la configuration publique Supabase/Mapbox provient du site historique. Aucun secret serveur n’est copié. Les comptes et les données partagées restent ceux de NewRidebis : ce n’est pas un backend V2 isolé. Aucun schéma, réglage ni donnée de production modifié pendant la préparation.

L’exploration sans compte ne crée pas d’identité anonyme ni de profil serveur. La conversation et les leçons vocales demandent une connexion ; le serveur conserve la vérification du jeton. Le lancement du microphone reste une action explicite de l’utilisateur. Les historiques et profils sociaux de démonstration ne sont pas présentés comme réels ; la fausse connexion BLE est retirée.

La compatibilité préserve les fonctions présentes dans le code, pas leur validation terrain. Les services tiers, la voix, les permissions navigateur et les écritures authentifiées doivent faire l’objet d’une recette avec compte et appareils réels. Aucune disponibilité ni qualité pédagogique n’est déduite de la seule copie du code. Les titres de leçons hérités restent à revoir lorsque leurs références ne sont pas établies.
