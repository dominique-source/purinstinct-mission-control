import type { State } from "@/types";
import type { DailyAction } from "@/lib/daily-plan";

export const BRIEFING_20261109_THREE_UPDATE = "briefing-2026-11-09-three-priorities-v1";
const date = "2026-11-09";

const priorities: Omit<DailyAction, "order">[] = [
  {
    id: "briefing-20261109-school-offer",
    date,
    title: "Finaliser la présentation de l'offre pilote Games scolaires",
    detail: "Intégrer à la présentation et au site l'offre globale sur plus d'un mois : tarif régulier 25 $/élève, tarif cohorte pilote 10 $/élève + frais de déplacement (réduction commerciale de 60 % avant déplacement). Présenter les composantes déjà définies, anticiper l'objection sur le prix avec empathie, expliquer le financement direct de l'école ou par subventions et partenaires sans garantie. Vérifier la cohérence des chiffres, sans réinventer le programme.",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
  {
    id: "briefing-20261109-school-followup",
    date,
    title: "Centraliser le suivi des écoles et des professeurs contactés",
    detail: "Créer ou finaliser le Google Sheet de prospection à partir des vrais courriels Gmail : environ 36 professeurs contactés à vérifier, réponses, intérêt, rencontres, documents envoyés, prochaines actions et dates de relance. Dédupliquer les fils, ajouter les liens sources, puis identifier les priorités de suivi. Aucun courriel envoyé automatiquement.",
    worldId: "vanier",
    status: "todo",
    history: [],
  },
];

export function applyBriefing20261109ThreeUpdate(state: State): State {
  if (state.contentUpdates?.includes(BRIEFING_20261109_THREE_UPDATE)) return state;
  const dailyActions = [...(state.dailyActions ?? [])];
  for (const action of priorities) {
    if (dailyActions.some((saved) => saved.id === action.id ||
      (saved.date === action.date && saved.title.trim().toLocaleLowerCase("fr") === action.title.trim().toLocaleLowerCase("fr")))) continue;
    const sameDay = dailyActions.filter((item) => item.date === date);
    if (sameDay.length >= 5) break;
    dailyActions.push({
      ...action,
      order: Math.max(0, ...sameDay.map((item) => item.order)) + 1,
    });
  }
  return {
    ...state,
    dailyActions,
    contentUpdates: [...(state.contentUpdates ?? []), BRIEFING_20261109_THREE_UPDATE],
  };
}
