import type { State } from "@/types";
import type { DailyAction } from "@/lib/daily-plan";

export const BRIEFING_20261106_UPDATE = "briefing-2026-11-06-v1";
const date = "2026-11-06";

const actions: DailyAction[] = [
  {
    id: "briefing-20261106-pricing",
    date,
    order: 1,
    title: "Analyser la tarification des Games scolaires",
    detail: "Étudier le Google Sheet : coûts variables selon la taille de l'école et l'engagement des enseignants, prix plancher par scénario, frais administratifs, marge et profit PürInstinct. Comparer des scénarios accessibles, équilibrés et plus rentables. Préparer des chiffres concrets pour la discussion avec Neil et examiner les sources de financement accessibles aux écoles. Ne pas considérer les prix comme décidés.",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
  {
    id: "briefing-20261106-site",
    date,
    order: 2,
    title: "Finaliser la page d’accueil Games scolaires",
    detail: "Préparer une landing page publique autonome qui explique clairement les PürInstinct Games aux professeurs. Désactiver temporairement la navigation vers les autres pages et le bouton APP, sans supprimer le travail existant. Garder une façon de manifester son intérêt. Objectif : site et documentation présentables pour les envois ciblés du lundi 9 novembre.",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
  {
    id: "briefing-20261106-app",
    date,
    order: 3,
    title: "Poursuivre la V1 de l’application Games avec Codex",
    detail: "Les maquettes sont terminées; Codex travaille sur la première version fonctionnelle. Faire correspondre le code aux nouvelles maquettes plutôt qu'aux limites de l'ancienne application. Auditer et réutiliser la lecture RFID et l'association des quelque 100 bracelets existants. Prévoir les saisies sur Android et la saisie manuelle de secours sur ordinateur, avec résultats cohérents, sans doublons.",
    worldId: "technologie",
    status: "todo",
    history: [],
  },
  {
    id: "briefing-20261106-horizon",
    date,
    order: 4,
    title: "Préparer les Games filmés du 17 novembre à l’Horizon",
    detail: "Préparer le pilote avec 14 élèves : tester lecture des bracelets RFID existants, synchronisation des scores, leaderboard en direct et affichage de la télévision depuis le Mac (câble USB-C vers HDMI de 3 m), avec plan de secours manuel. Vérifier sécurité du matériel, connexion réseau et responsables sur place; confirmer l'équipe (dont Gaulin, Cory pour la vidéo et les enseignants).",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
];

export function applyBriefing20261106Update(state: State): State {
  if (state.contentUpdates?.includes(BRIEFING_20261106_UPDATE)) return state;

  const saved = state.dailyActions ?? [];
  const existing = saved.filter((action) => action.date === date);
  const available = Math.max(0, 5 - existing.length);
  const additions = actions
    .filter((action) =>
      !existing.some(
        (savedAction) =>
          savedAction.id === action.id ||
          savedAction.title.trim().toLocaleLowerCase("fr") === action.title.trim().toLocaleLowerCase("fr"),
      ),
    )
    .slice(0, available)
    .map((action, i) => ({
      ...action,
      order: Math.max(0, ...existing.map((existingAction) => existingAction.order)) + i + 1,
    }));

  return {
    ...state,
    dailyActions: [...saved, ...additions],
    contentUpdates: [...(state.contentUpdates ?? []), BRIEFING_20261106_UPDATE],
  };
}
