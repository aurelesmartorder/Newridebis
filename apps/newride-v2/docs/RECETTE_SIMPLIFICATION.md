# NewRide V2 — simplification et préparation des premiers essais

## Modification isolée
Branche v2/product-refonte. Aucun changement de l’application originale ni des politiques Supabase.

## Parcours
- Accueil : composition approuvée conservée.
- ALI : conversation, leçons, exercices, vidéo ; programme et journal dans Mon suivi.
- Mon casque : connexion et contact de sécurité.
- Communauté : fil et balades ; carte en sous-parcours.
- Mon écurie : chevaux, carnet, performances, professionnels, compte.
Les routes existantes restent disponibles et les onglets gardent leur état.

## Voix
Les exercices guidés n’utilisent plus speechSynthesis. Lecture à la demande via /api/text-to-speech, service configuré ALI, sans repli vers la voix système. Annulation à la pause, changement d’étape et fermeture ; réponse audio tardive rejetée. Une conversation ALI active bloque une seconde lecture guidée. Les leçons démarrent dans leur liste. La voix du fournisseur et son rendu acoustique restent à écouter sur appareils réels ; aucun essai audio humain n’est revendiqué.

## Médias
Boutons natifs accessibles, typographie Inter, commandes de 48 px minimum. Aperçu et retrait avant envoi. Capture via getUserMedia ; vidéo via MediaRecorder si pris en charge, sinon import possible. Annulation et libération des pistes caméra/microphone. Photos JPEG/PNG/WebP <=10 Mo ; vidéo <=100 Mo. Permissions refusées et formats non pris en charge expliqués. Les objets URL sont libérés. La capture ne publie rien automatiquement.

## Conditions avant diffusion App Store (non remplies par ce lot)
Cette application est encore une application web. Aucun binaire iOS signé ni soumission App Store n’a été produit.
- Valider sur iPhone physique Safari et conteneur iOS : microphone, caméra, rotation, interruptions d’appel, lecture audio, navigation clavier/VoiceOver et refus de permission.
- Réaliser les essais ALI authentifiés, photo partagée entre deux comptes et analyse vidéo avec réponse serveur ; vérifier la suppression des données et la confidentialité du bucket photos.
- Résoudre la disponibilité du fournisseur de recherche de professionnels et choisir un fournisseur de carte adapté au volume commercial.
- Intégrer et tester le casque matériel. Web Bluetooth n’est pas une solution iOS universelle ; l’intégration native doit être établie.
- Concevoir, tester et valider la sécurité : aucune détection d’immobilité ni alerte automatique opérationnelle. Ne pas promettre une protection écran verrouillé.
- Compléter le parcours compte, récupération, suppression, confidentialité, modération et signalement/blocage pour le social, documents légaux et licences d’images.
- Choisir une architecture iOS, signature, compte développeur, fiche App Store et justificatifs de conformité à partir des exigences Apple actuelles lors de la soumission.

Contrôles navigateur effectués : import réel d’une image locale dans la photothèque, aperçu puis retrait ; affichage du fil simplifié et de la création de publication en fenêtre dédiée. Aucun média de recette publié.

Les tests automatisés et la compilation ne prouvent pas ces validations matérielles, pédagogiques ou commerciales.
