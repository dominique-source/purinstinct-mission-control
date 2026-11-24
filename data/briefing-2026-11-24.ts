import type { DailyAction } from "@/lib/daily-plan";
import type { State } from "@/types";

export const BRIEFING_20261124_UPDATE = "briefing-2026-11-24-priorites-v1";
const day = "2026-11-24";

const actions: Omit<DailyAction, "order">[] = [
  {
    id: "briefing-20261124-marcotte",
    date: day, worldId: "financement", status: "todo", history: [],
    title: "Préparer la rencontre du 25 novembre avec John Marcotte",
    detail: "Priorité no 1. Préparer la rencontre avec John (Jonathan) Marcotte concernant le rôle envisagé de Head of Business Development : mandat, responsabilités, attentes, modèle de collaboration, décisions à prendre et prochaines étapes. Aucun accord ni participation au capital n'est présumé conclu.",
  },
  {
    id: "briefing-20261124-budget-inventaire",
    date: day, worldId: "vanier", status: "todo", history: [],
    title: "Consolider l'inventaire et le budget du kit Games 2027",
    detail: "Poursuivre le Google Sheet « PÜRINSTINCT GAMES — Inventaire et budget de lancement 2027 » : https://docs.google.com/spreadsheets/d/1MKK0t5MnEhODOy0zCOmF1bni4rVkfP2HzS4A-RylFEc/edit . Matériel des cinq zones, terrains PürInstinct et logistique; quantités, fournisseurs et soumissions vérifiées. Relier les revenus de 20 écoles (prévision, versements 25 % / 25 % / 50 %, encaissements) au budget global et au besoin de trésorerie. Les estimations ne sont pas des devis confirmés.",
  },
  {
    id: "briefing-20261124-reseau-financement",
    date: day, worldId: "financement", status: "todo", history: [],
    title: "Développer le réseau de commanditaires et d'introductions",
    detail: "Continuer le Google Sheet : Hochelaga Construction, One Rivera (orthographe/identité à confirmer), Charles Fortier, entourage Sur Mesure; cartographier qui présente qui (jusqu'à trois introductions par contact). Structurer les pistes de commanditaires, fondations, partenaires publics et élus de Québec, Chaudière-Appalaches et Portneuf. Ne pas comptabiliser les pistes comme revenus acquis; ne contacter personne sans validation.",
  },
  {
    id: "briefing-20261124-video-youri",
    date: day, worldId: "vanier", status: "waiting", history: [],
    title: "Attendre la livraison de la vidéo de Youri avant les relances",
    detail: "Vidéo promotionnelle espérée jeudi 26 novembre, date non confirmée. Après réception et validation, préparer les suivis auprès des écoles, enseignants et partenaires ainsi que les démarches de financement. Aucun courriel n'est marqué comme envoyé et aucune livraison n'est présumée effectuée.",
  },
  {
    id: "briefing-20261124-nadeau-tremblay",
    date: day, worldId: "vanier", status: "todo", history: [],
    title: "Clarifier les suites avec Luc Nadeau et Benoît Tremblay",
    detail: "Préciser leurs intérêts et contributions possibles à la création des jeux PürInstinct Games et à un documentaire : rôles, livrables, échéances et prochaines rencontres. Aucun engagement n'est considéré comme confirmé. La recherche d'un COO reste secondaire et hors des priorités immédiates. DOM SOUCY MEDIA demeure un chantier distinct.",
  },
];

export function applyBriefing20261124Update(state: State): State {
  if (state.contentUpdates?.includes(BRIEFING_20261124_UPDATE)) return state;
  const dailyActions = [...(state.dailyActions ?? [])];
  for (const action of actions) {
    if (
      dailyActions.some(
        (existing) =>
          existing.id === action.id ||
          (existing.date === day &&
            existing.title.trim().toLocaleLowerCase("fr") ===
              action.title.trim().toLocaleLowerCase("fr")),
      )
    ) continue;
    if (dailyActions.filter((existing) => existing.date === day).length >= 5) break;
    if (action.worldId && !state.worlds.some((world) => world.id === action.worldId)) continue;
    dailyActions.push({
      ...action,
      order: Math.max(0, ...dailyActions.filter((item) => item.date === day).map((item) => item.order)) + 1,
    });
  }
  return {
    ...state,
    dailyActions,
    contentUpdates: [...(state.contentUpdates ?? []), BRIEFING_20261124_UPDATE],
  };
}
