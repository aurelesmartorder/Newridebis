# Je connecte mon casque — V2

Route `/casque`, rattachée à l’espace Live, accessible sans compte depuis le rail desktop et la navigation interne Live. L’accueil approuvé reste inchangé. Le visuel fourni par Aurélie le 17 novembre est optimisé dans `public/photos/helmet-user.webp`. Les deux propositions générées rejetées ne sont pas utilisées. Le visuel est une illustration du parcours, pas une preuve des caractéristiques du prototype.

## Parcours

1. Préparation à l’arrêt : allumer le module, activer l’appairage, le garder proche.
2. Recherche réelle Web Bluetooth à la demande : filtre par noms NewRide et option explicite pour un module portant un autre nom. Aucun scan ou choix automatique.
3. Connexion GATT et prise en compte de l’annulation, des refus, des erreurs et de la perte de liaison. La connexion reste au niveau du shell lors des changements de rubrique ; elle est coupée au démontage de l’application. Aucune écriture de caractéristique ou configuration du firmware.
4. Lecture facultative du service standard batterie. Valeur absente ou invalide : tiret et état explicite, jamais de pourcentage simulé. L’heure de la lecture est affichée ; aucun suivi permanent de batterie n’est prétendu.
5. Préparation audio via les réglages du téléphone, trois notes générées localement et confirmation déclarée par l’utilisateur. Le navigateur ne sait pas confirmer que le son est réellement sorti du casque. Aucun microphone ou échange ALI n’est déclenché par le test.
6. Fonctionnalités expliquées séparément : coaching vocal, appels gérés par le téléphone, capteurs, sécurité. L’accès au 112 passe par un dialogue puis un lien `tel:` à action explicite. Aucun appel ou alerte automatique. Ne pas tester un numéro d’urgence.

## Ce qui n’est pas validé

Aucun protocole GATT constructeur, UUID de télémétrie, trame de capteur ou prototype matériel n’est disponible pour cette implémentation. Un appareil connecté n’est donc pas identifié comme casque NewRide compatible sur la seule base de son nom ou de son service batterie. Impacts, allures, symétrie, détection de chute, appels audio et coaching dans le casque ne sont pas déclarés validés.

Web Bluetooth est une API BLE/GATT, pas une API d’appels téléphoniques ou d’audio Bluetooth classique. La recherche dépend du navigateur et d’un contexte sécurisé ; une alternative explicative apparaît si l’API manque. Un iPhone/Safari n’est pas présenté comme compatible avec la recherche Web Bluetooth. Les essais matériels restent nécessaires.

## Vérification

Douze tests unitaires au total, dont batterie valide/absente/hors plage et distinction entre recherche, annulation, échec et liaison établie. Compilation TypeScript et build Vite. Les essais navigateur contrôlent la présentation et les parcours sans appel réel ni appareil matériel. Aucune réussite de connexion physique n’est revendiquée.

## Références

- https://developer.mozilla.org/en-US/docs/Web/API/Bluetooth/requestDevice
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API
- https://www.service-public.gouv.fr/particuliers/vosdroits/F33954 (112 européen, page vérifiée le 25 août 2026)
