import { test } from "node:test";
import assert from "node:assert/strict";
import { createSeed } from "../data/seed";
import {
  complete,
  totalXp,
  level,
  globalProgress,
  locked,
  worldLocked,
  countdown,
  streak,
  progress,
  weighted,
  currentMission,
  nextAction,
  suggest,
  missionStatus,
} from "./engine";
function parallelScenario() {
  const s = createSeed();
  const v1 = s.missions.find((m) => m.id === "V1")!;
  const v2 = s.missions.find((m) => m.id === "V2")!;
  v1.tasks.slice(0, 3).forEach((t) => (t.completed = true));
  return { s, v1, v2 };
}
test("all 25 missions and five Worlds are available, including Funding, before any sequence is complete", () => {
  const s = createSeed();
  assert.equal(s.worlds.length, 5);
  assert.equal(s.missions.length, 25);
  assert.ok(s.worlds.every((w) => !worldLocked(w, s)));
  assert.ok(s.missions.every((m) => !locked(m, s)));
  assert.equal(totalXp(s), 0);
  assert.equal(globalProgress(s), 0);
});
test("V1 at 75% permits V2 tasks, task XP, full completion and mission reward", () => {
  const { s, v1, v2 } = parallelScenario();
  assert.equal(progress(v1), 75);
  assert.equal(locked(v2, s), false);
  assert.equal(totalXp(s), 150);
  v2.tasks[0].completed = true;
  assert.equal(totalXp(s), 200);
  v2.tasks.forEach((t) => (t.completed = true));
  assert.equal(progress(v2), 100);
  assert.equal(progress(v1), 75);
  assert.equal(totalXp(s), 1350);
  assert.equal(totalXp(JSON.parse(JSON.stringify(s))), 1350);
  v2.tasks[0].completed = false;
  assert.equal(totalXp(s), 650);
  assert.equal(complete(v2), false);
});
test("V2 may be current even with an incomplete V1", () => {
  const { s, v2 } = parallelScenario();
  s.currentId = "V2";
  assert.equal(currentMission(s)?.id, "V2");
  assert.equal(missionStatus(v2, s), "ACTIVE");
});
test("waiting preserves V1 progress and guides Next Action to V2 without changing focus", () => {
  const { s, v1, v2 } = parallelScenario();
  v1.workState = "waiting";
  v1.waitingReason = "Réponse de Vanier";
  assert.equal(missionStatus(v1, s), "WAITING");
  assert.equal(currentMission(s)?.id, "V1");
  assert.equal(nextAction(v1, s)?.mission.id, "V2");
  assert.equal(nextAction(v1, s)?.task.id, v2.tasks[0].id);
  assert.equal(suggest(s)?.id, "V2");
  assert.equal(progress(v1), 75);
  assert.equal(totalXp(s), 150);
});
test("waiting and paused missions remain actionable, with completed status taking priority", () => {
  const { s, v1, v2 } = parallelScenario();
  v1.workState = "waiting";
  v2.workState = "paused";
  assert.equal(locked(v1, s), false);
  assert.equal(locked(v2, s), false);
  assert.equal(missionStatus(v2, s), "PAUSED");
  assert.notEqual(nextAction(v1, s)?.mission.id, "V2");
  v2.tasks.forEach((t) => (t.completed = true));
  assert.equal(missionStatus(v2, s), "COMPLETED");
  assert.equal(totalXp(s), 1350);
});
test("all-waiting campaign is not mistaken for season complete and has no fabricated next task", () => {
  const s = createSeed();
  s.missions.forEach((m) => (m.workState = "waiting"));
  assert.equal(suggest(s), undefined);
  assert.equal(currentMission(s)?.id, "V1");
  assert.equal(nextAction(currentMission(s), s), undefined);
  s.missions[0].archived = true;
  assert.ok(currentMission(s));
});
test("World and global progress include recommended, waiting and paused missions, excluding only archives", () => {
  const { s, v1, v2 } = parallelScenario();
  v1.workState = "waiting";
  v2.workState = "paused";
  v2.tasks.forEach((t) => (t.completed = true));
  assert.equal(weighted(s.missions.filter((m) => m.worldId === "vanier")), 24);
  const expected = Math.round(
    (75 * 300 + 100 * 650) / s.missions.reduce((sum, m) => sum + m.xpReward, 0),
  );
  assert.equal(globalProgress(s), expected);
  const before = globalProgress(s);
  s.missions.forEach((m) => (m.dependencies = ["missing"]));
  s.worlds.forEach((w) => (w.unlockConditions = ["missing"]));
  assert.equal(globalProgress(s), before);
  s.missions.push({
    ...s.missions[0],
    id: "archive",
    archived: true,
    xpReward: 999999,
  });
  assert.equal(globalProgress(s), before);
});
test("unchecking correctly reverses task XP and mission bonus", () => {
  const s = createSeed(),
    m = s.missions[0];
  m.tasks[0].completed = true;
  assert.equal(totalXp(s), 50);
  m.tasks.forEach((t) => (t.completed = true));
  assert.equal(totalXp(s), 500);
  m.tasks[0].completed = false;
  assert.equal(totalXp(s), 150);
});
test("existing v1 progress, notes, completion dates, current mission and custom tasks survive without migration", async () => {
  const { isState } = await import("./persistence");
  const { s, v1, v2 } = parallelScenario();
  v1.notes = "À conserver";
  v1.tasks[0].completedAt = "2026-10-26T15:00:00Z";
  v2.tasks.push({
    id: "custom",
    title: "Action personnalisée",
    completed: true,
    xp: 100,
    custom: true,
  });
  s.currentId = "V2";
  const restored = JSON.parse(JSON.stringify(s));
  assert.equal(isState(restored), true);
  assert.equal(JSON.stringify(restored), JSON.stringify(s));
  assert.equal(totalXp(restored), totalXp(s));
  assert.equal(currentMission(restored)?.id, "V2");
  v1.workState = "waiting";
  v1.waitingReason = "Réponse externe";
  assert.equal(isState(JSON.parse(JSON.stringify(s))), true);
  assert.equal(isState({ ...s, version: 2 }), false);
  assert.equal(isState({ ...s, missions: [{ id: "bad", tasks: [] }] }), false);
  assert.equal(
    isState({ ...s, settings: { ...s.settings, finalBossDate: "invalid" } }),
    false,
  );
  assert.equal(
    isState({ ...s, missions: [{ ...v1, workState: "invalid" }] }),
    false,
  );
});
test("loading a real legacy localStorage payload is lossless and does not write or reset it", async (t) => {
  const { s, v1 } = parallelScenario();
  v1.notes = "Historique utilisateur";
  s.currentId = "V2";
  s.finalChecklist = ["DJ"];
  const payload = JSON.stringify(s);
  let written: string | undefined;
  let writes = 0;
  const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: () => payload,
      setItem: (_key: string, value: string) => {
        written = value;
        writes++;
      },
    },
  });
  t.after(() => {
    if (original) Object.defineProperty(globalThis, "localStorage", original);
    else Reflect.deleteProperty(globalThis, "localStorage");
  });
  const store = await import("./persistence");
  const unsubscribe = store.subscribe(() => {});
  t.after(unsubscribe);
  assert.equal(store.getSnapshot().ready, true);
  assert.equal(store.getSnapshot().error, "");
  assert.deepEqual(store.getSnapshot().state, JSON.parse(payload));
  assert.equal(writes, 0);
  store.updateState((state) => ({
    ...state,
    missions: state.missions.map((m) =>
      m.id === "V1"
        ? { ...m, workState: "waiting", waitingReason: "Réponse de Vanier" }
        : m,
    ),
  }));
  const saved = JSON.parse(written!);
  assert.equal(saved.currentId, "V2");
  assert.equal(saved.missions[0].notes, "Historique utilisateur");
  assert.equal(progress(saved.missions[0]), 75);
  assert.deepEqual(saved.finalChecklist, ["DJ"]);
  assert.equal(totalXp(saved), totalXp(s));
  assert.equal(saved.missions[0].workState, "waiting");
});
test("level boundaries and countdown clamp unchanged", () => {
  assert.equal(level(999).level, 1);
  assert.equal(level(1000).level, 2);
  assert.equal(level(14000).level, 7);
  assert.equal(level(14000).percent, 100);
  assert.deepEqual(
    countdown(
      "2027-04-15T13:00:00Z",
      new Date("2027-04-14T11:30:00Z").getTime(),
    ),
    { days: 1, hours: 1, minutes: 30 },
  );
  assert.deepEqual(countdown("2020-01-01", Date.now()), {
    days: 0,
    hours: 0,
    minutes: 0,
  });
});
test("streak still counts distinct Toronto completion days", () => {
  const s = createSeed();
  s.missions[0].tasks.forEach((t) => (t.completed = true));
  s.missions[0].completedAt = "2026-10-26T15:00:00Z";
  s.missions[1].tasks.forEach((t) => (t.completed = true));
  s.missions[1].completedAt = "2026-10-25T15:00:00Z";
  assert.equal(streak(s, new Date("2026-10-26T17:00:00Z")), 2);
  assert.equal(streak(s, new Date("2026-10-29T17:00:00Z")), 0);
});

test("primary navigation selects only parent projects and preserves all child data and XP", async () => {
  const { projectBrowser, selectProject, projectProgress } =
    await import("./project-navigation");
  const { s, v1 } = parallelScenario();
  const before = JSON.stringify(s.missions),
    xp = totalXp(s);
  const selected = selectProject(s, "instinct");
  assert.equal(projectBrowser(selected).selected?.id, "instinct");
  assert.equal(selected.currentId, s.currentId);
  assert.equal(JSON.stringify(selected.missions), before);
  assert.equal(totalXp(selected), xp);
  const back = selectProject(selected, "vanier");
  assert.equal(projectProgress(back.worlds[0], back), 6);
  assert.equal(progress(v1), 75);
  assert.equal(selectProject(s, "V2"), s);
});
test("opening or prioritizing a child never promotes it to the primary mission or swaps its percentage", async () => {
  const {
    projectBrowser,
    selectProject,
    prioritizeSubMission,
    projectProgress,
  } = await import("./project-navigation");
  const { s, v2 } = parallelScenario();
  let selected = selectProject(s, "vanier");
  const value = projectProgress(s.worlds[0], selected);
  selected = prioritizeSubMission(selected, "V2");
  assert.equal(projectBrowser(selected).selected?.id, "vanier");
  assert.equal(projectProgress(s.worlds[0], selected), value);
  assert.equal(progress(v2), 0);
  selected = prioritizeSubMission(selected, "I1");
  assert.equal(projectBrowser(selected).selected?.id, "vanier");
  assert.equal(projectProgress(s.worlds[0], selected), value);
  const legacy = prioritizeSubMission(s, "I1");
  assert.equal(projectBrowser(legacy).selected?.id, "vanier");
});
test("legacy saves map child focus to its parent without migration; new parent selection survives refresh", async () => {
  const { isState } = await import("./persistence");
  const { projectBrowser, selectProject, adjacentProject } =
    await import("./project-navigation");
  const s = createSeed();
  s.currentId = "C2";
  assert.equal(isState(s), true);
  assert.equal(projectBrowser(s).selected?.id, "cliniques");
  const restored = JSON.parse(JSON.stringify(selectProject(s, "financement")));
  assert.equal(isState(restored), true);
  assert.equal(projectBrowser(restored).selected?.id, "financement");
  assert.equal(adjacentProject(restored, 1)?.id, "vanier");
  assert.equal(
    projectBrowser({ ...s, activeWorldId: "missing" }).selected?.id,
    "cliniques",
  );
  assert.equal(isState({ ...s, activeWorldId: 3 }), false);
});
test("primary progression changes only with actual work and parent data, never navigation", async () => {
  const {
    projectProgress,
    projectObjective,
    projectStatus,
    selectProject,
    projectNextAction,
  } = await import("./project-navigation");
  const { s, v1, v2 } = parallelScenario();
  const w = s.worlds[0];
  v1.workState = "waiting";
  assert.equal(projectNextAction(w, s)?.mission.id, "V2");
  assert.equal(
    projectProgress(w, s),
    weighted(s.missions.filter((m) => m.worldId === w.id)),
  );
  const before = projectProgress(w, s);
  for (const world of s.worlds)
    assert.equal(projectProgress(w, selectProject(s, world.id)), before);
  v2.tasks[0].completed = true;
  assert.ok(projectProgress(w, s) > before);
  assert.equal(projectObjective(w), "BÂTIR L’ÉCOLE FONDATRICE");
  assert.equal(
    projectObjective({ ...w, objective: "Objectif édité" }),
    "Objectif édité",
  );
  s.missions
    .filter((m) => m.worldId === w.id)
    .forEach((m) => m.tasks.forEach((t) => (t.completed = true)));
  assert.equal(projectProgress(w, s), 100);
  assert.equal(projectStatus(w, s), "COMPLETED");
});
