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
} from "./engine";
test("seed contains five Worlds and 25 real missions, funding starts locked", () => {
  const s = createSeed();
  assert.equal(s.worlds.length, 5);
  assert.equal(s.missions.length, 25);
  assert.equal(worldLocked(s.worlds[4], s), true);
  assert.equal(totalXp(s), 0);
  assert.equal(globalProgress(s), 0);
});
test("task XP and mission bonus reverse correctly and survive serialization", () => {
  const s = createSeed();
  const m = s.missions[0];
  m.tasks[0].completed = true;
  assert.equal(totalXp(s), 50);
  m.tasks.forEach((t) => (t.completed = true));
  assert.equal(complete(m), true);
  assert.equal(totalXp(s), 500);
  assert.equal(totalXp(JSON.parse(JSON.stringify(s))), 500);
  m.tasks[0].completed = false;
  assert.equal(totalXp(s), 150);
});
test("dependencies immediately unlock deck and funding, and relock on reversal", () => {
  const s = createSeed();
  const v1 = s.missions.find((m) => m.id === "V1")!;
  const v2 = s.missions.find((m) => m.id === "V2")!;
  assert.equal(locked(v2, s), true);
  v1.tasks.forEach((t) => (t.completed = true));
  assert.equal(locked(v2, s), false);
  s.missions
    .find((m) => m.id === "V3")!
    .tasks.forEach((t) => (t.completed = true));
  assert.equal(worldLocked(s.worlds[4], s), false);
  assert.equal(
    locked(
      s.missions.find((m) => m.id === "F1")!,
      s,
    ),
    false,
  );
  s.missions.find((m) => m.id === "V3")!.tasks[0].completed = false;
  assert.equal(worldLocked(s.worlds[4], s), true);
});
test("locked and archived missions excluded from global denominator", () => {
  const s = createSeed();
  s.missions
    .filter((m) => !locked(m, s))
    .forEach((m) => m.tasks.forEach((t) => (t.completed = true)));
  const before = globalProgress(s);
  s.missions.push({
    ...s.missions[0],
    id: "excluded",
    dependencies: ["missing"],
    xpReward: 999999,
  });
  assert.equal(globalProgress(s), before);
  s.missions.push({
    ...s.missions[0],
    id: "archive",
    archived: true,
    xpReward: 999999,
  });
  assert.equal(globalProgress(s), before);
});
test("level boundaries and countdown clamp", () => {
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
test("streak counts distinct Toronto completion days and expires after a gap", () => {
  const s = createSeed();
  s.missions[0].tasks.forEach((t) => (t.completed = true));
  s.missions[0].completedAt = "2026-10-26T15:00:00Z";
  s.missions[1].tasks.forEach((t) => (t.completed = true));
  s.missions[1].completedAt = "2026-10-25T15:00:00Z";
  assert.equal(streak(s, new Date("2026-10-26T17:00:00Z")), 2);
  assert.equal(streak(s, new Date("2026-10-29T17:00:00Z")), 0);
});

test("versioned persistence validates round-trips and rejects malformed imports", async () => {
  const { isState } = await import("./persistence");
  const s = createSeed();
  assert.equal(isState(JSON.parse(JSON.stringify(s))), true);
  assert.equal(isState({ ...s, version: 2 }), false);
  assert.equal(isState({ ...s, missions: [{ id: "bad", tasks: [] }] }), false);
  assert.equal(
    isState({ ...s, settings: { ...s.settings, finalBossDate: "invalid" } }),
    false,
  );
});
