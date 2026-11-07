import test from "node:test";
import assert from "node:assert/strict";
import {
  defaultSchoolDraft,
  parseSchoolDraft,
  schoolFinance,
  SCHOOL_STORAGE_KEY,
} from "./school-finance";
import { schoolSimulatorAllowed } from "./school-access";
test("CSV reference years reconcile every line item, total, selling price and margin", () => {
  const years = defaultSchoolDraft().years.map(schoolFinance);
  const expected = [
    [1000, 1200, 300, 4000, 1000, 600, 650, 300, 400],
    [0, 600, 150, 3200, 1000, 600, 650, 0, 400],
    [0, 300, 0, 2400, 1000, 600, 650, 0, 400],
  ];
  years.forEach((year, index) =>
    assert.deepEqual(
      year.lineItems.map((item) => item.value),
      expected[index],
    ),
  );
  assert.deepEqual(
    years.map((year) => year.cost),
    [9450, 6600, 5350],
  );
  assert.deepEqual(
    years.map((year) => year.price),
    [14500, 10500, 8500],
  );
  assert.deepEqual(
    years.map((year) => year.profit),
    [5050, 3900, 3150],
  );
  assert.ok(Math.abs(years[0].margin! - 34.8275862) < 0.00001);
});
test("staffing, active and waiting capacity, waves and schedule are independent of pricing", () => {
  const input = defaultSchoolDraft().years[0];
  const result = schoolFinance(input);
  assert.equal(result.minimumStaff, 4);
  assert.equal(input.staff, 5);
  assert.equal(result.activeCapacity, 118);
  assert.equal(result.capacity, 236);
  assert.equal(result.waves, 9);
  assert.equal(result.requiredMinutes, 445);
  assert.equal(result.availableMinutes, 480);
  assert.equal(schoolFinance({ ...input, students: 4000 }).cost, result.cost);
  assert.equal(schoolFinance({ ...input, teachers: 100 }).minimumStaff, 2);
  assert.equal(schoolFinance({ ...input, zones: 0, courts: 0 }).waves, null);
  assert.equal(schoolFinance({ ...input, students: 0 }).waves, 0);
  assert.equal(schoolFinance({ ...input, staff: 4 }).cost, 8650);
});
test("margin pricing handles overrides, zero, loss and invalid target safely", () => {
  const input = {
    ...defaultSchoolDraft().years[0],
    priceOverride: null,
    targetMargin: 40,
  };
  assert.equal(schoolFinance(input).price, 15750);
  assert.equal(schoolFinance(input).margin, 40);
  assert.equal(schoolFinance({ ...input, targetMargin: 100 }).price, null);
  assert.equal(
    schoolFinance({ ...input, targetMargin: 110, priceOverride: 10000 }).price,
    10000,
  );
  assert.equal(schoolFinance({ ...input, priceOverride: 0 }).margin, null);
  assert.equal(schoolFinance({ ...input, priceOverride: 0 }).profit, -9450);
  assert.equal(schoolFinance({ ...input, priceOverride: 9000 }).profit, -450);
});
test("invalid inputs and unknown storage versions cannot enter the calculator", () => {
  const draft = defaultSchoolDraft();
  for (const value of [-1, NaN, Infinity])
    assert.throws(() =>
      schoolFinance({ ...draft.years[0], hourlyCost: value }),
    );
  assert.throws(() => schoolFinance({ ...draft.years[0], staff: 1.5 }));
  assert.throws(() => schoolFinance({ ...draft.years[0], days: 0 }));
  assert.equal(parseSchoolDraft("{}"), null);
  assert.equal(parseSchoolDraft("{broken"), null);
  assert.equal(
    parseSchoolDraft(JSON.stringify({ ...draft, version: 2 })),
    null,
  );
  assert.equal(parseSchoolDraft(JSON.stringify({ ...draft, years: [] })), null);
  assert.deepEqual(parseSchoolDraft(JSON.stringify(draft)), draft);
  assert.notEqual(SCHOOL_STORAGE_KEY, "purinstinct-mission-control-v1");
  const saved = parseSchoolDraft(JSON.stringify(draft))!;
  saved.years[1].staff = 9;
  assert.equal(draft.years[1].staff, 4);
});
test("server gate denies anonymous hosted access even with local switch enabled", () => {
  assert.equal(schoolSimulatorAllowed({}), false);
  assert.equal(schoolSimulatorAllowed({ NODE_ENV: "development" }), false);
  assert.equal(
    schoolSimulatorAllowed({
      NODE_ENV: "production",
      SCHOOL_SIMULATOR_LOCAL: "1",
    }),
    false,
  );
  assert.equal(
    schoolSimulatorAllowed({
      NODE_ENV: "development",
      VERCEL: "1",
      SCHOOL_SIMULATOR_LOCAL: "1",
    }),
    false,
  );
  assert.equal(
    schoolSimulatorAllowed({
      NODE_ENV: "development",
      SCHOOL_SIMULATOR_LOCAL: "1",
    }),
    true,
  );
});
