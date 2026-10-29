import type { Lifecycle, LifecycleStatus, Mission, Task } from "@/types";
export const statusLabels = {
  active: "ACTIVE",
  completed: "COMPLÉTÉE",
  cancelled: "ANNULÉE",
};
/** Old saves retain already earned completion; new edits always use explicit status. */
export function missionLifecycle(m: Mission): LifecycleStatus {
  return (
    m.status ??
    (m.tasks.length > 0 && m.tasks.every((t) => t.completed)
      ? "completed"
      : "active")
  );
}
export const taskLifecycle = (t: Task): LifecycleStatus =>
  t.status ?? (t.completed ? "completed" : "active");
export const isClosed = (item: Lifecycle) =>
  item.status === "completed" || item.status === "cancelled";
export function transition<T extends Lifecycle>(
  item: T,
  status: LifecycleStatus,
  at = new Date().toISOString(),
): T {
  if ((item.status || "active") === status) return item;
  return {
    ...item,
    status,
    history: [
      ...(item.history ||
        (isClosed(item)
          ? [{ status: item.status!, at: item.completedAt || at }]
          : [])),
      { status, at },
    ],
    ...(status === "completed" ? { completedAt: at } : {}),
  };
}
export function transitionTask(
  task: Task,
  status: LifecycleStatus,
  at?: string,
): Task {
  return {
    ...transition({ ...task, status: taskLifecycle(task) }, status, at),
    completed: status === "completed",
  };
}
export function transitionMission(
  m: Mission,
  status: LifecycleStatus,
): Mission {
  return {
    ...transition({ ...m, status: missionLifecycle(m) }, status),
    archived: false,
    workState: status === "active" ? undefined : m.workState,
  };
}
