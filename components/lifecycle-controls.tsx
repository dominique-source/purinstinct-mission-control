"use client";
import type { Lifecycle, LifecycleStatus } from "@/types";
import { isClosed, statusLabels } from "@/lib/lifecycle";
export function LifecycleControls({
  item,
  label,
  onChange,
}: {
  item: Lifecycle;
  label: string;
  onChange: (status: LifecycleStatus) => void;
}) {
  return (
    <div
      className="lifecycle-controls"
      role="group"
      aria-label={`Statut : ${label}`}
    >
      <span className="lifecycle-badge">
        {statusLabels[item.status || "active"]}
      </span>
      {isClosed(item) ? (
        <button
          type="button"
          className="button secondary"
          onClick={() => onChange("active")}
        >
          Réactiver
        </button>
      ) : (
        <>
          <button
            type="button"
            className="button secondary"
            onClick={() => onChange("completed")}
          >
            Marquer comme complétée
          </button>
          <button
            type="button"
            className="button secondary"
            onClick={() => onChange("cancelled")}
          >
            Marquer comme annulée
          </button>
        </>
      )}
      {!!item.history?.length && (
        <details className="lifecycle-history">
          <summary>Historique ({item.history.length})</summary>
          <ol>
            {item.history.map((entry, i) => (
              <li key={`${entry.at}-${i}`}>
                {statusLabels[entry.status]} ·{" "}
                {new Date(entry.at).toLocaleString("fr-CA", {
                  timeZone: "America/Toronto",
                })}
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
