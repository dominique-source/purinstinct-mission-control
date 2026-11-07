/** Illustrative estimates only. All money is CAD. No student-based pricing. */
export type SchoolYear = {
  students: number;
  zones: number;
  courts: number;
  teachers: number;
  staff: number;
  coordinators: number;
  hours: number;
  hourlyCost: number;
  clinicHours: number;
  trainingHours: number;
  conference: boolean;
  conferenceCost: number;
  transport: number;
  installation: number;
  dj: number;
  balls: number;
  administration: number;
  targetMargin: number;
  priceOverride: number | null;
  days: number;
  waveMinutes: number;
  transitionMinutes: number;
  operatingHours: number;
};
export type SchoolDraft = {
  version: 1;
  years: [SchoolYear, SchoolYear, SchoolYear];
};
export const SCHOOL_STORAGE_KEY = "purinstinct-school-simulator-v1";
const base: SchoolYear = {
  students: 2000,
  zones: 15,
  courts: 2,
  teachers: 15,
  staff: 5,
  coordinators: 2,
  hours: 8,
  hourlyCost: 100,
  clinicHours: 12,
  trainingHours: 3,
  conference: true,
  conferenceCost: 1000,
  transport: 1000,
  installation: 600,
  dj: 650,
  balls: 300,
  administration: 400,
  targetMargin: 35,
  priceOverride: 14500,
  days: 1,
  waveMinutes: 45,
  transitionMinutes: 5,
  operatingHours: 8,
};
export function defaultSchoolDraft(): SchoolDraft {
  return {
    version: 1,
    years: [
      { ...base },
      {
        ...base,
        staff: 4,
        clinicHours: 6,
        trainingHours: 1.5,
        conference: false,
        balls: 0,
        priceOverride: 10500,
      },
      {
        ...base,
        staff: 3,
        clinicHours: 3,
        trainingHours: 0,
        conference: false,
        balls: 0,
        priceOverride: 8500,
      },
    ],
  };
}
const integerFields = [
  "students",
  "zones",
  "courts",
  "teachers",
  "staff",
  "coordinators",
  "days",
];
export function validSchoolYear(value: unknown): value is SchoolYear {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    Object.keys(base).every((key) => {
      const v = record[key];
      if (key === "conference") return typeof v === "boolean";
      if (key === "priceOverride" && v === null) return true;
      return (
        typeof v === "number" &&
        Number.isFinite(v) &&
        v >= 0 &&
        v <= 1e9 &&
        (!integerFields.includes(key) || Number.isInteger(v))
      );
    }) && (record.days as number) >= 1
  );
}
/** Version 1 is validated before hydration. Unknown/future versions are retained by storage. */
export function parseSchoolDraft(raw: string): SchoolDraft | null {
  try {
    const value = JSON.parse(raw);
    if (
      value?.version !== 1 ||
      !Array.isArray(value.years) ||
      value.years.length !== 3 ||
      !value.years.every(validSchoolYear)
    )
      return null;
    return {
      version: 1,
      years: value.years.map((year: SchoolYear) => ({ ...year })),
    };
  } catch {
    return null;
  }
}
export function schoolFinance(input: SchoolYear) {
  if (!validSchoolYear(input))
    throw new RangeError("Hypothèses financières invalides");
  const lineItems = [
    {
      label: "Conférence · coût interne",
      value: input.conference ? input.conferenceCost : 0,
    },
    {
      label: "Cliniques · heures-intervenants",
      value: input.clinicHours * input.hourlyCost,
    },
    {
      label: "Formation des enseignants",
      value: input.trainingHours * input.hourlyCost,
    },
    {
      label: "Personnel des Games",
      value: input.staff * input.hours * input.hourlyCost,
    },
    { label: "Transport et équipement", value: input.transport },
    { label: "Installation et production", value: input.installation },
    { label: "DJ et sonorisation", value: input.dj },
    { label: "Ballons laissés à l’école", value: input.balls },
    { label: "Administration et application", value: input.administration },
  ];
  const cost = lineItems.reduce((sum, item) => sum + item.value, 0);
  const suggestedPrice =
    input.targetMargin < 100 ? cost / (1 - input.targetMargin / 100) : null;
  const price = input.priceOverride ?? suggestedPrice;
  const profit = price === null ? null : price - cost;
  const margin =
    price === null || price === 0 ? null : ((price - cost) / price) * 100;
  const stations = input.zones + input.courts;
  const minimumStaff =
    Math.max(0, stations - input.teachers) + input.coordinators;
  const activeCapacity = input.zones * 6 + input.courts * 14;
  const capacity = activeCapacity * 2;
  const waves = capacity ? Math.ceil(input.students / capacity) : null;
  // Includes transitions between waves, including waves split across days. Conservative estimate.
  const requiredMinutes =
    waves === null
      ? null
      : waves * input.waveMinutes +
        Math.max(0, waves - 1) * input.transitionMinutes;
  const availableMinutes = input.days * input.operatingHours * 60;
  return {
    lineItems,
    cost,
    suggestedPrice,
    price,
    profit,
    margin,
    stations,
    minimumStaff,
    activeCapacity,
    capacity,
    waves,
    requiredMinutes,
    availableMinutes,
  };
}
