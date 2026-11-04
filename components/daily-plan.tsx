"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStudio } from "./provider";
import {
  importDailyPlan,
  mergeDailyActions,
  nextDay,
  torontoDay,
  validDay,
  type DailyAction,
} from "@/lib/daily-plan";

export function DailyPlan() {
  const { state, update, ready } = useStudio();
  const [today, setToday] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [editing, setEditing] = useState<DailyAction | null>(null);
  const [raw, setRaw] = useState("");
  const [preview, setPreview] = useState<DailyAction[] | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const refresh = () => setToday(torontoDay());
    refresh();
    const timer = setInterval(refresh, 30000);
    return () => clearInterval(timer);
  }, []);
  const date = selectedDate || today;
  const actions = (state.dailyActions ?? [])
    .filter((a) => a.date === date)
    .sort((a, b) => a.order - b.order);
  const deferred = (state.dailyActions ?? []).flatMap((action) =>
    action.history
      .filter((event) => event.event === "deferred" && event.from === date)
      .map((event) => ({ id: action.id, title: action.title, ...event })),
  );
  function apply(change: (s: typeof state) => DailyAction[]) {
    try {
      update((s) => ({ ...s, dailyActions: change(s) }));
      setMessage("Plan enregistré.");
      return true;
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Impossible d’enregistrer le plan.",
      );
      return false;
    }
  }
  function changeStatus(action: DailyAction, status: DailyAction["status"]) {
    apply((s) =>
      (s.dailyActions ?? []).map((a) =>
        a.id !== action.id || a.status === status
          ? a
          : {
              ...a,
              status,
              history:
                status === "done" || a.status === "done"
                  ? [
                      ...a.history,
                      {
                        at: new Date().toISOString(),
                        event: status === "done" ? "done" : "reopened",
                      },
                    ]
                  : a.history,
            },
      ),
    );
  }
  function defer(action: DailyAction) {
    apply((s) => {
      const to = nextDay(action.date);
      const all = s.dailyActions ?? [];
      const destination = all.filter((a) => a.date === to);
      if (destination.length >= 4)
        throw new Error("Le lendemain contient déjà quatre actions.");
      if (
        destination.some(
          (a) =>
            a.title.trim().toLowerCase() === action.title.trim().toLowerCase(),
        )
      )
        throw new Error("Cette action existe déjà le lendemain.");
      return all.map((a) =>
        a.id === action.id
          ? {
              ...a,
              date: to,
              order: Math.max(0, ...destination.map((item) => item.order)) + 1,
              history: [
                ...a.history,
                {
                  at: new Date().toISOString(),
                  event: "deferred",
                  from: a.date,
                  to,
                },
              ],
            }
          : a,
      );
    });
  }
  return (
    <section className="panel daily-plan" aria-labelledby="daily-plan-heading">
      <h2 id="daily-plan-heading">PLAN DE MATCH — AUJOURD’HUI</h2>
      {today && (
        <p>
          {new Intl.DateTimeFormat("fr-CA", {
            dateStyle: "full",
            timeZone: "America/Toronto",
          }).format(new Date(today + "T16:00:00Z"))}
        </p>
      )}
      <form
        className="daily-date"
        onSubmit={(e) => {
          e.preventDefault();
          const requested = new FormData(e.currentTarget).get("date");
          if (validDay(requested)) {
            setSelectedDate(requested);
            setEditing(null);
          }
        }}
      >
        <label>
          Consulter une journée{" "}
          <input
            key={date}
            type="date"
            name="date"
            defaultValue={date}
            required
          />
        </label>
        <button type="submit" className="button secondary">
          Afficher
        </button>
      </form>
      {selectedDate && selectedDate !== today && (
        <button
          type="button"
          className="button secondary"
          onClick={() => {
            setSelectedDate("");
            setEditing(null);
          }}
        >
          Revenir à aujourd’hui
        </button>
      )}
      {ready && date && (
        <ol className="daily-actions">
          {actions.map((action) => (
            <li key={action.id}>
              <label>
                <input
                  type="checkbox"
                  checked={action.status === "done"}
                  onChange={(e) =>
                    changeStatus(action, e.target.checked ? "done" : "todo")
                  }
                />{" "}
                <strong>{action.title}</strong>
              </label>
              {action.detail && <p>{action.detail}</p>}
              {action.worldId &&
                state.worlds.some((w) => w.id === action.worldId) && (
                  <Link href={`/world/${action.worldId}`}>
                    {state.worlds.find((w) => w.id === action.worldId)?.title}
                  </Link>
                )}
              <div className="daily-actions-controls">
                <select
                  aria-label={`Statut de ${action.title}`}
                  value={action.status}
                  onChange={(e) =>
                    changeStatus(
                      action,
                      e.target.value as DailyAction["status"],
                    )
                  }
                >
                  <option value="todo">À faire</option>
                  <option value="done">Fait</option>
                  <option value="waiting">En attente</option>
                </select>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setEditing(action)}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => defer(action)}
                >
                  Reporter au lendemain
                </button>
              </div>
              {!!action.history.length && (
                <details>
                  <summary>Historique</summary>
                  <ul>
                    {action.history.map((event, i) => (
                      <li key={i}>
                        {new Date(event.at).toLocaleString("fr-CA", {
                          timeZone: "America/Toronto",
                        })}{" "}
                        ·{" "}
                        {event.event === "deferred"
                          ? `Report du ${event.from} au ${event.to}`
                          : event.event === "done"
                            ? "Fait"
                            : "Rouvert"}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          ))}
        </ol>
      )}
      {ready && !!deferred.length && (
        <details>
          <summary>Actions reportées depuis cette journée</summary>
          <ul>
            {deferred.map((event) => (
              <li key={event.id + event.at}>
                {event.title} · reportée au {event.to}
              </li>
            ))}
          </ul>
        </details>
      )}
      {ready && date && !actions.length && (
        <p>Aucune action prévue pour cette journée.</p>
      )}
      {ready && date && actions.length < 4 && !editing && (
        <button
          className="button secondary"
          type="button"
          onClick={() =>
            setEditing({
              id: crypto.randomUUID(),
              date,
              title: "",
              status: "todo",
              order: actions.length + 1,
              history: [],
            })
          }
        >
          Ajouter une action
        </button>
      )}
      {editing && (
        <form
          className="fields daily-edit"
          onSubmit={(e) => {
            e.preventDefault();
            if (!editing.title.trim()) return;
            if (
              apply((s) => {
                const old = s.dailyActions?.find((a) => a.id === editing.id);
                const other = (s.dailyActions ?? []).filter(
                  (a) => a.id !== editing.id,
                );
                if (
                  other.some(
                    (a) =>
                      a.date === editing.date &&
                      a.title.trim().toLowerCase() ===
                        editing.title.trim().toLowerCase(),
                  )
                )
                  throw new Error("Cette action existe déjà.");
                const checked = mergeDailyActions(
                  { ...s, dailyActions: other },
                  [editing],
                );
                return old
                  ? (s.dailyActions ?? []).map((a) =>
                      a.id === editing.id
                        ? {
                            ...a,
                            title: editing.title.trim(),
                            detail: editing.detail,
                            worldId: editing.worldId,
                            order: editing.order,
                          }
                        : a,
                    )
                  : checked;
              })
            )
              setEditing(null);
          }}
        >
          <label>
            Titre
            <input
              required
              value={editing.title}
              onChange={(e) =>
                setEditing({ ...editing, title: e.target.value })
              }
            />
          </label>
          <label>
            Détail
            <textarea
              value={editing.detail ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, detail: e.target.value })
              }
            />
          </label>
          <label>
            Mission
            <select
              value={editing.worldId ?? ""}
              onChange={(e) =>
                setEditing({ ...editing, worldId: e.target.value || undefined })
              }
            >
              <option value="">Aucune</option>
              {state.worlds.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Ordre
            <input
              type="number"
              min={1}
              max={4}
              required
              value={editing.order}
              onChange={(e) =>
                setEditing({ ...editing, order: Number(e.target.value) })
              }
            />
          </label>
          <div className="daily-actions-controls">
            <button className="button primary">Enregistrer</button>
            <button
              type="button"
              className="button secondary"
              onClick={() => setEditing(null)}
            >
              Annuler
            </button>
          </div>
        </form>
      )}
      {ready && (
        <details className="daily-import">
          <summary>Importer un plan depuis ChatGPT</summary>
          <label>
            Plan JSON
            <textarea
              rows={4}
              value={raw}
              onChange={(e) => {
                setRaw(e.target.value);
                setPreview(null);
              }}
              placeholder='{"date":"2026-11-05","actions":[{"id":"20261105-doc","title":"Finaliser le document","worldId":"vanier"}]}'
            />
          </label>
          <button
            className="button secondary"
            type="button"
            onClick={() => {
              try {
                const plan = importDailyPlan(raw);
                const existing = new Set(
                  (state.dailyActions ?? []).map((a) => a.id),
                );
                setPreview(
                  mergeDailyActions(state, plan).filter(
                    (a) => !existing.has(a.id),
                  ),
                );
                setMessage("");
              } catch (error) {
                setPreview(null);
                setMessage(
                  error instanceof Error ? error.message : "JSON invalide.",
                );
              }
            }}
          >
            Prévisualiser
          </button>
          {preview && (
            <div>
              <p>
                {preview.length
                  ? "Actions à ajouter"
                  : "Aucune nouvelle action."}
              </p>
              <ul>
                {preview.map((a) => (
                  <li key={a.id}>
                    {a.date} · {a.title}
                    {a.detail ? ` · ${a.detail}` : ""}
                    {a.worldId
                      ? ` · ${state.worlds.find((w) => w.id === a.worldId)?.title}`
                      : ""}
                  </li>
                ))}
              </ul>
              {!!preview.length && (
                <button
                  className="button primary"
                  type="button"
                  onClick={() => {
                    if (apply((s) => mergeDailyActions(s, preview))) {
                      setSelectedDate(preview[0].date);
                      setPreview(null);
                      setRaw("");
                    }
                  }}
                >
                  Confirmer l’import
                </button>
              )}
            </div>
          )}
        </details>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
