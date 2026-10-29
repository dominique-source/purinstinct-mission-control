# PÜRINSTINCT — MISSION CONTROL

Le système personnel de Dominique Soucy : cinq Worlds, 25 missions et une campagne de 30 jours, du 26 octobre au 24 novembre 2026. Une mission ouverte, une prochaine action précise, puis la suivante. La destination à long terme : les premiers PürInstinct Games scolaires à Vanier, le 15 avril 2027.

## Démarrage

Node.js 20.9+ et npm.

```sh
npm install
npm run dev
```

Ouvrir http://localhost:3000. Contrôles de livraison :

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm start
```

## Stack et architecture

Next.js App Router, React, TypeScript, Tailwind CSS 4, Lucide. Le CSS sémantique définit un système visuel cohérent; aucun kit de composants superflu. Les illustrations de terrain sont réalisées en CSS, sans vidéo, photographie ni portraits fictifs. Barlow et Barlow Condensed sont des polices libres; les polices système servent de repli si Google Fonts est inaccessible.

- `app/` : dashboard, `/world/[id]`, `/mission/[id]`, `/archive`, `/settings`.
- `components/` : interface, contexte et mutations de progression.
- `types/index.ts` : World, Mission, Task, Settings et State.
- `data/seed.ts` : toutes les missions initiales, tâches, objectifs et récompenses.
- `lib/engine.ts` : calculs purs XP, niveaux, progression, dépendances, streak et compte à rebours.
- `lib/engine.test.ts` : invariants métier et régressions.

## Persistance

Schéma versionné `purinstinct-mission-control-v1` dans localStorage. Aucun compte ni serveur requis. Les modifications sont sauvegardées automatiquement. Paramètres permet d’exporter/importer une sauvegarde JSON et de réinitialiser après confirmation. Le contexte est la frontière de données : il peut être remplacé par un dépôt/API sans modifier les calculs métier. Les données sont propres au navigateur et à son origine; pas de synchronisation entre appareils. Un échec de stockage est signalé visiblement.

## XP, niveaux et progression

Chaque action initiale vaut explicitement 50 XP, modifiable dans la fiche mission. Une mission reçoit son bonus propre uniquement si toutes ses tâches sont terminées et qu’elle possède au moins une tâche. Total XP = somme des tâches cochées + bonus des missions terminées. Le total est dérivé, jamais incrémenté en stockage. Décocher retire les XP de la tâche et le bonus mission. Archiver conserve les XP gagnés.

Niveaux : 0, 1 000, 2 500, 4 500, 7 000, 10 000 et 14 000 XP. Le niveau 7 est le maximum. Mission = proportion des tâches. World = moyenne des pourcentages pondérée par bonus mission. Campagne = toutes les missions non archivées, y compris celles en attente ou en pause. Les relations de séquence ne modifient pas le dénominateur. La destination du 15 avril est une checklist séparée et n’ajoute ni XP ni progression de saison.

## Dépendances et focus

Les champs `dependencies` et `unlockConditions` sont des **recommandations de séquence**, sans verrou technique. V1 → V2 → V3, C1 → C2 et V3 → Financement restent visibles comme repères; toutes les missions peuvent avancer en parallèle et devenir la mission actuelle. Les cycles sont refusés dans l’éditeur pour garder les repères lisibles, sans affecter les actions. V1 peut rester à 75% pendant que V2 atteint 100%.

`workState` est optionnel (`waiting` ou `paused`) avec un motif `waitingReason`. Les contrôles « État de travail » dans la fiche et « Statut » dans l’éditeur ne modifient ni les tâches, ni les XP. Seule la commande explicitement nommée « Réouvrir et décocher toutes les actions » remet les tâches à zéro. Une mission terminée s’affiche toujours COMPLETED. Si la mission actuelle attend une réponse ou est en pause, la prochaine action propose une autre mission, en privilégiant une suite recommandée; les missions en attente/pause sont ignorées par la suggestion automatique, mais restent sélectionnables et checkables. Quand toutes les missions restantes sont en attente, elles restent visibles sans annoncer à tort la fin de la saison.

Compatibilité : clé et schéma v1 conservés. Les anciens fichiers sans `workState` ni `waitingReason` restent valides et n’ont pas besoin de migration destructive. Aucune tâche, note, date de complétion ou sélection courante n’est réinitialisée.

Les jalons sans tâches détaillées dans le brief ont des critères de validation explicites. Les jalons de financement sont validés manuellement après confirmation réelle; la jauge est éditable indépendamment. Sarah n’est autonome qu’une fois sa première facture réellement envoyée. Les statuts sont dérivés des tâches, du focus, de l’état de travail et de l’archivage; l’éditeur peut terminer ou réouvrir les tâches en bloc. Le streak compte les dates consécutives de fermeture de missions, heure de Toronto, avec un jour de grâce pour hier; aucune exception week-end. Une date de fermeture disparaît quand la mission est réouverte.

## Édition

Paramètres : saison, dates, libellés/priorités, Worlds, nouvelles missions, bonus, dépendances et ordre. Fiche mission → Modifier : tâches, XP par tâche, titre, objectif, échéance, ordre, dépendances, statut, Boss, archivage. Notes et nouvelle action sont accessibles directement. Un nouveau World reçoit son identité et peut être modifié immédiatement. Le détail de World inclut sa vision et sa carte de progression.

## Déploiement Vercel

Importer le dépôt dans Vercel, sélectionner le preset Next.js et conserver `npm run build`. Aucune variable d’environnement, base de données ou authentification nécessaire. Le dossier est prêt pour le dépôt `dominique-source/purinstinct-mission-control`; aucune publication distante n’est effectuée automatiquement. Les données de localhost ne migrent pas automatiquement vers le domaine publié : exporter puis importer la sauvegarde.

## Limites V1

Mono-utilisateur, sauvegarde locale, pas de rappels push ni de synchronisation. Les notes sont du texte brut. Les sons sont facultatifs et non implémentés; la célébration est visuelle et respecte la réduction des animations. La progression inclut toutes les missions non archivées; elle peut changer lors de l’ajout ou de l’archivage de missions, jamais simplement à cause des dépendances. Le reset demande toujours confirmation.

## Vérification V1

Lint, TypeScript, tests métier et build de production exécutés. Vérification navigateur sur serveur de production : parcours historique V1 → V2 → V3 → Financement (ces séquences sont désormais indicatives); création de World et mission; sélection du focus; persistance des notes et du focus après rafraîchissement; archivage. Vue iPhone 390 × 844 vérifiée sans débordement horizontal. Aucun avertissement ni erreur console sur le parcours de production. Les vérifications ont été isolées du navigateur de travail principal.

L’événement navigateur `purinstinct:mission-complete` expose `missionId`, `xpReward` et `isBoss` pour brancher ultérieurement un son facultatif ou une intégration, sans coupler l’audio au moteur XP.

## Refonte visuelle — référence `new app.png`

La couche de présentation suit désormais le HUD horizontal, la scène sportive photographique, les cadres cyan/or et les tuiles illustrées de la référence approuvée. Le moteur, les données et les sauvegardes sont conservés. Voir [la documentation des visuels](docs/visual-assets.md) pour les assets, les prompts et les décisions de composition. Les illustrations CSS du prototype ont été remplacées sur le dashboard par des WebP locaux optimisés et Next Image.

### Validation de la progression parallèle

12 tests couvrent la disponibilité de toutes les missions, V1 à 75% avec V2 à 100%, les XP et leur retrait, le focus manuel, WAITING/PAUSED, Next Action vers une autre mission, le calcul World/global et le chargement réel d’un ancien payload localStorage sans écriture ni perte. Parcours navigateur sur origine de test isolée : V1 75% WAITING → Next Action V2 → sélection V2 → 100% → rafraîchissement → Vanier 24%, global 4%, total 1 350 XP. Une action F1 avant V3 ajoute bien 50 XP et les retire après décochage. Lint, TypeScript et build de production validés.

### Navigation des missions principales et sous-missions

Les cinq Worlds constituent les missions principales : Vanier, Instinct, Cliniques, Technologie et Financement. `activeWorldId` est le pointeur de sélection du grand encadré; `currentId` reste un pointeur indépendant pour prioriser une sous-mission. Les anciennes sauvegardes v1 sans `activeWorldId` retrouvent leur projet à partir de `currentId`, sans réinitialiser les données. Le champ optionnel est enregistré sur la même clé localStorage.

Toute la surface principale de la carte sélectionne la mission dans le grand encadré sans navigation. Le bouton « Entrer » ouvre `/world/[id]`. Le sélecteur et la vue d’ensemble restent disponibles. Les liens des sous-missions ouvrent `/mission/[id]` sans sélectionner le projet ni promouvoir un enfant dans le grand encadré. Ces actions sont des contrôles frères, sans bouton ou lien imbriqué; aucun handler de navigation n’est attaché au conteneur de carte. Le bouton principal couvre la carte; les liens internes sont placés au-dessus et ne déclenchent que leur propre navigation. Prioriser une sous-mission dans son détail ne change pas le projet actif.

Le grand encadré, les cartes, la vue d’ensemble et la page de projet affichent la progression globale pondérée du projet, calculée depuis toutes ses sous-missions non archivées. Les valeurs individuelles restent indiquées uniquement sur leurs propres lignes. Une sous-mission à 75% ne signifie donc pas que tout son projet est à 75%; ouvrir un enfant à 0% ne remplace jamais le pourcentage global. La progression globale évolue avec les données de travail ou une fermeture manuelle, jamais avec la navigation. Les objectifs principaux sont personnalisables dans les paramètres des Worlds.

Le branding affiché est PürInstinct, avec « Le sport à l’état pur. »; la période de 30 jours demeure éditable dans les paramètres et reste visible sur iPhone.

Validation de la séparation : 16 tests de régression; navigation de carte vers le parcours principal; bouton Entrer ouvrant le parcours sans sélectionner un autre projet; ouverture puis priorité V2 (0%) laissant le projet Vanier et sa progression globale (6% dans le scénario de test) inchangés, avant et après rafraîchissement. Les chiffres de sous-mission et de projet sont volontairement distincts : V1 à 75% ne représente qu’une partie du projet entier. Les données de test ont utilisé une origine locale séparée.

Vérification des zones d’entrée : les cinq en-têtes ciblent leur page de mission, le lien étendu couvre toute la carte hors bordure, le clic sur l’image de Vanier ouvre son parcours, le lien V2 ouvre uniquement sa sous-mission, et Entrée au clavier ouvre Financement. Le bouton Entrer ouvre Instinct. Affichage iPhone à 390 px sans débordement horizontal ni contrôles imbriqués. Lint, TypeScript, compilation et 16 tests réussis.

### Fermeture manuelle et historique

Les missions principales, sous-missions et tâches proposent « Marquer comme complétée », « Marquer comme annulée » et « Réactiver » dans leur détail. Les trois statuts (`active`, `completed`, `cancelled`) sont distincts des états de travail attente/pause. Cocher toutes les actions ne ferme plus une mission nouvelle : la fermeture reste manuelle. Les anciennes sauvegardes conservent leurs complétions déjà acquises; leur statut est explicité dès la prochaine modification, sans effacer les données.

Une mission complétée affiche 100 %, même sans tâche. Ses sous-missions, tâches et cases ne sont pas modifiées. Une annulation conserve la progression des actions. Réactiver restaure le calcul de progression depuis ces actions, avec les notes, dates et l’historique des changements de statut conservés. Les tâches utilisent les mêmes transitions, y compris via leur case à cocher. Aucune fermeture ne supprime ni n’archive automatiquement un enregistrement.

Les missions fermées restent visibles, atténuées et cliquables dans les cartes et parcours, ainsi que dans les missions fermées. Elles sont exclues du navigateur de missions actives, des prochaines actions et des jalons proposés. Le compteur actif exclut les missions complétées et annulées; la vue d’ensemble permet de consulter leur détail. Fermer Instinct / Zone3 à 100 % ne supprime pas Instinct et ne ferme aucune de ses sous-missions. Le bonus XP de sous-mission dépend de sa complétion manuelle; les XP de tâches restent indépendants. Réactiver retire le bonus courant sans effacer l’historique et sans accumuler de bonus lors de fermetures répétées.

Les statuts et événements datés sont enregistrés/exportés dans la sauvegarde locale v1 existante. Validation : 19 tests, lint, TypeScript et compilation; vérifications navigateur de complétion d’Instinct sans modification des enfants, annulation de tâche, complétion de V1 malgré des tâches ouvertes/annulées, réactivation, annulation à 25 %, persistance après rafraîchissement et affichage iPhone à 390 px sans débordement. Tests UI sur une origine locale distincte des données utilisateur.

### Créer une mission depuis Mission Control

« + Nouvelle mission » ouvre un dialogue accessible (focus, Échap, retour au déclencheur) avec nom, objectif, partenaires, type, début, échéance facultative, statut et progression initiale. Après création, la vignette est générée depuis `state.worlds`; une mission active devient la sélection du grand encadré. Une fermeture initiale conserve la carte et son historique sans la proposer comme active par défaut. Les cinq missions initiales restent des données de départ, sans liste de vignettes fixe.

Le clic sur la surface principale sélectionne; « Entrer » ouvre le détail; les liens de sous-mission restent indépendants. Une carte fermée peut être inspectée dans le grand encadré pour la session sans être restaurée dans les missions actives par défaut. Les grilles s’adaptent au nombre de cartes et les nouvelles missions utilisent une illustration de remplacement.

Le détail permet de modifier nom, objectif, partenaires, type, dates et progression, saisir des notes et liens de documents, et créer des sous-missions avec une première tâche facultative. Ouvrir une sous-mission donne accès aux tâches supplémentaires, notes et objectifs éditables existants. La progression manuelle, initialisée par défaut à 0 %, est partagée entre carte, encadré et détail; vider le champ permet de reprendre le calcul pondéré des sous-missions. Les statuts manuels et leur historique continuent de fonctionner. Les sous-missions créées reçoivent 100 XP de bonus et les tâches initiales 50 XP, modifiables dans leur détail.

Les champs sont optionnels dans le schéma v1 pour garder les anciennes sauvegardes compatibles. Les créations et modifications persistent dans le navigateur et dans les exports/imports existants. Les liens affichés acceptent uniquement HTTP(S).

Validation : 20 tests (création, statuts initiaux, progression, sérialisation et préservation des données), lint, TypeScript et compilation; parcours navigateur New Sport / Éric Boucher, ajout d’une sous-mission et de deux tâches, notes, lien de document, progression à 25 %, rafraîchissement, sélection de carte sans navigation, Entrer vers le détail et contrôle iPhone à 390 px sans débordement. Les essais utilisent une origine locale distincte.

### Priorité visuelle par statut

Une seule section Missions contient une rangée de travail (actives d’abord, puis disponibles/en attente) et une rangée historique distincte pour les complétées/annulées. Les archives sont compactes, désaturées et toujours consultables; les actives ont des titres et un contraste plus forts. La collection s’adapte sur mobile sans imposer quatre tableaux.

La sélection du grand encadré (`activeWorldId`) reste une préférence d’affichage. Elle ne définit plus le statut ACTIVE. Les missions ouvertes stockent une activité indépendante : active par défaut, ou `availability: available / waiting`. Ce choix est accessible dans leur détail et à la création. Le compteur de missions actives et les badges utilisent cette même donnée. Réactiver remet explicitement la mission dans la priorité active sans modifier ses enfants ni effacer l’historique.

Le tri est pur : `projectGroups` utilise l’activité et les statuts de fermeture, puis l’ordre enregistré. Aucune règle de placement ne cible un titre ou un identifiant particulier. Les anciens enregistrements sans statut explicite utilisent les valeurs de départ de leur jeu de données pour les disponibilités; les statuts manuels existants restent prioritaires. Les données de départ placent Vanier et Cliniques en cours, et les autres trajectoires initiales en disponibilité tant qu’elles n’ont pas reçu un état explicite. Les créations existantes actives, dont New Sport Doc, restent actives. Une mission déjà complétée ou annulée conserve son état.

Validation : 22 tests; changements disponible → active → annulée → réactivée, tri inchangé par une simple sélection, sauvegarde/restauration et états sans missions ouvertes. Vérification navigateur avec trois actives, deux disponibles et Instinct complétée; contrôle iPhone à 390 px sans débordement, archives bien placées sous la rangée de travail, liens et commandes distincts. Les données de démonstration utilisent une origine locale isolée.

### Retour depuis une tâche / sous-mission

Le bas de chaque détail de sous-mission propose une action principale pleine largeur « Retour à [nom de la mission parente] », sous son message de statut. Après complétion, le message « Tâche complétée » précède ce bouton. La destination vient du parent enregistré (`worldId`), y compris pour les missions créées dans l’interface. La navigation du haut reste disponible et la logique de complétion, d’XP et d’historique est inchangée.

Validation : lint, TypeScript et compilation; navigation réelle vers Vanier, Cliniques et une nouvelle mission New Sport Doc avec identifiant généré. Sur iPhone à 390 px, bouton de 328 × 60 px, sans débordement et accessible au clavier, après fermeture de l’animation de réussite. Les vérifications utilisent une origine locale isolée.

### Contenu opérationnel en premier dans une mission

Le détail d’une mission principale affiche maintenant, dans l’ordre : bloc principal (titre, objectif, statut global et progression), cartes des sous-missions / parcours recommandé, statut d’activité, formulaire d’ajout, puis modification, notes, liens, fermeture/historique et autres contrôles. Les recommandations de séquence et le bloc de financement restent présents plus bas. Cette réorganisation s’applique à toutes les missions, y compris celles créées depuis l’interface; aucun contenu ni comportement de sauvegarde ou de complétion n’est supprimé.

Validation : lint, TypeScript et compilation; ordre DOM vérifié sur Cliniques, ouverture de la première action, ajout d’une sous-mission et conservation des notes après rafraîchissement; contrôle du financement toujours présent après les actions. Sur iPhone à 390 px, première action visible dans le premier écran et aucun débordement horizontal. Essais sur une origine locale isolée.
