import type { State, World, Mission, LifecycleStatus } from "@/types";
import { transition } from "./lifecycle";
export const projectTypes = [
  "Développement",
  "École",
  "Clinique",
  "Technologie",
  "Financement",
  "Média",
  "Autre",
] as const;
export type ProjectInput = {
  title: string;
  objective: string;
  partners: string;
  projectType: string;
  startDate: string;
  dueDate?: string;
  status: LifecycleStatus;
  initialProgress: number;
};
export const todayToronto = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "America/Toronto" });
export function createProject(
  state: State,
  input: ProjectInput,
  id: string,
): State {
  if (
    !input.title.trim() ||
    !input.objective.trim() ||
    state.worlds.some((w) => w.id === id) ||
    !Number.isFinite(input.initialProgress) ||
    input.initialProgress < 0 ||
    input.initialProgress > 100 ||
    !["active", "completed", "cancelled"].includes(input.status) ||
    !projectTypes.includes(
      input.projectType as (typeof projectTypes)[number],
    ) ||
    !validDate(input.startDate) ||
    (input.dueDate &&
      (!validDate(input.dueDate) || input.dueDate < input.startDate))
  )
    return state;
  const world: World = transition<World>(
    {
      id,
      status: "active",
      number: String(state.worlds.length + 1).padStart(2, "0"),
      title: input.title.trim(),
      objective: input.objective.trim(),
      partners: input.partners.trim(),
      projectType: input.projectType,
      startDate: input.startDate,
      dueDate: input.dueDate || undefined,
      manualProgress: input.initialProgress,
      subtitle: input.partners.trim()
        ? `Avec ${input.partners.trim()}`
        : input.projectType,
      description: "",
      accent: "#48a7ff",
      order: Math.max(0, ...state.worlds.map((w) => w.order)) + 1,
      unlockConditions: [],
      notes: "",
      links: "",
    },
    input.status,
  );
  return {
    ...state,
    worlds: [...state.worlds, world],
    activeWorldId: input.status === "active" ? id : state.activeWorldId,
  };
}
export function validDate(value: string) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function addSubMission(
  state: State,
  worldId: string,
  title: string,
  id: string,
  taskTitle = "",
): State {
  if (
    !title.trim() ||
    !state.worlds.some((w) => w.id === worldId) ||
    state.missions.some((m) => m.id === id)
  )
    return state;
  const mission: Mission = {
    id,
    worldId,
    title: title.trim(),
    objective: title.trim(),
    description: "",
    xpReward: 100,
    dependencies: [],
    notes: "",
    status: "active",
    order:
      Math.max(
        0,
        ...state.missions
          .filter((m) => m.worldId === worldId)
          .map((m) => m.order),
      ) + 1,
    tasks: taskTitle.trim()
      ? [
          {
            id: `${id}-task`,
            title: taskTitle.trim(),
            completed: false,
            xp: 50,
            status: "active",
          },
        ]
      : [],
  };
  return { ...state, missions: [...state.missions, mission] };
}
