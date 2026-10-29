import type { Mission, State } from "@/types";
import { complete, currentMission, locked } from "./engine";
/** All unfinished campaign fronts, including WAITING/PAUSED, remain browsable. */
export function activeMissions(state: State) {
  return state.missions
    .filter((m) => !m.archived && !complete(m) && !locked(m, state))
    .sort(
      (a, b) =>
        (state.worlds.find((w) => w.id === a.worldId)?.order || 0) -
          (state.worlds.find((w) => w.id === b.worldId)?.order || 0) ||
        a.order - b.order,
    );
}
export function missionBrowser(state: State) {
  const missions = activeMissions(state);
  const preferred = currentMission(state);
  const index = Math.max(
    0,
    missions.findIndex((m) => m.id === preferred?.id),
  );
  return { missions, index, selected: missions[index] as Mission | undefined };
}
export function adjacentMission(state: State, delta: number) {
  const { missions, index } = missionBrowser(state);
  return missions.length
    ? missions[
        (((index + delta) % missions.length) + missions.length) %
          missions.length
      ]
    : undefined;
}
/** The overview shows the same Mission object as the hero, never a World average. */
export function overviewMission(state: State, worldId: string) {
  const { missions, selected } = missionBrowser(state);
  return (
    (selected?.worldId === worldId
      ? selected
      : missions.find((m) => m.worldId === worldId)) ||
    state.missions
      .filter((m) => m.worldId === worldId && !m.archived)
      .sort((a, b) => a.order - b.order)[0]
  );
}
