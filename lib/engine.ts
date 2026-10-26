import type { Mission, State, World } from "@/types";
export const complete = (m: Mission) =>
  m.tasks.length > 0 && m.tasks.every((t) => t.completed);
export const progress = (m: Mission) =>
  m.tasks.length
    ? Math.round(
        (m.tasks.filter((t) => t.completed).length / m.tasks.length) * 100,
      )
    : 0;
export const worldLocked = (w: World, s: State) =>
  !w.unlockConditions.every((id) =>
    s.missions.some((m) => m.id === id && complete(m) && !m.archived),
  );
export const locked = (m: Mission, s: State) =>
  worldLocked(
    s.worlds.find((w) => w.id === m.worldId)!,
    s,
  ) ||
  !m.dependencies.every((id) =>
    s.missions.some((p) => p.id === id && complete(p) && !p.archived),
  );
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
  weighted(s.missions.filter((m) => !m.archived && !locked(m, s)));
export const suggest = (s: State) =>
  s.missions.find((m) => !m.archived && !complete(m) && !locked(m, s));
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
