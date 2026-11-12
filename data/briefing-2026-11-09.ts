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

function applyNovember9Priorities(state: State): State {
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

const NOVEMBER_12_UPDATE = "briefing-2026-11-12-school-letter-v1";

function applyNovember12Letter(state: State): State {
  const previous = applyNovember9Priorities(state);
  if (previous.contentUpdates?.includes(NOVEMBER_12_UPDATE)) return previous;
  const dailyActions = [...(previous.dailyActions ?? [])];
  const date = "2026-11-12";
  const id = "briefing-20261112-school-letter-template";
  const title = "Préparer le modèle de lettre d’intention pour les écoles";
  const sameDay = dailyActions.filter((a) => a.date === date);
  if (!previous.worlds.some((w) => w.id === "vanier")) return previous;
  if (!dailyActions.some((a) => a.id === id || (a.date === date && a.title.trim().toLocaleLowerCase("fr") === title.toLocaleLowerCase("fr")))) {
    if (sameDay.length >= 5) return previous;
    dailyActions.push({
      id, date, title, worldId: "vanier", status: "todo", history: [],
      order: Math.min(0, ...sameDay.map((a) => a.order)) - 1,
      detail: "Après le briefing, rédiger ensemble un modèle d’une page facile à remplir et signer, prêt pour la rencontre avec Vanier le 13 novembre. Indiquer l’école, le nombre d’élèves, le tarif pilote de 10 $ par élève (ex. 400 élèves = 4 000 $), les frais de déplacement applicables et une intention de participation conditionnelle à l’obtention du financement nécessaire, notamment les subventions gouvernementales. Prévoir signature de la direction et date. Ne pas rédiger ni envoyer la lettre pendant le briefing.",
    });
  }
  return { ...previous, dailyActions, contentUpdates: [...(previous.contentUpdates ?? []), NOVEMBER_12_UPDATE] };
}

const NOVEMBER_12_SITE_UPDATE = "briefing-2026-11-12-school-site-v1";

export function applyBriefing20261109ThreeUpdate(state: State): State {
  const previous = applyNovember12Letter(state);
  if (previous.contentUpdates?.includes(NOVEMBER_12_SITE_UPDATE)) return previous;
  if (!previous.worlds.some((w) => w.id === "vanier")) return previous;
  const date = "2026-11-12";
  const id = "briefing-20261112-finalize-school-site";
  const title = "Finaliser le site web Games scolaires pour Vanier";
  const dailyActions = [...(previous.dailyActions ?? [])];
  if (!dailyActions.some((a) => a.id === id || (a.date === date && a.title.trim().toLocaleLowerCase("fr") === title.toLocaleLowerCase("fr")))) {
    const sameDay = dailyActions.filter((a) => a.date === date);
    if (sameDay.length >= 5) return previous;
    dailyActions.push({
      id, date, title, worldId: "vanier", status: "todo", history: [],
      order: Math.max(0, ...sameDay.map((a) => a.order)) + 1,
      detail: "Finaliser les derniers détails (environ 1 à 10 %) du site web PürInstinct Games scolaires avant la rencontre Vanier du 13 novembre. Utiliser le site comme présentation principale, courte, visuelle et interactive, plutôt que créer un slide deck. Solliciter l’avis de Neil et, lors de la rencontre amicale avec Charles Cosselin aujourd’hui, recueillir si possible son regard issu de son expérience dans les écoles. Intégrer uniquement les améliorations pertinentes. Aucun envoi automatique ni nouvelle présentation PDF à produire aujourd’hui.",
    });
  }
  return { ...previous, dailyActions, contentUpdates: [...(previous.contentUpdates ?? []), NOVEMBER_12_SITE_UPDATE] };
}
