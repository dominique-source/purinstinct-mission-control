import { createSeed } from "@/data/seed";
import type { State } from "@/types";
export const STORAGE_KEY = "purinstinct-mission-control-v1";
export function isState(value: unknown): value is State {
  if (!value || typeof value !== "object") return false;
  const s = value as State;
  if (
    s.version !== 1 ||
    !Array.isArray(s.worlds) ||
    !Array.isArray(s.missions) ||
    !Array.isArray(s.finalChecklist) ||
    !s.settings ||
    typeof s.currentId !== "string"
  )
    return false;
  if (
    !s.worlds.length ||
    s.worlds.some(
      (w) =>
        !w ||
        typeof w.id !== "string" ||
        typeof w.title !== "string" ||
        typeof w.subtitle !== "string" ||
        typeof w.description !== "string" ||
        typeof w.accent !== "string" ||
        !Array.isArray(w.unlockConditions),
    )
  )
    return false;
  if (
    new Set(s.worlds.map((w) => w.id)).size !== s.worlds.length ||
    new Set(s.missions.map((m) => m.id)).size !== s.missions.length
  )
    return false;
  if (
    s.missions.some(
      (m) =>
        !m ||
        typeof m.id !== "string" ||
        typeof m.title !== "string" ||
        typeof m.objective !== "string" ||
        typeof m.notes !== "string" ||
        !Number.isFinite(m.order) ||
        !Number.isFinite(m.xpReward) ||
        m.xpReward < 0 ||
        !s.worlds.some((w) => w.id === m.worldId) ||
        (m.workState !== undefined &&
          m.workState !== "waiting" &&
          m.workState !== "paused") ||
        (m.waitingReason !== undefined &&
          typeof m.waitingReason !== "string") ||
        !Array.isArray(m.dependencies) ||
        !Array.isArray(m.tasks) ||
        m.tasks.some(
          (t) =>
            !t ||
            typeof t.id !== "string" ||
            typeof t.title !== "string" ||
            typeof t.completed !== "boolean" ||
            !Number.isFinite(t.xp) ||
            t.xp < 0,
        ),
    )
  )
    return false;
  const defaults = createSeed().settings;
  if (
    Object.keys(defaults).some(
      (k) =>
        typeof s.settings[k as keyof typeof defaults] !==
        typeof defaults[k as keyof typeof defaults],
    )
  )
    return false;
  return ["seasonStart", "seasonEnd", "finalBossDate"].every((k) =>
    Number.isFinite(new Date(s.settings[k as "seasonStart"]).getTime()),
  );
}
type Snapshot = { state: State; ready: boolean; error: string };
const serverSnapshot: Snapshot = {
  state: createSeed(),
  ready: false,
  error: "",
};
let snapshot = serverSnapshot;
let initialized = false;
const listeners = new Set<() => void>();
export const getSnapshot = () => snapshot;
export const getServerSnapshot = () => serverSnapshot;
function emit() {
  listeners.forEach((fn) => fn());
}
export function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!initialized) {
    initialized = true;
    let state = createSeed(),
      error = "";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: unknown = JSON.parse(raw);
        if (isState(data)) state = data;
        else
          error =
            "Sauvegarde invalide : données initiales affichées. Le fichier existant est conservé.";
      }
    } catch {
      error =
        "Stockage local indisponible ou illisible. Exportez votre progression pour la conserver.";
    }
    snapshot = { state, ready: true, error };
    emit();
  }
  return () => {
    listeners.delete(listener);
  };
}
export function updateState(fn: (s: State) => State) {
  const state = fn(snapshot.state);
  let error = "";
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    error =
      "Stockage indisponible : exportez votre progression pour la conserver.";
  }
  snapshot = { state, ready: true, error };
  emit();
}
