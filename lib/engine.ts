import type { Mission, State, World } from "@/types";
export const complete = (m: Mission) =>
  m.tasks.length > 0 && m.tasks.every((t) => t.completed);
export const progress = (m: Mission) =>
  m.tasks.length
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
  if (complete(m)) return "COMPLETED";
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
    : 0;
}
export const globalProgress = (s: State) =>
  weighted(s.missions.filter((m) => !m.archived));
export function suggest(s: State, excludeId?: string) {
  const candidates = s.missions
    .filter(
      (m) =>
        m.id !== excludeId &&
        !m.archived &&
        !complete(m) &&
        m.tasks.some((t) => !t.completed) &&
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
    s.missions.find(
      (m) => m.id === s.currentId && !m.archived && !complete(m),
    ) ||
    suggest(s) ||
    s.missions.find((m) => !m.archived && !complete(m))
  );
}
export function nextAction(m: Mission | undefined, s: State) {
  const mission = m?.workState ? suggest(s, m.id) : m;
  const task = mission?.tasks.find((t) => !t.completed);
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
