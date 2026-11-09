import type { State, Mission } from "@/types";

export const SCHOOL_LETTERS_UPDATE = "school-letters-of-intent-20-v1";
const MISSION_ID = "games-school-letters-20";

export function applySchoolLettersUpdate(state: State): State {
  if (state.contentUpdates?.includes(SCHOOL_LETTERS_UPDATE)) return state;
  if (!state.worlds.some((world) => world.id === "vanier")) return state;

  const alreadyPresent = state.missions.some((mission) => mission.id === MISSION_ID);
  const mission: Mission = {
    id: MISSION_ID,
    worldId: "vanier",
    title: "OBTENIR 20 LETTRES D’INTENTION D’ÉCOLES",
    objective: "Obtenir 20 lettres d’intention distinctes, une par école, comme étape vers 20 contrats PürInstinct Games scolaires.",
    description: "Chaque lettre doit préciser l’école, le nombre d’élèves concernés et l’acceptation du tarif préférentiel de la cohorte pilote : 10 $ par élève, plus frais de déplacement. L’intention est conditionnelle à la confirmation du financement externe (subventions, commanditaires) ou interne (budget de l’école, parents). Une lettre d’intention n’est pas un contrat signé. Cocher une case uniquement après réception d’une lettre réelle, puis renommer la case au nom de l’école et conserver la lettre dans le dossier approprié. Objectif final : 20 lettres d’intention, puis 20 contrats.",
    xpReward: 1000,
    status: "active",
    planningState: "in_progress",
    order: Math.max(0, ...state.missions.filter((m) => m.worldId === "vanier").map((m) => m.order)) + 1,
    dependencies: [],
    notes: "Progression : nombre de lettres reçues sur 20. Ne pas compter les simples courriels d’intérêt ni les contrats non signés comme des lettres reçues.",
    tasks: Array.from({ length: 20 }, (_, i) => ({
      id: `${MISSION_ID}-letter-${String(i + 1).padStart(2, "0")}`,
      title: `Lettre d’intention ${String(i + 1).padStart(2, "0")}/20 — école à confirmer`,
      completed: false,
      status: "active" as const,
      xp: 50,
    })),
  };

  return {
    ...state,
    missions: alreadyPresent ? state.missions : [...state.missions, mission],
    contentUpdates: [...(state.contentUpdates ?? []), SCHOOL_LETTERS_UPDATE],
  };
}
