import type { Mission, State, World } from "@/types";
import { missionLifecycle, taskLifecycle, isClosed } from "./lifecycle";
export const complete = (m: Mission) => missionLifecycle(m) === "completed";
export const missionClosed = (m: Mission) => missionLifecycle(m) !== "active";
export const actionable = (m: Mission, s: State) =>
  !m.archived &&
  !missionClosed(m) &&
  !isClosed(s.worlds.find((w) => w.id === m.worldId) || {});
export const progress = (m: Mission) =>
  complete(m)
    ? 100
    : m.tasks.length
      ? Math.round(
          (m.tasks.filter((t) => t.completed).length / m.tasks.length) * 100,
        )
      : 0;
/** Campaign relationships are recommendations, never permission gates. */
export const worldLocked = (w: World, s: State) =>
  !s.worlds.some((world) => world.id === w.id);
export const locked = (m: Mission, s: State) =>
  !s.worlds.some((world) => world.id === m.worldId);
export const recommendedAfter = (m: Mission, s: State) => [
  ...new Set([
    ...(s.worlds.find((w) => w.id === m.worldId)?.unlockConditions || []),
    ...m.dependencies,
  ]),
];
export const sequenceReady = (m: Mission, s: State) =>
  recommendedAfter(m, s).every((id) =>
    s.missions.some((p) => p.id === id && complete(p)),
  );
export function missionStatus(m: Mission, s: State) {
  if (m.archived) return "ARCHIVED";
  if (complete(m)) return "COMPLÉTÉE";
  if (missionLifecycle(m) === "cancelled") return "ANNULÉE";
  if (m.workState === "waiting") return "WAITING";
  if (m.workState === "paused") return "PAUSED";
  return s.currentId === m.id ? "ACTIVE" : "AVAILABLE";
}
export const missionXp = (m: Mission) =>
  m.tasks.reduce((a, t) => a + (t.completed ? t.xp : 0), 0) +
  (complete(m) ? m.xpReward : 0);
export const totalXp = (s: State) =>
  s.missions.reduce((a, m) => a + missionXp(m), 0);
export const thresholds = [0, 1000, 2500, 4500, 7000, 10000, 14000];
export function level(xp: number) {
  const index = thresholds.findLastIndex((t) => xp >= t);
  return {
    level: index + 1,
    min: thresholds[index],
    next: thresholds[index + 1] ?? null,
    percent:
      index === 6
        ? 100
        : Math.round(
            ((xp - thresholds[index]) /
              (thresholds[index + 1] - thresholds[index])) *
              100,
          ),
  };
}
export function weighted(ms: Mission[]) {
  const weight = ms.reduce((a, m) => a + m.xpReward, 0);
  return weight
    ? Math.round(ms.reduce((a, m) => a + progress(m) * m.xpReward, 0) / weight)
    : ms.length
      ? Math.round(ms.reduce((sum, m) => sum + progress(m), 0) / ms.length)
      : 0;
}
export const globalProgress = (s: State) => {
  const worlds = s.worlds.map((w) => ({
    value:
      w.status === "completed"
        ? 100
        : (w.manualProgress ??
          weighted(
            s.missions.filter((m) => m.worldId === w.id && !m.archived),
          )),
    weight: Math.max(
      1,
      s.missions
        .filter((m) => m.worldId === w.id && !m.archived)
        .reduce((sum, m) => sum + m.xpReward, 0),
    ),
  }));
  return Math.round(
    worlds.reduce((sum, w) => sum + w.value * w.weight, 0) /
      Math.max(
        1,
        worlds.reduce((sum, w) => sum + w.weight, 0),
      ),
  );
};
export function suggest(s: State, excludeId?: string) {
  const candidates = s.missions
    .filter(
      (m) =>
        m.id !== excludeId &&
        actionable(m, s) &&
        m.tasks.some((t) => taskLifecycle(t) === "active") &&
        !m.workState &&
        !locked(m, s),
    )
    .sort(
      (a, b) =>
        (s.worlds.find((w) => w.id === a.worldId)?.order || 0) -
          (s.worlds.find((w) => w.id === b.worldId)?.order || 0) ||
        a.order - b.order,
    );
  const waiting = s.missions.find(
    (m) => m.id === (excludeId || s.currentId) && m.workState,
  );
  return (
    (waiting &&
      candidates.find((m) => recommendedAfter(m, s).includes(waiting.id))) ||
    candidates.find((m) => sequenceReady(m, s)) ||
    candidates[0]
  );
}
export function currentMission(s: State) {
  return (
    s.missions.find((m) => m.id === s.currentId && actionable(m, s)) ||
    suggest(s) ||
    s.missions.find((m) => actionable(m, s))
  );
}
export function nextAction(m: Mission | undefined, s: State) {
  const mission =
    m && actionable(m, s) ? (m.workState ? suggest(s, m.id) : m) : undefined;
  const task = mission?.tasks.find((t) => taskLifecycle(t) === "active");
  return task && mission ? { mission, task } : undefined;
}
export function countdown(date: string, now: number) {
  const minutes = Math.max(
    0,
    Math.floor((new Date(date).getTime() - now) / 60000),
  );
  return {
    days: Math.floor(minutes / 1440),
    hours: Math.floor((minutes % 1440) / 60),
    minutes: minutes % 60,
  };
}
export function streak(s: State, now = new Date()) {
  const dates = [
    ...new Set(
      s.missions
        .filter((m) => complete(m) && m.completedAt)
        .map((m) =>
          new Date(m.completedAt!).toLocaleDateString("en-CA", {
            timeZone: "America/Toronto",
          }),
        ),
    ),
  ]
    .sort()
    .reverse();
  let count = 0;
  const cursor = new Date(
    now.toLocaleDateString("en-CA", { timeZone: "America/Toronto" }) +
      "T12:00:00Z",
  );
  if (dates[0] !== cursor.toISOString().slice(0, 10))
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (dates.includes(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}
