"use client";
import { useState } from "react";
import type { World } from "@/types";
import { useStudio } from "./provider";
import { addSubMission, projectTypes } from "@/lib/projects";
import { isClosed } from "@/lib/lifecycle";
import {
  projectActivity,
  changeProjectActivity,
  projectObjective,
} from "@/lib/project-navigation";
export function ProjectEditor({ world: w }: { world: World }) {
  const { update } = useStudio();
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const patch = (changes: Partial<World>) =>
    update((s) => ({
      ...s,
      worlds: s.worlds.map((world) =>
        world.id === w.id ? { ...world, ...changes } : world,
      ),
    }));
  return (
    <section className="panel project-editor">
      {!isClosed(w) && (
        <label className="project-activity-field">
          Statut d’activité
          <select
            value={projectActivity(w)}
            onChange={(e) =>
              update((s) =>
                changeProjectActivity(
                  s,
                  w.id,
                  e.target.value as "active" | "available" | "waiting",
                ),
              )
            }
          >
            <option value="active">ACTIVE — En cours</option>
            <option value="available">AVAILABLE — Prête à démarrer</option>
            <option value="waiting">En attente</option>
          </select>
        </label>
      )}
      <details>
        <summary>Modifier la mission</summary>
        <div className="fields project-form-grid">
          <label>
            Nom de la mission
            <input
              value={w.title}
              onChange={(e) => {
                if (e.target.value.trim()) patch({ title: e.target.value });
              }}
            />
          </label>
          <label>
            Partenaire(s)
            <input
              value={w.partners || ""}
              onChange={(e) =>
                patch({
                  partners: e.target.value,
                  subtitle: e.target.value.trim()
                    ? `Avec ${e.target.value}`
                    : w.projectType || "Mission",
                })
              }
            />
          </label>
          <label className="wide">
            Objectif principal
            <textarea
              value={projectObjective(w)}
              onChange={(e) => patch({ objective: e.target.value })}
            />
          </label>
          <label>
            Type de projet
            <select
              value={w.projectType || "Autre"}
              onChange={(e) => patch({ projectType: e.target.value })}
            >
              {projectTypes.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Progression globale (%)
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={w.manualProgress ?? ""}
              placeholder="Calculée depuis les sous-missions"
              onChange={(e) =>
                patch({
                  manualProgress:
                    e.target.value === ""
                      ? undefined
                      : Math.max(0, Math.min(100, Number(e.target.value))),
                })
              }
            />
          </label>
          <label>
            Date de début
            <input
              type="date"
              value={w.startDate || ""}
              max={w.dueDate || undefined}
              onChange={(e) =>
                patch({ startDate: e.target.value || undefined })
              }
            />
          </label>
          <label>
            Échéance (optionnelle)
            <input
              type="date"
              value={w.dueDate || ""}
              min={w.startDate}
              onChange={(e) => patch({ dueDate: e.target.value || undefined })}
            />
          </label>
        </div>
        <p className="lifecycle-note">
          Videz la progression pour la calculer depuis les sous-missions. Une
          mission complétée affiche toujours 100 %.
        </p>
      </details>
      <label className="spaced">
        Notes de la mission
        <textarea
          rows={3}
          value={w.notes || ""}
          onChange={(e) => patch({ notes: e.target.value })}
          placeholder="Décisions, idées, prochaines étapes…"
        />
      </label>
      <label className="spaced">
        Liens et documents (un lien par ligne)
        <textarea
          rows={2}
          value={w.links || ""}
          onChange={(e) => patch({ links: e.target.value })}
          placeholder="https://…"
        />
      </label>
      <ul>
        {(w.links || "")
          .split("\n")
          .filter((url) => /^https?:\/\/\S+$/i.test(url.trim()))
          .map((url, i) => (
            <li key={i}>
              <a href={url.trim()} target="_blank" rel="noopener noreferrer">
                {url.trim()}
              </a>
            </li>
          ))}
      </ul>
      <h3>Ajouter une sous-mission</h3>
      <form
        className="fields"
        onSubmit={(e) => {
          e.preventDefault();
          update((s) =>
            addSubMission(s, w.id, title, crypto.randomUUID(), task),
          );
          setTitle("");
          setTask("");
        }}
      >
        <label>
          Nom de la sous-mission
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Définir le format du tournoi"
          />
        </label>
        <label>
          Première tâche (optionnelle)
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Préparer la rencontre avec Éric"
          />
        </label>
        <button className="button secondary" disabled={!title.trim()}>
          Ajouter la sous-mission
        </button>
      </form>
      <p className="lifecycle-note">
        Ouvrez une sous-mission pour ajouter ses tâches, modifier son objectif
        et ses notes.
      </p>
    </section>
  );
}
