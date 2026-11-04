# Mission Control — Briefing quotidien et réorganisation du financement
Date de cadrage : 4 novembre 2026
Source : décisions confirmées oralement avec Dominique Soucy pendant le briefing matinal.

## Objectif
Le briefing se déclenche uniquement dans ChatGPT par « Pars mon briefing ». Il dure environ 20 minutes, couvre les 48 dernières heures et prépare les prochaines 24 heures. PürInstinct est le focus principal. ChatGPT consulte, lorsque les connexions sont disponibles, conversations, Gmail, Google Calendar et Mission Control. Une rencontre inscrite au calendrier n'est jamais considérée comme ayant eu lieu sans validation. Une seule question à la fois. Ne pas interrompre les réponses vocales; attendre « fin » ou « j'ai fini ». « Stop » signifie arrêt immédiat. Ni conseils stratégiques ni défi spontané; demander permission avant toute réflexion outside the box.

Mission Control ne doit pas simuler un accès à ChatGPT ou à Gmail : le briefing est rédigé en conversation, puis les tâches validées y sont enregistrées via un chemin de synchronisation sûr, à définir et documenter. Ne pas promettre une synchronisation automatique tant qu'elle n'est pas réellement implémentée.

## Bloc prioritaire « PLAN DE MATCH — AUJOURD'HUI »
Placer tout en haut du dashboard, avant le grand encadré des missions. Afficher la date locale America/Toronto et 3 à 4 actions maximum. Chaque action : titre court, détail facultatif, lien éventuel vers une mission existante, statut (à faire, fait, en attente), case à cocher, ordre, identifiant persistant, historique de complétion. Permettre l'ajout, la modification et le report au lendemain (avec historique), sans duplication ni remise à zéro des actions cochées. Conservation après rafraîchissement et export/import. Ne jamais cocher automatiquement à partir d'un courriel ou d'une simple rencontre. Le plan de match quotidien est distinct de la progression XP des missions; si une action correspond exactement à une tâche de mission existante, éviter les doubles entrées ou synchroniser explicitement l'état.

### Premier plan de match : mercredi 4 novembre 2026
1. Finaliser le document de présentation PürInstinct Games scolaires 2027. Document avancé, mais la finalisation reste à faire. Doit ensuite être envoyé aux trois enseignants : Geneviève Adam (École de la Croisée, Laval), Louis-Philippe Rosa (Collège Notre-Dame, localisation à confirmer), Josiane (École Havre-Jeunesse). Ne PAS marquer les envois comme effectués.
2. Faire avancer la grille de coûts des Games scolaires : coûts des intervenants, frais PürInstinct, matériel/AV/DJ/food truck, engagement local, scénarios en fonction de la taille et des ressources de l'école. Objectif aujourd'hui : 30 minutes de travail, pas nécessairement finir.
3. Rencontres du jour : Damien Thuillier, École de l'Horizon, mercredi 4 novembre, 10 h 45–12 h : tout est prêt, faire un suivi demain sur ce qui s'est passé. David Ricca, investisseur, première rencontre à 13 h : tout est prêt, aucune action de préparation; recueillir ensuite résultat et prochaine étape. Ne pas marquer les rencontres comme faites avant confirmation.
4. Préparer la réorganisation Mission Control : financement Vanier et nouveau bloc Funding 750K (travail confié à Codex). Afficher comme action de mise en place, à cocher seulement quand livré et vérifié.

## Suivi écoles
Trois premiers contacts considérés très positifs par Dominique :
- Geneviève Adam, École de la Croisée, Laval : environ 2 000 élèves, 18 enseignants d'éducation physique, nombreux gymnases et espaces sportifs. Intérêt fort. Hypothèse : formation pour les enseignants, conférences, cliniques, Games en avril avec implication de l'équipe.
- Louis-Philippe Rosa, Collège Notre-Dame : échange positif, possible introduction à d'autres enseignants. Localisation mentionnée oralement comme « je crois Rivière-du-Loup », donc non confirmée.
- Josiane, École Havre-Jeunesse : même suivi.
Pour chacun : finaliser et envoyer la documentation, puis organiser une rencontre avec la direction, avec adaptation du modèle et des coûts. Enregistrer la date d'envoi uniquement lorsque confirmée.

## New Sport Doc / Éric Boucher
Rencontre d'environ deux heures tenue le 3 novembre, positive. Le document partagé Casting Master / Dream Team a été réorganisé par Dominique; il a averti Éric par texto, qui a répondu « parfait ». Cette mise à jour est déclarée accomplie, mais aucune autre tâche de casting ne doit être cochée par inférence. Prochaine rencontre à organiser dans les prochains jours, par Zoom ou à Magog. En attente de planification, sans relance agressive ni faux délai.

## Réorganisation de la mission FINANCEMENT actuelle
La mission principale / World existant id « financement » concerne uniquement le financement de l'expérience scolaire de VANIER (fondations, partenaires privés, cibles 15K/20K/40K). Elle ne doit PLUS exister comme carte/onglet principal autonome. Déplacer toutes les sous-missions F1 à F7 sous « vanier » en conservant intégralement IDs, cases cochées, notes, historiques, XP, dépendances et progression. Prévoir une sous-section identifiable « Financement Vanier » sous Vanier pour ne pas mélanger les autres tâches. Retirer la carte principale de l'affichage et de la navigation, sans perdre les données utilisateur et sans supprimer les missions existantes. Ajuster l'ordre des missions, les dépendances et le code qui suppose cinq Worlds ou un world « financement ». Migration versionnée idempotente des sauvegardes localStorage existantes, avec sauvegarde avant migration. Le repo utilise la clé « purinstinct-mission-control-v1 » dans le navigateur : ne pas croire que modifier data/seed.ts suffit.

## NOUVELLE mission principale séparée
Créer un World « FUNDING 750K » avec statut initial **AVAILABLE / non actif**, et progression 0 %. Cible : lever **750 000 $ US** de financement pour PürInstinct Worldwide. Enjeu : achat d'équipement des PürInstinct Games, solidité opérationnelle de la première année, marketing/production de vidéos premium pour les écoles du Québec; possibilités additionnelles pour projets télé et documentaire, sous réserve des décisions et budgets. Ce n'est PAS le budget Vanier. Rendez-vous exploratoire avec David Ricca le 4 novembre à 13 h, sans présumer de son résultat. Créer des sous-missions à cocher, toutes non cochées : (1) préciser utilisation des fonds et budget, (2) mettre à jour deck investisseur, (3) valider structure et modalités de levée, (4) identifier investisseurs pertinents, (5) rencontres et notes, (6) suivi/relances à cadence humaine, (7) engagements confirmés et closing. Pas d'envois automatiques. Aucun rappel quotidien ni suggestion d'action tant que ce World n'est pas activé par Dominique. Ne pas confondre AVAILABLE avec COMPLETED, CANCELLED ou WAITING.

## Critères techniques impératifs
- Vérifier la structure actuelle avant toute modification.
- Aucun effacement de sauvegarde localStorage; sauvegarde de secours et migration idempotente.
- Idempotence sur plusieurs rechargements, conservation des statuts et des XP.
- Le plan quotidien doit être modifiable facilement, mobile-first, intégré au style existant.
- Si aucune API sécurisée de Mission Control n'existe, proposer un import JSON « plan de match » copiable depuis ChatGPT, avec prévisualisation et confirmation avant application. Ne jamais coder de connexion simulée. Ne jamais exposer de secret en frontend.
- Ne pas modifier ni fermer d'autres projets (INSTINCT, CLINIQUES, TECHNOLOGIE, NEW SPORT DOC).
- Vérifier npm run lint, npm run typecheck, npm test, npm run build; ajouter des tests ciblés migration/plan du jour.
- Documenter la procédure ChatGPT → Mission Control, les limites réelles et tout geste manuel restant.
- Éviter les slogans ajoutés et tout texte marketing inventé.
