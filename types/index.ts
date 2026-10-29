export type Task = {
  id: string;
  title: string;
  completed: boolean;
  xp: number;
  custom?: boolean;
  completedAt?: string;
};
export type Mission = {
  id: string;
  worldId: string;
  title: string;
  objective: string;
  description: string;
  xpReward: number;
  tasks: Task[];
  /** Recommended sequence only; never blocks tasks, XP or current mission. */
  dependencies: string[];
  notes: string;
  order: number;
  isBoss?: boolean;
  dueDate?: string;
  archived?: boolean;
  completedAt?: string;
  workState?: "waiting" | "paused";
  waitingReason?: string;
};
export type World = {
  objective?: string;
  id: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  order: number;
  /** Legacy field name retained for save compatibility: World sequence guidance. */
  unlockConditions: string[];
};
export type Settings = {
  seasonTitle: string;
  seasonStart: string;
  seasonEnd: string;
  finalBossDate: string;
  finalBossTitle: string;
  todayLabel: string;
  todayGoal: string;
  nextLabel: string;
  nextGoal: string;
  funding: number;
};
export type State = {
  version: 1;
  worlds: World[];
  missions: Mission[];
  currentId: string;
  /** Selected primary project; separate from the legacy child-focus pointer. */
  activeWorldId?: string;
  settings: Settings;
  finalChecklist: string[];
};
