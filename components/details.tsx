"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Zap,
  Plus,
  Trash2,
  Target,
  Archive,
  Settings2,
  Trophy,
  Download,
} from "lucide-react";
import { useStudio } from "./provider";
import { Shell } from "./shell";
import { CampaignArt } from "./campaign-art";
import { Progress } from "./dashboard";
import {
  complete,
  missionStatus,
  nextAction,
  missionXp,
  progress,
} from "@/lib/engine";
import type { Mission, World } from "@/types";
import { finalItems, createSeed } from "@/data/seed";
import { isState } from "@/lib/persistence";
import {
  projectObjective,
  projectProgress,
  projectStatus,
  prioritizeSubMission,
} from "@/lib/project-navigation";
const Back = () => (
  <Link href="/" className="back">
    <ArrowLeft size={16} /> Mission Control
  </Link>
);
export function WorldDetail({ id }: { id: string }) {
  const { state, update } = useStudio();
  const w = state.worlds.find((w) => w.id === id);
  if (id === "final") return <FinalDetail />;
  if (!w)
    return (
      <Shell>
        <Back />
        <h1>World introuvable</h1>
      </Shell>
    );
  const ms = state.missions
    .filter((m) => m.worldId === id && !m.archived)
    .sort((a, b) => a.order - b.order);
  return (
    <Shell>
      <Back />
      <div
        className="detail-heading"
        style={{ "--accent": w.accent } as React.CSSProperties}
      >
        <CampaignArt worldId={w.id} priority />
        <div className="eyebrow">
          MISSION PRINCIPALE {w.number} / {projectStatus(w, state)}
        </div>
        <h1>
          {w.title}
          <span className="heading-dot">.</span>
        </h1>
        <p>{projectObjective(w)}</p>
        <div className="detail-description">{w.description}</div>
        <div className="detail-stats">
          <strong>
            {projectProgress(w, state)}% <small>PROGRESSION</small>
          </strong>
          <strong>
            {ms.reduce((a, m) => a + missionXp(m), 0)} <small>XP ACQUIS</small>
          </strong>
          <strong>
            {ms.filter(complete).length}/{ms.length}{" "}
            <small>MISSIONS FERMÉES</small>
          </strong>
        </div>
        <Progress value={projectProgress(w, state)} />
      </div>
      {w.unlockConditions.length > 0 && (
        <div className="notice">
          <ArrowRight size={18} />
          Recommandé après {w.unlockConditions.join(", ")} — vous pouvez avancer
          en parallèle.
        </div>
      )}
      {id === "financement" && (
        <section className="panel funding">
          <div className="eyebrow">L’IMPACT SOCIAL COMME MOTEUR</div>
          <h2>
            {state.settings.funding.toLocaleString("fr-CA")} ${" "}
            <small>/ 40 000 $</small>
          </h2>
          <Progress value={Math.min(100, state.settings.funding / 400)} />
          <div className="funding-markers">
            <span>15K · MINIMUM</span>
            <span>20K · OPÉRATIONNEL</span>
            <span>40K · PREMIUM</span>
          </div>
          <label>
            Financement confirmé ($)
            <input
              type="number"
              min="0"
              value={state.settings.funding}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  settings: {
                    ...s.settings,
                    funding: Math.max(0, Number(e.target.value)),
                  },
                }))
              }
            />
          </label>
          <p>
            Les jalons financiers sont validés manuellement après confirmation
            réelle des fonds.
          </p>
        </section>
      )}
      <div className="section-heading">
        <h2>SOUS-MISSIONS · PARCOURS RECOMMANDÉ</h2>
        <span>{ms.length} SOUS-MISSIONS</span>
      </div>
      <div className="mission-map">
        {ms.map((m, i) => {
          return (
            <Link href={`/mission/${m.id}`} className="map-item" key={m.id}>
              <span
                className={`map-node ${complete(m) ? "node-complete" : ""}`}
              >
                {complete(m) ? (
                  <Check size={20} />
                ) : (
                  String(i + 1).padStart(2, "0")
                )}
              </span>
              <div>
                <div className="eyebrow">
                  {m.id} · {missionStatus(m, state)} {m.isBoss && " · BOSS"}
                </div>
                <h3>{m.title}</h3>
                <p>
                  {m.tasks.filter((t) => t.completed).length}/{m.tasks.length}{" "}
                  actions · {m.xpReward} XP bonus
                </p>
                {m.workState && (
                  <p>
                    {m.waitingReason ||
                      (m.workState === "waiting"
                        ? "Réponse externe en attente"
                        : "Mission en pause")}
                  </p>
                )}
                {m.dependencies.length > 0 && (
                  <p>
                    Séquence recommandée après {m.dependencies.join(", ")} ·
                    disponible en parallèle
                  </p>
                )}
                <Progress value={progress(m)} />
              </div>
              <ArrowRight size={20} />
            </Link>
          );
        })}
      </div>
      <Link href={`/settings#world-${id}`} className="button secondary">
        <Settings2 size={16} /> Gérer ce World
      </Link>
    </Shell>
  );
}
export function MissionDetail({ id }: { id: string }) {
  const { state, patchMission, toggleTask, update } = useStudio();
  const [editing, setEditing] = useState(false);
  const [newTask, setNewTask] = useState("");
  const m = state.missions.find((m) => m.id === id);
  if (!m)
    return (
      <Shell>
        <Back />
        <h1>Mission introuvable</h1>
      </Shell>
    );
  const w = state.worlds.find((w) => w.id === m.worldId)!;
  const action = nextAction(m, state);
  const dependents = state.missions.filter((other) =>
    other.dependencies.includes(id),
  );
  const add = () => {
    if (!newTask.trim()) return;
    patchMission(id, {
      tasks: [
        ...m.tasks,
        {
          id: crypto.randomUUID(),
          title: newTask.trim(),
          completed: false,
          xp: 50,
          custom: true,
        },
      ],
      completedAt: undefined,
    });
    setNewTask("");
  };
  return (
    <Shell>
      <Link className="back" href={`/world/${w.id}`}>
        <ArrowLeft size={16} /> {w.title} / SOUS-MISSIONS
      </Link>
      <div className="detail-heading">
        <CampaignArt worldId={w.id} priority />
        <div className="eyebrow">
          SOUS-MISSION {m.id}{" "}
          <span className="tag">{missionStatus(m, state)}</span>
        </div>
        <h1 className="mission-title">{m.title}</h1>
        <div className="detail-actions">
          <span className="reward">
            <Zap size={17} />
            {m.xpReward} XP BONUS
            {m.dueDate && (
              <span className="muted">
                {" "}
                ·{" "}
                {new Date(m.dueDate + "T12:00:00").toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
          </span>
          <button
            className="button secondary"
            disabled={complete(m) || m.archived}
            onClick={() => update((s) => prioritizeSubMission(s, id))}
          >
            <Target size={16} />
            {state.currentId === id
              ? "SOUS-MISSION PRIORITAIRE"
              : "PRIORISER CETTE SOUS-MISSION"}
          </button>
          <button
            className="button secondary"
            onClick={() => setEditing(!editing)}
          >
            <Settings2 size={16} />
            {editing ? "Fermer l’édition" : "Modifier"}
          </button>
        </div>
        <div className="hero-progress">
          <Progress value={progress(m)} />
          <strong>{progress(m)}%</strong>
        </div>
      </div>
      {m.workState && (
        <div className="notice">
          <ArrowRight size={18} />
          {m.workState === "waiting"
            ? "WAITING — En attente"
            : "PAUSED — En pause"}
          {m.waitingReason ? ` : ${m.waitingReason}` : ""}. Les autres missions
          restent disponibles.
        </div>
      )}
      {complete(m) && (
        <div className="notice success">
          <Trophy size={20} /> MISSION COMPLETE · {missionXp(m)} XP acquis
          <Link href="/">Prochaine mission →</Link>
        </div>
      )}
      <div className="detail-grid">
        <div>
          <section className="panel">
            <div className="eyebrow">LE RÉSULTAT À ATTEINDRE</div>
            <h2>OBJECTIF</h2>
            <p>{m.objective}</p>
            <div className="eyebrow spaced">POURQUOI C’EST IMPORTANT</div>
            <p>{w.description}</p>
          </section>
          <section className="panel">
            <div className="section-heading compact">
              <h2>PLAN D’ACTION</h2>
              <span>
                {m.tasks.filter((t) => t.completed).length} / {m.tasks.length}
              </span>
            </div>
            <div className="task-list">
              {m.tasks.map((t) => (
                <div
                  key={t.id}
                  className={`task-row ${t.completed ? "checked" : ""}`}
                >
                  <label className="task-check">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => toggleTask(id, t.id)}
                    />
                    <span className="checkbox">
                      {t.completed && <Check size={16} />}
                    </span>
                    <span className="task-text">{t.title}</span>
                  </label>
                  {editing ? (
                    <>
                      <input
                        aria-label={`Titre : ${t.title}`}
                        value={t.title}
                        onChange={(e) =>
                          patchMission(id, {
                            tasks: m.tasks.map((task) =>
                              task.id === t.id
                                ? { ...task, title: e.target.value }
                                : task,
                            ),
                          })
                        }
                      />
                      <input
                        className="xp-input"
                        type="number"
                        min="0"
                        aria-label={`XP : ${t.title}`}
                        value={t.xp}
                        onChange={(e) =>
                          patchMission(id, {
                            tasks: m.tasks.map((task) =>
                              task.id === t.id
                                ? {
                                    ...task,
                                    xp: Math.max(0, Number(e.target.value)),
                                  }
                                : task,
                            ),
                          })
                        }
                      />
                      <button
                        className="icon-button"
                        aria-label={`Supprimer ${t.title}`}
                        onClick={() =>
                          patchMission(id, {
                            tasks: m.tasks.filter((task) => task.id !== t.id),
                            completedAt: undefined,
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : (
                    <span className="task-xp">+{t.xp} XP</span>
                  )}
                </div>
              ))}
            </div>
            <form
              className="add-task"
              onSubmit={(e) => {
                e.preventDefault();
                add();
              }}
            >
              <input
                aria-label="Nouvelle action"
                placeholder="Ajouter une action précise…"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
              <button
                className="button secondary"
                type="submit"
                disabled={!newTask.trim()}
              >
                <Plus size={17} /> Ajouter
              </button>
            </form>
          </section>
          <section className="panel">
            <h2>NOTES DE MISSION</h2>
            <label className="sr-only" htmlFor="notes">
              Notes de mission
            </label>
            <textarea
              id="notes"
              rows={6}
              placeholder="Décisions, liens, prochaines étapes… Votre mémoire de mission."
              value={m.notes}
              onChange={(e) => patchMission(id, { notes: e.target.value })}
            />
            <span className="muted small">
              Enregistrement automatique sur cet appareil.
            </span>
          </section>
        </div>
        <aside className="detail-aside">
          <section className="panel next-panel">
            <div className="eyebrow">PROCHAINE ACTION</div>
            <h3>
              {action
                ? `${action.mission.id !== m.id ? `${action.mission.id} — ` : ""}${action.task.title}`
                : m.workState
                  ? "Reprendre une mission en attente ou en pause."
                  : "Mission terminée. Choisissez la suite."}
            </h3>
            {action && action.mission.id !== m.id && (
              <Link
                className="button secondary"
                href={`/mission/${action.mission.id}`}
              >
                Avancer sur {action.mission.id}
                <ArrowRight size={16} />
              </Link>
            )}
            <p>Une action. Toute votre attention.</p>
            <label>
              État de travail
              <select
                value={m.workState || "available"}
                onChange={(e) =>
                  patchMission(id, {
                    workState:
                      e.target.value === "available"
                        ? undefined
                        : (e.target.value as "waiting" | "paused"),
                  })
                }
              >
                <option value="available">Disponible</option>
                <option value="waiting">WAITING — En attente</option>
                <option value="paused">PAUSED — En pause</option>
              </select>
            </label>
            {m.workState && (
              <label className="spaced">
                Motif de l’attente ou de la pause
                <input
                  value={m.waitingReason || ""}
                  placeholder="Réponse de Vanier, disponibilité…"
                  onChange={(e) =>
                    patchMission(id, { waitingReason: e.target.value })
                  }
                />
              </label>
            )}
          </section>
          <section className="panel">
            <h3>SÉQUENCE RECOMMANDÉE</h3>
            <p>Repères uniquement. Travail en parallèle possible.</p>
            {[...w.unlockConditions, ...m.dependencies].length ? (
              [...new Set([...w.unlockConditions, ...m.dependencies])].map(
                (d) => (
                  <Link className="dependency" key={d} href={`/mission/${d}`}>
                    {state.missions.some((p) => p.id === d && complete(p)) ? (
                      <Check size={15} />
                    ) : (
                      <ArrowRight size={15} />
                    )}{" "}
                    Après {d} —{" "}
                    {state.missions.find((p) => p.id === d)?.title || d}
                  </Link>
                ),
              )
            ) : (
              <p>Aucun. Vous pouvez avancer.</p>
            )}
            <h3 className="spaced">SUITE SUGGÉRÉE</h3>
            {dependents.map((d) => (
              <Link className="dependency" key={d.id} href={`/mission/${d.id}`}>
                <ArrowRight size={14} />
                {d.title}
              </Link>
            ))}
            {id === "V3" && (
              <Link className="dependency" href="/world/financement">
                <Zap size={14} /> WORLD 05 · FINANCEMENT
              </Link>
            )}
            {dependents.length === 0 && id !== "V3" && (
              <p>Votre prochain niveau.</p>
            )}
          </section>
          {editing && (
            <section className="panel">
              <h3>ÉDITER LA MISSION</h3>
              <MissionFields
                mission={m}
                onChange={(p) => patchMission(id, p)}
              />
              <button
                className="button danger"
                onClick={() => patchMission(id, { archived: !m.archived })}
              >
                <Archive size={16} />
                {m.archived ? "Restaurer la mission" : "Archiver la mission"}
              </button>
            </section>
          )}
        </aside>
      </div>
    </Shell>
  );
}
function MissionFields({
  mission: m,
  onChange,
}: {
  mission: Mission;
  onChange: (patch: Partial<Mission>) => void;
}) {
  const { state } = useStudio();
  const [dependencyError, setDependencyError] = useState("");
  function setDependencies(values: string[]) {
    const seen = new Set<string>();
    function reaches(id: string): boolean {
      if (id === m.id) return true;
      if (seen.has(id)) return false;
      seen.add(id);
      return (
        state.missions.find((p) => p.id === id)?.dependencies.some(reaches) ??
        false
      );
    }
    if (values.some(reaches)) {
      setDependencyError("Cette dépendance créerait une boucle.");
      return;
    }
    setDependencyError("");
    onChange({ dependencies: values });
  }
  return (
    <div className="fields">
      <label>
        Titre
        <input
          value={m.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </label>
      <label>
        Objectif
        <textarea
          rows={3}
          value={m.objective}
          onChange={(e) => onChange({ objective: e.target.value })}
        />
      </label>
      <label>
        Bonus XP
        <input
          type="number"
          min="0"
          value={m.xpReward}
          onChange={(e) =>
            onChange({ xpReward: Math.max(0, Number(e.target.value)) })
          }
        />
      </label>
      <label>
        Date cible
        <input
          type="date"
          value={m.dueDate || ""}
          onChange={(e) => onChange({ dueDate: e.target.value })}
        />
      </label>
      <label>
        Ordre
        <input
          type="number"
          value={m.order}
          onChange={(e) => onChange({ order: Number(e.target.value) })}
        />
      </label>
      <label>
        Séquence recommandée
        <select
          multiple
          value={m.dependencies}
          onChange={(e) =>
            setDependencies(
              Array.from(e.target.selectedOptions, (o) => o.value),
            )
          }
        >
          {state.missions
            .filter((p) => p.id !== m.id && !p.archived)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.id} · {p.title}
              </option>
            ))}
        </select>
        <small>Cmd/Ctrl + clic pour sélectionner ou retirer.</small>
      </label>
      {dependencyError && <p role="alert">{dependencyError}</p>}
      <label className="inline-label">
        <input
          type="checkbox"
          checked={!!m.isBoss}
          onChange={(e) => onChange({ isBoss: e.target.checked })}
        />{" "}
        Mission Boss
      </label>
      <label>
        Statut
        <select
          value={
            m.archived
              ? "archived"
              : complete(m)
                ? "complete"
                : m.workState ||
                  (state.currentId === m.id ? "active" : "available")
          }
          onChange={(e) => {
            const status = e.target.value;
            if (status === "waiting" || status === "paused")
              onChange({ workState: status, archived: false });
            else if (status === "archived") onChange({ archived: true });
            else if (status === "complete") {
              onChange({
                archived: false,
                workState: undefined,
                tasks: m.tasks.map((t) => ({
                  ...t,
                  completed: true,
                  completedAt: t.completedAt || new Date().toISOString(),
                })),
                completedAt: m.completedAt || new Date().toISOString(),
              });
            } else if (status === "available")
              onChange({ archived: false, workState: undefined });
            else if (status === "reopen")
              onChange({
                workState: undefined,
                archived: false,
                tasks: m.tasks.map((t) => ({
                  ...t,
                  completed: false,
                  completedAt: undefined,
                })),
                completedAt: undefined,
              });
          }}
        >
          <option value="available">Disponible / Reprendre</option>
          <option value="waiting">WAITING — En attente</option>
          <option value="paused">PAUSED — En pause</option>
          <option value="reopen">
            Réouvrir et décocher toutes les actions
          </option>
          <option value="active" disabled>
            Sous-mission prioritaire (bouton ci-dessus)
          </option>
          <option value="complete" disabled={m.tasks.length === 0}>
            Terminer toutes les actions
          </option>
          <option value="archived">Archivée</option>
        </select>
      </label>
    </div>
  );
}
export function ArchivePage() {
  const { state, patchMission } = useStudio();
  const items = state.missions.filter((m) => complete(m) || m.archived);
  return (
    <Shell>
      <Back />
      <div className="detail-heading">
        <div className="eyebrow">VOTRE PALMARÈS</div>
        <h1>
          MISSIONS FERMÉES<span className="heading-dot">.</span>
        </h1>
        <p>Chaque mission fermée construit la suite.</p>
      </div>
      {!items.length && (
        <section className="panel empty-state">
          <Trophy size={40} />
          <h2>LE PREMIER SUCCÈS VOUS ATTEND.</h2>
          <p>Fermez votre première mission pour l’inscrire au palmarès.</p>
          <Link className="button primary" href={`/mission/${state.currentId}`}>
            Reprendre la mission <ArrowRight size={16} />
          </Link>
        </section>
      )}
      {items.map((m) => (
        <div className="archive-row panel" key={m.id}>
          <Link href={`/mission/${m.id}`}>
            <span className="eyebrow">
              {m.id} · {m.archived ? "ARCHIVÉE" : "MISSION COMPLETE"}
            </span>
            <h3>{m.title}</h3>
            <span className="reward">{missionXp(m)} XP</span>
          </Link>
          {m.archived && (
            <button
              className="button secondary"
              onClick={() => patchMission(m.id, { archived: false })}
            >
              Restaurer
            </button>
          )}
        </div>
      ))}
    </Shell>
  );
}
export function FinalDetail() {
  const { state, update } = useStudio();
  return (
    <Shell>
      <Back />
      <div className="detail-heading final-heading">
        <CampaignArt worldId="vanier" priority />
        <div className="eyebrow">
          <Trophy size={18} /> FINAL BOSS ·{" "}
          {new Date(state.settings.finalBossDate).toLocaleDateString("fr-CA", {
            dateStyle: "long",
            timeZone: "America/Toronto",
          })}
        </div>
        <h1>
          THE FIRST
          <br />
          PÜRINSTINCT GAMES SCHOOL<span className="heading-dot">.</span>
        </h1>
        <p>VANIER · La destination. Une école entière en mouvement.</p>
      </div>
      <section className="panel">
        <h2>PRÉPARER UNE JOURNÉE INOUBLIABLE</h2>
        <p>
          Destination à long terme · exclue de la progression de la saison de 30
          jours.
        </p>
        <div className="final-checklist">
          {finalItems.map((item) => (
            <label className="task-check" key={item}>
              <input
                type="checkbox"
                checked={state.finalChecklist.includes(item)}
                onChange={() =>
                  update((s) => ({
                    ...s,
                    finalChecklist: s.finalChecklist.includes(item)
                      ? s.finalChecklist.filter((i) => i !== item)
                      : [...s.finalChecklist, item],
                  }))
                }
              />
              <span className="checkbox">
                {state.finalChecklist.includes(item) && <Check size={16} />}
              </span>
              {item}
            </label>
          ))}
        </div>
      </section>
    </Shell>
  );
}
export function SettingsPage() {
  const { state, update, patchMission } = useStudio();
  const [confirm, setConfirm] = useState(false);
  const [selected, setSelected] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [worldId, setWorldId] = useState("vanier");
  const [newWorld, setNewWorld] = useState("");
  const [message, setMessage] = useState("");
  const m = state.missions.find((m) => m.id === selected);
  function exportData() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(state, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "purinstinct-progression.json";
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Sauvegarde exportée.");
  }
  return (
    <Shell>
      <Back />
      <div className="detail-heading">
        <div className="eyebrow">CONFIGURATION PÜRINSTINCT</div>
        <h1>
          À VOTRE MESURE<span className="heading-dot">.</span>
        </h1>
        <p>Faites évoluer votre campagne. Gardez votre cap.</p>
      </div>
      <div className="settings-grid">
        <section className="panel">
          <h2>SAISON & PRIORITÉS</h2>
          <div className="fields">
            {(
              [
                "seasonTitle",
                "seasonStart",
                "seasonEnd",
                "finalBossDate",
                "finalBossTitle",
                "todayLabel",
                "todayGoal",
                "nextLabel",
                "nextGoal",
              ] as const
            ).map((key) => (
              <label key={key}>
                {
                  {
                    seasonTitle: "Nom de la saison",
                    seasonStart: "Début de saison",
                    seasonEnd: "Fin de saison",
                    finalBossDate: "Date du Final Boss",
                    finalBossTitle: "Titre du Final Boss",
                    todayLabel: "Libellé aujourd’hui",
                    todayGoal: "Objectif aujourd’hui",
                    nextLabel: "Libellé prochaine journée",
                    nextGoal: "Objectif prochaine journée",
                  }[key]
                }
                <input
                  type={
                    key === "seasonStart" || key === "seasonEnd"
                      ? "date"
                      : key === "finalBossDate"
                        ? "datetime-local"
                        : "text"
                  }
                  value={
                    key === "finalBossDate"
                      ? state.settings[key].slice(0, 16)
                      : state.settings[key]
                  }
                  onChange={(e) => {
                    if (
                      (key.includes("Date") ||
                        key === "seasonStart" ||
                        key === "seasonEnd") &&
                      !e.target.value
                    )
                      return;
                    update((s) => ({
                      ...s,
                      settings: {
                        ...s.settings,
                        [key]:
                          key === "finalBossDate"
                            ? e.target.value + "-04:00"
                            : e.target.value,
                      },
                    }));
                  }}
                />
              </label>
            ))}
          </div>
        </section>
        <div>
          <section className="panel">
            <h2>MISSIONS</h2>
            <label>
              Modifier une mission
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                <option value="">Choisir une mission</option>
                {state.missions.map((m) => (
                  <option value={m.id} key={m.id}>
                    {m.id} · {m.title}
                  </option>
                ))}
              </select>
            </label>
            {m && (
              <>
                <MissionFields
                  mission={m}
                  onChange={(p) => patchMission(m.id, p)}
                />
                <Link className="button secondary" href={`/mission/${m.id}`}>
                  Actions et notes <ArrowRight size={16} />
                </Link>
              </>
            )}
            <form
              className="fields spaced"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                const id = "M" + crypto.randomUUID().slice(0, 8);
                const mission: Mission = {
                  id,
                  worldId,
                  title: newTitle.trim(),
                  objective: newTitle.trim(),
                  description: "Mission personnalisée",
                  xpReward: 300,
                  tasks: [
                    {
                      id: crypto.randomUUID(),
                      title: "Valider le résultat de la mission",
                      completed: false,
                      xp: 50,
                      custom: true,
                    },
                  ],
                  dependencies: [],
                  notes: "",
                  order:
                    state.missions.filter((m) => m.worldId === worldId).length +
                    1,
                };
                update((s) => ({ ...s, missions: [...s.missions, mission] }));
                setSelected(id);
                setNewTitle("");
                setMessage(
                  "Mission créée. Modifiez ses actions depuis sa fiche.",
                );
              }}
            >
              <label>
                Nouvelle mission
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="Le prochain objectif"
                />
              </label>
              <label>
                World
                <select
                  value={worldId}
                  onChange={(e) => setWorldId(e.target.value)}
                >
                  {state.worlds.map((w) => (
                    <option value={w.id} key={w.id}>
                      {w.title}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button secondary">
                <Plus size={16} /> Créer la mission
              </button>
            </form>
          </section>
          <section className="panel">
            <h2>WORLDS</h2>
            {state.worlds.map((w) => (
              <details key={w.id} id={`world-${w.id}`}>
                <summary>
                  {w.number} · {w.title}
                </summary>
                <WorldFields world={w} />
              </details>
            ))}
            <form
              className="add-task"
              onSubmit={(e) => {
                e.preventDefault();
                if (!newWorld.trim()) return;
                update((s) => ({
                  ...s,
                  worlds: [
                    ...s.worlds,
                    {
                      id: crypto.randomUUID(),
                      number: String(s.worlds.length + 1).padStart(2, "0"),
                      title: newWorld.trim().toUpperCase(),
                      subtitle: "Nouvelle trajectoire",
                      description: "Définissez la vision de ce World.",
                      accent: "#48a7ff",
                      order: s.worlds.length + 1,
                      unlockConditions: [],
                    },
                  ],
                }));
                setNewWorld("");
                setMessage("World créé.");
              }}
            >
              <input
                aria-label="Nom du nouveau World"
                required
                value={newWorld}
                onChange={(e) => setNewWorld(e.target.value)}
                placeholder="Nouveau World"
              />
              <button className="button secondary">
                <Plus size={16} /> Ajouter
              </button>
            </form>
          </section>
          <section className="panel">
            <h2>VOS DONNÉES</h2>
            <p>
              Votre progression reste dans ce navigateur. Exportez une copie
              pour la conserver ou changer d’appareil.
            </p>
            <button className="button secondary" onClick={exportData}>
              <Download size={16} /> Exporter la sauvegarde
            </button>
            <label className="spaced">
              Importer une sauvegarde
              <input
                type="file"
                accept="application/json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const data = JSON.parse(await file.text());
                    if (!isState(data)) throw Error();
                    if (
                      window.confirm(
                        "Remplacer votre progression locale par cette sauvegarde ?",
                      )
                    ) {
                      update(() => data);
                      setMessage("Sauvegarde importée.");
                    }
                  } catch {
                    setMessage("Fichier invalide : import annulé.");
                  }
                }}
              />
            </label>
            <div className="reset-zone">
              <h3>REPARTIR À ZÉRO</h3>
              <p>
                Supprime la progression et les modifications sur cet appareil.
              </p>
              {confirm ? (
                <div className="confirm-reset">
                  <p>Réinitialiser définitivement toutes les données ?</p>
                  <button
                    className="button danger"
                    onClick={() => {
                      update(() => createSeed());
                      setConfirm(false);
                      setMessage("Données initiales restaurées.");
                    }}
                  >
                    Oui, réinitialiser
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => setConfirm(false)}
                  >
                    Annuler
                  </button>
                </div>
              ) : (
                <button
                  className="button danger"
                  onClick={() => setConfirm(true)}
                >
                  RESET DEMO DATA
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
      {message && (
        <div className="toast" role="status">
          <span>{message}</span>
          <button
            onClick={() => setMessage("")}
            aria-label="Fermer la notification"
          >
            ×
          </button>
        </div>
      )}
    </Shell>
  );
}
function WorldFields({ world: w }: { world: World }) {
  const { state, update } = useStudio();
  const patch = (p: Partial<World>) =>
    update((s) => ({
      ...s,
      worlds: s.worlds.map((v) => (v.id === w.id ? { ...v, ...p } : v)),
    }));
  return (
    <div className="fields">
      <label>
        Titre
        <input
          value={w.title}
          onChange={(e) => patch({ title: e.target.value })}
        />
      </label>
      <label>
        Objectif principal
        <input
          value={projectObjective(w)}
          onChange={(e) => patch({ objective: e.target.value })}
        />
      </label>
      <label>
        Sous-titre
        <input
          value={w.subtitle}
          onChange={(e) => patch({ subtitle: e.target.value })}
        />
      </label>
      <label>
        Vision
        <textarea
          value={w.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
      </label>
      <label>
        Accent
        <input
          type="color"
          value={w.accent}
          onChange={(e) => patch({ accent: e.target.value })}
        />
      </label>
      <label>
        Recommandé après
        <select
          multiple
          value={w.unlockConditions}
          onChange={(e) =>
            patch({
              unlockConditions: Array.from(
                e.target.selectedOptions,
                (o) => o.value,
              ),
            })
          }
        >
          {state.missions
            .filter((m) => m.worldId !== w.id)
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} · {m.title}
              </option>
            ))}
        </select>
      </label>
    </div>
  );
}
