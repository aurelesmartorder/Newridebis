# Correctifs V2 — posts, audio, formulaire et exercices

- Suppression de ses publications : menu propre à l’auteur, confirmation, requête bornée par id et user_id, confirmation d’une ligne supprimée avant retrait du fil. La politique RLS posts « Supprimer ses posts » vérifie auth.uid()=user_id. Les FK post_likes, post_comments et comment_likes sont ON DELETE CASCADE. Inspection en lecture seule ; aucun post réel supprimé lors de la recette. Le fichier photo n’est pas supprimé du bucket dans ce lot.
- Tests du service de suppression sur client simulé : propriétaire inclus, erreurs RLS et zéro ligne jamais transformés en réussite, id malformé rejeté.
- Casque : test de trois notes via WAV PCM local et HTMLAudioElement.play() appelé directement dans le geste utilisateur. Lecture et fin constatées dans le navigateur de recette ; sortie casque et comportement iPhone physique non vérifiés.
- Formulaire cheval : autoFocus supprimé, typographie mobile 16px, hauteur et décalage du visualViewport utilisés pour le clavier, bouton de création dans un pied de formulaire collant. Aucun iPhone physique disponible dans la recette.
- Catalogue : 11 fiches, niveaux Découverte/Autonome/Confirmé choisis par le cavalier, sans équivalence à un Galop ni certification automatique. Filtre de niveau testé dans le navigateur.
- 8 nouvelles adaptations pédagogiques : équilibre sur les étriers, serpentine, pas–trot, barres au sol, cession courte, trot–galop, appuyer déjà appris, construction d’une séance.
- Les références IFCE, ISES et l’étude Brown et al. 2014 sont décrites dans trainingLibrary.ts et rendues accessibles dans Sources. Aucun contenu ne prétend que l’effet d’ALI ou les durées proposées sont scientifiquement validés. Aucune barrière ne se surélève automatiquement ; les dispositifs et exercices techniques demandent un enseignant.

19 tests automatisés et compilation TypeScript/Vite passent. Les essais réels iOS, les changements d’audio route, la suppression avec compte authentifié et la qualité pédagogique restent à vérifier avant diffusion commerciale.
