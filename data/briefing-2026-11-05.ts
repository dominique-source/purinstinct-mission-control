import type { State } from "@/types";
import type { DailyAction } from "@/lib/daily-plan";

export const BRIEFING_20261105_UPDATE = "briefing-2026-11-05-v2";
const date = "2026-11-05";
const actions: DailyAction[] = [
  {
    id: "briefing-20261105-tarification",
    date,
    order: 1,
    title: "Clarifier la tarification des Games scolaires",
    detail: "Recueillir l’avis de Charles sur les budgets et l’acceptabilité des prix pour les écoles, puis partager ses observations avec Neil. Explorer une offre clé en main modulable selon les ressources de chaque établissement. Prix et marge à décider ensuite, pas nécessairement aujourd’hui.",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
  {
    id: "briefing-20261105-site",
    date,
    order: 2,
    title: "Améliorer le site PürInstinct Games scolaires",
    detail: "Rendre le site public clair et convivial pour les professeurs. Préparer la documentation et le lien web en vue des premiers envois ciblés lundi 9 novembre, avant les rencontres scolaires du 10 novembre.",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
  {
    id: "briefing-20261105-charles",
    date,
    order: 3,
    title: "Rencontrer Charles et recueillir son avis",
    detail: "Présenter PürInstinct Games et profiter de son expérience scolaire pour comprendre le processus d’achat, les budgets possibles et la perception du tarif par les directions. Noter ses recommandations pour en parler à Neil.",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
  {
    id: "briefing-20261105-chantal",
    date,
    order: 4,
    title: "Présenter les Games scolaires à Chantal",
    detail: "Rencontre à midi avec Chantal Beaulieu-Chassé : présenter le concept, mesurer son intérêt et demander si elle souhaite recevoir la documentation. Prévoir l’envoi lorsque le dossier et le site seront prêts, cible lundi 9 novembre.",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
  {
    "id": "briefing-20261105-technologie",
    "date": "2026-11-05",
    "order": 5,
    "title": "Démarrer le workflow technologique de l’application Games",
    "detail": "Objectif du jour : commencer avec Codex la conception du parcours complet de l’application scolaire. Prompt à copier dans Codex :\n\nCODEX | PÜRINSTINCT GAMES | ARCHITECTURE TECHNOLOGIQUE — PHASE 1 (CONCEPTION)\n\nContexte : le site public PürInstinct Games est en préparation. Un bouton « APP » doit conduire vers une application web distincte pour organiser des compétitions scolaires gamifiées. Aujourd'hui, NE PAS commencer une refonte visuelle ni inventer des fonctionnalités déjà réalisées : inspecter d'abord le dépôt réel du projet et identifier ce qui existe, ce qui manque et ce qui doit être décidé.\n\nObjectif : produire le workflow complet de bout en bout, utilisable par un organisateur et par les écoles, de la liste des étudiants jusqu'aux scores et classements pendant l'événement.\n\nÉtudier et documenter, dans cet ordre :\n1. Avant l'événement : création école, compétition, classes/équipes/groupes, période de préparation, rôles organisateur/enseignant/animateur et permissions.\n2. Import des participants : coller directement une liste (noms, classes, groupes), ou importer CSV; aperçu, validation, doublons, corrections, consentements nécessaires et identifiants stables. NE PAS exiger la saisie manuelle un par un.\n3. Programmation : catalogue des zones (Speed, Hand Skills, Foot Skills, Agility, Game IQ et terrain principal), épreuves disponibles, règles de rotation, calendrier et affectation des participants. Distinguer les choix déjà établis des questions ouvertes.\n4. Jour J : ouverture du bouton APP depuis le site, identification rapide, accueil des participants, inscription/check-in, attribution et association de bracelets, appareils Android des animateurs, mode déconnecté éventuel, procédure de secours si un bracelet ou le réseau tombe en panne.\n5. Résultats : qui saisit ou valide les points, règles par épreuve, événements horodatés, anti-doublons, corrections auditables, classement individuel/classe/école, affichage LED/leaderboard en direct.\n6. Après l'événement : validation finale, résultats, exports, sauvegarde et gestion de la durée de conservation des données des élèves.\n\nLivrables à créer dans le dépôt de l'application concernée, après identification du BON dépôt :\nA. docs/workflows/games-school-app-v1.md : parcours chronologique avec acteurs, écrans, entrées/sorties, états et exceptions.\nB. docs/workflows/games-school-data-model-v1.md : modèle de données conceptuel et relations (école, événement, joueur, équipe, bracelet, zone, essai, score, classement).\nC. docs/workflows/games-school-open-questions-v1.md : décisions à valider avec Dominique, classées par priorité, dont les technologies bracelets/Android, la confidentialité des mineurs et la logique de pointage.\nD. Une proposition de MVP en petites étapes testables, et des critères d'acceptation.\n\nContraintes : conserver l'identité PürInstinct, éviter la double saisie, privilégier une expérience simple pour le personnel scolaire, envisager les réalités de gymnase et de connectivité. Respecter la confidentialité des données d'enfants : collecte minimale, contrôle d'accès, aucune exposition publique de noms complets sans autorisation, et aucune donnée réelle dans les exemples. Ne présumer ni d'un protocole de bracelet précis ni d'une intégration Android existante. Ne pas modifier l'application en production ni déployer de fonctionnalités pour cette phase. Commencer par l'audit et la documentation; rendre compte de ce qui est confirmé et de ce qui reste hypothétique.",
    "worldId": "vanier",
    "status": "todo",
    "history": []
  },
];

export function applyBriefing20261105Update(state: State): State {
  if (state.contentUpdates?.includes(BRIEFING_20261105_UPDATE)) return state;

  // An already customized day belongs to the user. Never reset status or replace it.
  const saved = state.dailyActions ?? [];
  const dayActions = saved.filter((a) => a.date === date);
  const additions = actions.filter((action) => !dayActions.some((savedAction) => savedAction.id === action.id) && (action.id === "briefing-20261105-technologie" || dayActions.length === 0));

  return {
    ...state,
    dailyActions: [...saved, ...additions],
    contentUpdates: [...(state.contentUpdates ?? []), BRIEFING_20261105_UPDATE],
  };
}
