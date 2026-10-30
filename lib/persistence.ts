import { createSeed } from "@/data/seed";
import { applyNewSportDoc, NEW_SPORT_UPDATE } from "@/data/new-sport-doc";
import type { MediaBrief, State } from "@/types";
function validLifecycle(item: { status?: unknown; history?: unknown }) {
  const statuses = ["active", "completed", "cancelled"];
  return (
    (item.status === undefined || statuses.includes(item.status as string)) &&
    (item.history === undefined ||
      (Array.isArray(item.history) &&
        item.history.every(
          (e) =>
            e &&
            statuses.includes(e.status) &&
            typeof e.at === "string" &&
            Number.isFinite(Date.parse(e.at)),
        )))
  );
}
function validMediaBrief(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const b = value as MediaBrief;
  return (
    b.version === 1 &&
    typeof b.masterUrl === "string" &&
    typeof b.shortlist === "string" &&
    [b.milestoneIds, b.objectives, b.principles].every(
      (a) => Array.isArray(a) && a.every((v) => typeof v === "string"),
    ) &&
    Array.isArray(b.tiers) &&
    b.tiers.every(
      (t) =>
        t &&
        typeof t.name === "string" &&
        typeof t.label === "string" &&
        typeof t.description === "string" &&
        Number.isInteger(t.count) &&
        t.count >= 0,
    ) &&
    Array.isArray(b.roles) &&
    b.roles.every(
      (r) => r && typeof r.name === "string" && typeof r.details === "string",
    ) &&
    Array.isArray(b.resources) &&
    b.resources.every(
      (r) =>
        r &&
        typeof r.title === "string" &&
        typeof r.status === "string" &&
        typeof r.url === "string",
    ) &&
    Array.isArray(b.activity) &&
    b.activity.every(
      (e) =>
        e &&
        typeof e.text === "string" &&
        typeof e.at === "string" &&
        Number.isFinite(Date.parse(e.at)),
    )
  );
}
export const STORAGE_KEY = "purinstinct-mission-control-v1";
export function isState(value: unknown): value is State {
  if (!value || typeof value !== "object") return false;
  const s = value as State;
  if (
    s.version !== 1 ||
    (s.contentUpdates !== undefined &&
      (!Array.isArray(s.contentUpdates) ||
        s.contentUpdates.some((v) => typeof v !== "string"))) ||
    !Array.isArray(s.worlds) ||
    !Array.isArray(s.missions) ||
    !Array.isArray(s.finalChecklist) ||
    !s.settings ||
    (s.activeWorldId !== undefined && typeof s.activeWorldId !== "string") ||
    typeof s.currentId !== "string"
  )
    return false;
  if (
    !s.worlds.length ||
    s.worlds.some(
      (w) =>
        !w ||
        !validLifecycle(w) ||
        (w.mediaBrief !== undefined && !validMediaBrief(w.mediaBrief)) ||
        (w.availability !== undefined &&
          w.availability !== "available" &&
          w.availability !== "waiting") ||
        [
          w.partners,
          w.projectType,
          w.startDate,
          w.dueDate,
          w.notes,
          w.links,
        ].some((v) => v !== undefined && typeof v !== "string") ||
        (w.manualProgress !== undefined &&
          (!Number.isFinite(w.manualProgress) ||
            w.manualProgress < 0 ||
            w.manualProgress > 100)) ||
        typeof w.id !== "string" ||
        typeof w.title !== "string" ||
        typeof w.subtitle !== "string" ||
        (w.objective !== undefined && typeof w.objective !== "string") ||
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
        !validLifecycle(m) ||
        (m.owner !== undefined && typeof m.owner !== "string") ||
        (m.planningState !== undefined &&
          !["in_progress", "upcoming", "someday", "review_ready"].includes(
            m.planningState,
          )) ||
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
            !validLifecycle(t) ||
            (t.status !== undefined &&
              t.completed !== (t.status === "completed")) ||
            typeof t.id !== "string" ||
            typeof t.title !== "string" ||
            typeof t.completed !== "boolean" ||
            !Number.isFinite(t.xp) ||
            t.xp < 0,
        ),
    )
  )
    return false;
  if (
    s.worlds.some(
      (w) =>
        w.mediaBrief &&
        (new Set(w.mediaBrief.milestoneIds).size !==
          w.mediaBrief.milestoneIds.length ||
          w.mediaBrief.milestoneIds.some(
            (id) => !s.missions.some((m) => m.id === id && m.worldId === w.id),
          )),
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
  state: applyNewSportDoc(createSeed()),
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
    let state = applyNewSportDoc(createSeed()),
      error = "";
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data: unknown = JSON.parse(raw);
        if (isState(data)) {
          state = applyNewSportDoc(data);
          if (state !== data) {
            const backupKey = `${STORAGE_KEY}-before-${NEW_SPORT_UPDATE}`;
            if (!localStorage.getItem(backupKey))
              localStorage.setItem(backupKey, raw);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          }
        } else
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
  const state = applyNewSportDoc(fn(snapshot.state));
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
