"use client";
import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { useStudio } from "./provider";
import { createProject, projectTypes, todayToronto } from "@/lib/projects";
import type { LifecycleStatus } from "@/types";
export function NewProject({ onCreated }: { onCreated?: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { update, ready } = useStudio();
  return (
    <>
      <div className="project-toolbar">
        <button
          className="button secondary"
          disabled={!ready}
          onClick={() => {
            const form = dialog.current?.querySelector("form");
            const start = form?.elements.namedItem(
              "startDate",
            ) as HTMLInputElement | null;
            const due = form?.elements.namedItem(
              "dueDate",
            ) as HTMLInputElement | null;
            if (start && due) due.min = start.value;
            dialog.current?.showModal();
          }}
        >
          <Plus size={17} /> Nouvelle mission
        </button>
      </div>
      <dialog
        ref={dialog}
        className="new-project-dialog"
        aria-labelledby="new-project-title"
      >
        <header>
          <div>
            <span className="eyebrow">MISSION CONTROL</span>
            <h2 id="new-project-title">Nouvelle mission</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Fermer le formulaire"
            onClick={() => dialog.current?.close()}
          >
            <X size={20} />
          </button>
        </header>
        <form
          onInput={(e) => {
            const input = e.target;
            if (
              input instanceof HTMLInputElement ||
              input instanceof HTMLTextAreaElement
            )
              input.setCustomValidity("");
          }}
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            for (const field of ["title", "objective"]) {
              const input = form.elements.namedItem(field) as
                HTMLInputElement | HTMLTextAreaElement;
              if (!input.value.trim()) {
                input.setCustomValidity("Veuillez renseigner ce champ.");
                input.reportValidity();
                return;
              }
            }
            update((s) =>
              createProject(
                s,
                {
                  title: String(data.get("title")),
                  objective: String(data.get("objective")),
                  partners: String(data.get("partners")),
                  projectType: String(data.get("projectType")),
                  startDate: String(data.get("startDate")),
                  dueDate: String(data.get("dueDate")),
                  status: data.get("status") as LifecycleStatus,
                  initialProgress: Number(data.get("progress")),
                },
                crypto.randomUUID(),
              ),
            );
            onCreated?.();
            dialog.current?.close();
            form.reset();
          }}
        >
          <div className="project-form-grid fields">
            <label className="wide">
              Nom de la mission *
              <input
                name="title"
                required
                maxLength={100}
                placeholder="New Sport"
                autoFocus
              />
            </label>
            <label className="wide">
              Objectif principal *
              <textarea
                name="objective"
                required
                rows={3}
                placeholder="Créer un nouveau sport et son format de tournoi télévisé."
              />
            </label>
            <label>
              Partenaire(s)
              <input name="partners" placeholder="Éric Boucher" />
            </label>
            <label>
              Type de projet
              <select name="projectType" defaultValue="Développement">
                {projectTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Date de début
              <input
                name="startDate"
                type="date"
                required
                defaultValue={todayToronto()}
                onChange={(e) => {
                  const due = e.currentTarget.form?.elements.namedItem(
                    "dueDate",
                  ) as HTMLInputElement | null;
                  if (due) due.min = e.currentTarget.value;
                }}
              />
            </label>
            <label>
              Échéance (optionnelle)
              <input name="dueDate" type="date" min={todayToronto()} />
            </label>
            <label>
              Statut initial
              <select name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="completed">Complétée</option>
                <option value="cancelled">Annulée</option>
              </select>
            </label>
            <label>
              Progression initiale (%)
              <input
                name="progress"
                type="number"
                min={0}
                max={100}
                step={1}
                required
                defaultValue={0}
              />
            </label>
          </div>
          <footer>
            <button
              type="button"
              className="button secondary"
              onClick={() => dialog.current?.close()}
            >
              Annuler
            </button>
            <button type="submit" className="button primary">
              Créer la mission
            </button>
          </footer>
        </form>
      </dialog>
    </>
  );
}
