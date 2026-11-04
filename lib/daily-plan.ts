import type { State } from "@/types";

export type DailyAction = {
  id: string;
  date: string;
  title: string;
  detail?: string;
  worldId?: string;
  status: "todo" | "done" | "waiting";
  order: number;
  history: {
    at: string;
    event: "done" | "reopened" | "deferred";
    from?: string;
    to?: string;
  }[];
};

export const torontoDay = (date = new Date()) =>
  date.toLocaleDateString("en-CA", { timeZone: "America/Toronto" });

export function nextDay(date: string) {
  const day = new Date(date + "T00:00:00Z");
  day.setUTCDate(day.getUTCDate() + 1);
  return day.toISOString().slice(0, 10);
}

export function validDay(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}

export function validDailyActions(value: unknown): value is DailyAction[] {
  return (
    Array.isArray(value) &&
    value.every(
      (a) =>
        a &&
        typeof a.id === "string" &&
        a.id &&
        validDay(a.date) &&
        typeof a.title === "string" &&
        a.title.trim() &&
        (a.detail === undefined || typeof a.detail === "string") &&
        (a.worldId === undefined || typeof a.worldId === "string") &&
        ["todo", "done", "waiting"].includes(a.status) &&
        Number.isInteger(a.order) &&
        Array.isArray(a.history) &&
        a.history.every(
          (h: DailyAction["history"][number]) =>
            h &&
            Number.isFinite(Date.parse(h.at)) &&
            ["done", "reopened", "deferred"].includes(h.event) &&
            (h.event !== "deferred" || (validDay(h.from) && validDay(h.to))),
        ),
    ) &&
    new Set(value.map((a) => a.id)).size === value.length &&
    value.every((a) => value.filter((b) => b.date === a.date).length <= 4)
  );
}

const normalize = (text: string) =>
  text.trim().toLocaleLowerCase("fr").replace(/\s+/g, " ");

export function mergeDailyActions(
  state: State,
  incoming: DailyAction[],
): DailyAction[] {
  const merged = [...(state.dailyActions ?? [])];
  for (const action of incoming) {
    if (
      merged.some(
        (a) =>
          a.id === action.id ||
          (a.date === action.date &&
            normalize(a.title) === normalize(action.title)),
      )
    )
      continue;
    if (action.worldId && !state.worlds.some((w) => w.id === action.worldId))
      throw new Error("Mission inconnue.");
    if (
      state.missions.some((m) =>
        m.tasks.some((t) => normalize(t.title) === normalize(action.title)),
      )
    ) {
      throw new Error(
        "Cette tâche existe déjà. Utilisez sa case dans la mission.",
      );
    }
    const today = merged.filter((a) => a.date === action.date);
    if (today.length >= 4)
      throw new Error("Le plan contient déjà quatre actions pour cette date.");
    merged.push({
      ...action,
      order: Math.max(0, ...today.map((a) => a.order)) + 1,
    });
  }
  return merged;
}

export function importDailyPlan(raw: string): DailyAction[] {
  const plan = JSON.parse(raw);
  if (
    !plan ||
    !validDay(plan.date) ||
    !Array.isArray(plan.actions) ||
    plan.actions.length > 4 ||
    !plan.actions.every(
      (a: DailyAction) =>
        a &&
        typeof a.id === "string" &&
        a.id.trim() &&
        typeof a.title === "string" &&
        a.title.trim() &&
        (a.detail === undefined || typeof a.detail === "string") &&
        (a.worldId === undefined || typeof a.worldId === "string"),
    ) ||
    new Set(plan.actions.map((a: DailyAction) => a.id)).size !==
      plan.actions.length
  ) {
    throw new Error(
      "JSON invalide. Fournissez une date et au plus quatre actions avec id et titre.",
    );
  }
  return plan.actions.map((a: DailyAction, index: number) => ({
    id: a.id,
    title: a.title,
    detail: a.detail,
    worldId: a.worldId,
    date: plan.date,
    status: "todo",
    order: index + 1,
    history: [],
  }));
}
