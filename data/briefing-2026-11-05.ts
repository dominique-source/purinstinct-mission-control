import type { State } from "@/types";
import type { DailyAction } from "@/lib/daily-plan";

export const BRIEFING_20261105_UPDATE = "briefing-2026-11-05-v1";
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
];

export function applyBriefing20261105Update(state: State): State {
  if (state.contentUpdates?.includes(BRIEFING_20261105_UPDATE)) return state;

  // An already customized day belongs to the user. Never reset status or replace it.
  const saved = state.dailyActions ?? [];
  const dayActions = saved.filter((a) => a.date === date);
  const additions = dayActions.length === 0 ? actions : [];

  return {
    ...state,
    dailyActions: [...saved, ...additions],
    contentUpdates: [...(state.contentUpdates ?? []), BRIEFING_20261105_UPDATE],
  };
}
