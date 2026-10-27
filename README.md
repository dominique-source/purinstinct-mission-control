# PÜRINSTINCT STUDIO — MISSION CONTROL

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
