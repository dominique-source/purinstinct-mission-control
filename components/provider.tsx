"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { State, Mission } from "@/types";
import { complete, locked } from "@/lib/engine";
import {
  getSnapshot,
  getServerSnapshot,
  subscribe,
  updateState,
} from "@/lib/persistence";
type Store = {
  state: State;
  update: (fn: (s: State) => State) => void;
  patchMission: (id: string, patch: Partial<Mission>) => void;
  toggleTask: (mid: string, tid: string) => void;
  ready: boolean;
  error: string;
};
const Context = createContext<Store | null>(null);
export function StudioProvider({ children }: { children: ReactNode }) {
  const { state, ready, error } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [celebration, setCelebration] = useState<Mission | null>(null);
  useEffect(() => {
    if (!celebration) return;
    const timer = setTimeout(() => setCelebration(null), 4500);
    return () => clearTimeout(timer);
  }, [celebration]);
  const patchMission = (id: string, patch: Partial<Mission>) => {
    const previous = getSnapshot().state.missions.find((m) => m.id === id);
    if (!previous) return;
    const changed = { ...previous, ...patch };
    changed.completedAt = complete(changed)
      ? previous.completedAt || new Date().toISOString()
      : undefined;
    if (complete(changed) && !complete(previous)) {
      setCelebration(changed);
      window.dispatchEvent(
        new CustomEvent("purinstinct:mission-complete", {
          detail: {
            missionId: id,
            xpReward: changed.xpReward,
            isBoss: !!changed.isBoss,
          },
        }),
      );
    }
    updateState((s) => ({
      ...s,
      missions: s.missions.map((m) => (m.id === id ? changed : m)),
    }));
  };
  const toggleTask = (mid: string, tid: string) => {
    const latest = getSnapshot().state;
    const previous = latest.missions.find((m) => m.id === mid);
    if (!previous || locked(previous, latest)) return;
    patchMission(mid, {
      tasks: previous.tasks.map((t) =>
        t.id === tid
          ? {
              ...t,
              completed: !t.completed,
              completedAt: !t.completed ? new Date().toISOString() : undefined,
            }
          : t,
      ),
    });
  };
  return (
    <Context.Provider
      value={{
        state,
        update: updateState,
        patchMission,
        toggleTask,
        ready,
        error,
      }}
    >
      {error && (
        <div className="storage-warning" role="alert">
          {error}
        </div>
      )}
      {children}
      {celebration && (
        <div
          className={`achievement ${celebration.isBoss ? "boss-achievement" : ""}`}
          role="status"
        >
          <span>✧ MISSION COMPLETE</span>
          <strong>{celebration.title}</strong>
          <b>+ {celebration.xpReward} XP · BONUS MISSION</b>
          <button onClick={() => setCelebration(null)}>Continuer →</button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useStudio() {
  const value = useContext(Context);
  if (!value) throw Error("StudioProvider requis");
  return value;
}
