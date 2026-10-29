import type { State, World } from "@/types";
import {
  complete,
  weighted,
  nextAction,
  sequenceReady,
  actionable,
} from "./engine";
import { createSeed } from "@/data/seed";
import { isClosed, statusLabels, taskLifecycle, transition } from "./lifecycle";
const initialAvailability = new Map(
  createSeed().worlds.map((w) => [w.id, w.availability]),
);
/** Selection is a view preference; activity is stored independently. Legacy defaults are seed data. */
export function projectActivity(world: World) {
  return (
    world.availability ??
    (world.status === undefined
      ? initialAvailability.get(world.id)
      : undefined) ??
    "active"
  );
}
export function projectGroups(state: State) {
  const ordered = [...state.worlds].sort(
    (a, b) => a.order - b.order || a.id.localeCompare(b.id),
  );
  const active = ordered.filter(
    (w) => !isClosed(w) && projectActivity(w) === "active",
  );
  const available = ordered.filter(
    (w) => !isClosed(w) && projectActivity(w) !== "active",
  );
  const archived = ordered.filter(isClosed);
  return { active, available, archived, live: [...active, ...available] };
}
export function changeProjectActivity(
  state: State,
  id: string,
  activity: "active" | "available" | "waiting",
): State {
  const world = state.worlds.find((w) => w.id === id);
  if (!world || isClosed(world)) return state;
  return {
    ...state,
    worlds: state.worlds.map((w) =>
      w.id === id
        ? {
            ...w,
            status: "active",
            availability: activity === "active" ? undefined : activity,
          }
        : w,
    ),
  };
}
/** Reactivation also restores active priority without changing child data. */
export function transitionProject(
  world: World,
  status: "active" | "completed" | "cancelled",
) {
  return {
    ...transition(world, status),
    availability: status === "active" ? undefined : world.availability,
  };
}
const objectives: Record<string, string> = {
  vanier: "BÂTIR L’ÉCOLE FONDATRICE",
  instinct: "SIGNER L’ENTENTE DE PRODUCTION",
  cliniques: "RENDRE LES CLINIQUES AUTONOMES",
  technologie: "OPÉRER SANS DÉPENDRE DE DOMINIQUE",
  financement: "FINANCER L’IMPACT SOCIAL",
};
export const subMissions = (state: State, worldId: string) =>
  state.missions
    .filter((m) => m.worldId === worldId && !m.archived)
    .sort((a, b) => a.order - b.order);
export const projectProgress = (world: World, state: State) =>
  world.status === "completed"
    ? 100
    : (world.manualProgress ?? weighted(subMissions(state, world.id)));
export const projectObjective = (world: World) =>
  world.objective ||
  objectives[world.id] ||
  world.description ||
  world.subtitle;
export function projectBrowser(state: State) {
  const projects = projectGroups(state).live;
  const legacy = state.missions.find((m) => m.id === state.currentId)?.worldId;
  const selected =
    projects.find((w) => w.id === state.activeWorldId) ||
    projects.find((w) => w.id === legacy) ||
    projects[0];
  const index = selected ? projects.findIndex((w) => w.id === selected.id) : 0;
  return { projects, selected, index };
}
export function selectProject(state: State, id: string): State {
  return state.worlds.some((w) => w.id === id)
    ? { ...state, activeWorldId: id }
    : state;
}
export function adjacentProject(state: State, delta: number) {
  const { projects, index } = projectBrowser(state);
  return projects.length
    ? projects[
        (((index + delta) % projects.length) + projects.length) %
          projects.length
      ]
    : undefined;
}
export function projectStatus(world: World) {
  if (isClosed(world)) return statusLabels[world.status!];
  const activity = projectActivity(world);
  return activity === "active"
    ? "ACTIVE"
    : activity === "waiting"
      ? "WAITING"
      : "AVAILABLE";
}
export function projectNextAction(world: World, state: State) {
  if (isClosed(world)) return undefined;
  const ms = subMissions(state, world.id).filter((m) => actionable(m, state));
  const focused = ms.find((m) => m.id === state.currentId && !complete(m));
  const action = focused ? nextAction(focused, state) : undefined;
  if (action?.mission.worldId === world.id) return action;
  const candidates = ms.filter(
    (m) =>
      !complete(m) &&
      !m.workState &&
      m.tasks.some((t) => taskLifecycle(t) === "active"),
  );
  const mission =
    candidates.find((m) => sequenceReady(m, state)) || candidates[0];
  const task = mission?.tasks.find((t) => taskLifecycle(t) === "active");
  return mission && task ? { mission, task } : undefined;
}
/** Child focus is independent from the selected primary project, including old v1 saves. */
export function prioritizeSubMission(state: State, id: string): State {
  return state.missions.some((m) => m.id === id)
    ? {
        ...state,
        activeWorldId: projectBrowser(state).selected?.id,
        currentId: id,
      }
    : state;
}
export const projectReward = (world: World, state: State) =>
  subMissions(state, world.id).reduce((sum, m) => sum + m.xpReward, 0);
