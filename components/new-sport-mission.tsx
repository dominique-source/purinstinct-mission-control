"use client";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, CalendarDays } from "lucide-react";
import type { World } from "@/types";
import { useStudio } from "./provider";
import { Shell } from "./shell";
import { ProjectEditor } from "./project-editor";
import { LifecycleControls } from "./lifecycle-controls";
import { Progress } from "./dashboard";
import { complete, missionClosed, progress } from "@/lib/engine";
import {
  projectProgress,
  projectStatus,
  transitionProject,
} from "@/lib/project-navigation";
import { statusLabels } from "@/lib/lifecycle";
export const planningLabels = {
  in_progress: "EN COURS",
  upcoming: "À VENIR",
  someday: "UN JOUR 😄",
  review_ready: "PRÊT POUR RÉVISION",
};
function webUrl(value: string) {
  try {
    const u = new URL(value);
    return ["https:", "http:"].includes(u.protocol) ? u.href : undefined;
  } catch {
    return undefined;
  }
}
export function NewSportMission({ world: w }: { world: World }) {
  const { state, update } = useStudio();
  const brief = w.mediaBrief!;
  const milestones = brief.milestoneIds
    .map((id) => state.missions.find((m) => m.id === id))
    .filter((m) => !!m);
  const extra = state.missions.filter(
    (m) =>
      m.worldId === w.id && !m.archived && !brief.milestoneIds.includes(m.id),
  );
  const ericWork = milestones.filter(
    (m) =>
      m.owner?.includes("Éric") &&
      !missionClosed(m) &&
      m.planningState === "in_progress",
  );
  const nextMilestone = milestones.find(
    (m) => !missionClosed(m) && m.planningState === "upcoming",
  );
  const casting = milestones[0];
  const ready = casting?.planningState === "review_ready";
  const total = brief.tiers.reduce((n, t) => n + t.count, 0);
  const master = webUrl(brief.masterUrl);
  const patch = (changes: Partial<NonNullable<World["mediaBrief"]>>) =>
    update((s) => ({
      ...s,
      worlds: s.worlds.map((world) =>
        world.id === w.id
          ? { ...world, mediaBrief: { ...world.mediaBrief!, ...changes } }
          : world,
      ),
    }));
  const masterButton = (
    <a
      className="button primary media-master"
      href={master}
      target="_blank"
      rel="noopener noreferrer"
    >
      OUVRIR LE CASTING MASTER <ArrowUpRight size={18} />
    </a>
  );
  const activity = [
    ...brief.activity,
    ...(w.history || []).map((e) => ({
      at: e.at,
      text: `Mission ${statusLabels[e.status].toLocaleLowerCase("fr")}`,
    })),
    ...milestones.flatMap((m) =>
      (m.history || []).map((e) => ({
        at: e.at,
        text: `${m.title} — ${statusLabels[e.status]}`,
      })),
    ),
  ].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <Shell>
      <div className="media-mission">
        <Link href="/" className="back">
          <ArrowLeft size={16} /> Mission Control
        </Link>
        <header className="media-hero">
          <div className="eyebrow">
            MISSION MÉDIA / SPORT <span>{projectStatus(w)}</span>
          </div>
          <h1>{w.title}</h1>
          <p className="media-subtitle">{w.objective}</p>
          <div className="media-partner">AVEC {w.partners}</div>
          <div className="media-progress">
            <Progress value={projectProgress(w, state)} />
            <strong>{projectProgress(w, state)} %</strong>
          </div>
          <p className="media-eric">
            {ericWork.length
              ? `Éric en cours : ${ericWork.map((m) => m.title.toLocaleLowerCase("fr")).join(" · ")}.`
              : "Travail d’Éric : voir les milestones."}{" "}
            Dominique prépare la révision du casting avec lui.
          </p>
          {nextMilestone && (
            <p className="media-eric">Prochain jalon : {nextMilestone.title}</p>
          )}
        </header>
        <section
          className="media-panel media-next"
          aria-labelledby="media-next-title"
        >
          <div className="eyebrow">NEXT ACTION — DOMINIQUE</div>
          <h2 id="media-next-title">CASTING INITIAL</h2>
          <p>
            <strong>{total} personnes</strong> sont actuellement dans le Casting
            Master.
          </p>
          <p>
            Prochaine étape : revoir cette première liste avec Éric Boucher afin
            de réduire, prioriser et décider qui contacter ou intégrer dans le
            deck.
          </p>
          <div className="media-actions">
            {master && masterButton}
            <button
              className="button secondary"
              disabled={!casting || missionClosed(casting)}
              onClick={() => {
                if (!casting) return;
                update((s) => ({
                  ...s,
                  missions: s.missions.map((m) =>
                    m.id === casting.id
                      ? {
                          ...m,
                          planningState: ready ? "in_progress" : "review_ready",
                        }
                      : m,
                  ),
                  worlds: s.worlds.map((world) =>
                    world.id === w.id
                      ? {
                          ...world,
                          mediaBrief: {
                            ...world.mediaBrief!,
                            activity: [
                              ...world.mediaBrief!.activity,
                              {
                                at: new Date().toISOString(),
                                text: ready
                                  ? "Casting remis en préparation."
                                  : "Casting marqué prêt pour révision avec Éric Boucher.",
                              },
                            ],
                          },
                        }
                      : world,
                  ),
                }));
              }}
            >
              {ready ? (
                <>
                  <Check size={17} /> CASTING PRÊT POUR RÉVISION · REMETTRE EN
                  PRÉPARATION
                </>
              ) : (
                "MARQUER LE CASTING PRÊT POUR RÉVISION"
              )}
            </button>
          </div>
          <div className="media-meeting">
            <CalendarDays size={20} />
            <div>
              <h3>NEXT MEETING</h3>
              <p>Déclencheur : première liste de casting prête.</p>
              <p>
                {ready
                  ? "Liste prête pour révision — rencontre avec Éric à planifier."
                  : "Une fois la liste prête, organiser la rencontre avec Éric."}
              </p>
              <p>
                Challenger la liste, couper certains noms, ajouter des profils,
                prioriser et déterminer qui contacter ou utiliser dans le deck.
              </p>
            </div>
          </div>
        </section>
        <section
          className="media-panel"
          aria-labelledby="media-milestones-title"
        >
          <div className="eyebrow">LE PARCOURS</div>
          <h2 id="media-milestones-title">
            MILESTONES — ÉRIC BOUCHER × DOMINIQUE SOUCY
          </h2>
          <div className="media-milestones">
            {milestones.map((m, i) => (
              <Link
                className={`media-milestone ${missionClosed(m) ? "lifecycle-closed" : ""}`}
                href={`/mission/${m.id}`}
                key={m.id}
              >
                <span className="media-step">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <span className="media-stage">
                    {complete(m)
                      ? "COMPLÉTÉE"
                      : m.status === "cancelled"
                        ? "ANNULÉE"
                        : planningLabels[m.planningState || "upcoming"]}
                  </span>
                  <h3>{m.title}</h3>
                  <p>Responsable : {m.owner}</p>
                  <p>{m.objective}</p>
                  <Progress value={progress(m)} />
                </div>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
          {!!extra.length && (
            <>
              <h3>Autres actions de la mission</h3>
              {extra.map((m) => (
                <Link
                  className="media-extra"
                  href={`/mission/${m.id}`}
                  key={m.id}
                >
                  {m.title}
                  <ArrowUpRight size={16} />
                </Link>
              ))}
            </>
          )}
        </section>
        <section className="media-panel" aria-labelledby="media-casting-title">
          <div className="eyebrow">CASTING</div>
          <h2 id="media-casting-title">{total} PROFILS</h2>
          <p>
            Première liste large à revoir avec Éric. Elle ne doit pas être
            composée uniquement d’hommes.
          </p>
          <div className="media-tiers">
            {brief.tiers.map((t) => (
              <div key={t.name}>
                <span>{t.name}</span>
                <strong>{t.count}</strong>
                <small>{t.label}</small>
              </div>
            ))}
          </div>
          <p>
            New Sport Doc — Casting Master est la source principale du casting.
            La liste complète reste dans le Google Sheet.
          </p>
          {master && masterButton}
          <details className="media-details">
            <summary>Signification des tiers</summary>
            {brief.tiers.map((t) => (
              <div key={t.name}>
                <h3>
                  {t.name} — {t.label}
                </h3>
                <p>{t.description}</p>
              </div>
            ))}
          </details>
          <details className="media-details">
            <summary>Mettre à jour la synthèse du casting</summary>
            <p>
              Reportez ici les totaux du Casting Master après sa mise à jour.
            </p>
            <div className="media-counts">
              {brief.tiers.map((t, i) => (
                <label key={t.name}>
                  {t.name}
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={t.count}
                    onChange={(e) =>
                      patch({
                        tiers: brief.tiers.map((tier, n) =>
                          n === i
                            ? {
                                ...tier,
                                count: Math.max(
                                  0,
                                  Math.floor(Number(e.target.value)),
                                ),
                              }
                            : tier,
                        ),
                      })
                    }
                  />
                </label>
              ))}
            </div>
          </details>
          <label className="media-field">
            SHORTLIST OFFICIELLE
            <textarea
              rows={3}
              placeholder="À remplir après la révision avec Éric et Dominique."
              value={brief.shortlist}
              onChange={(e) => patch({ shortlist: e.target.value })}
            />
          </label>
        </section>
        <section
          className="media-panel"
          aria-labelledby="media-resources-title"
        >
          <h2 id="media-resources-title">RESSOURCES / DOCUMENTS</h2>
          <div className="media-resource">
            <h3>CASTING MASTER</h3>
            <p>Google Sheet · New Sport Doc — Casting Master</p>
            {master && masterButton}
            <label className="media-field">
              Lien du Casting Master
              <input
                type="url"
                value={brief.masterUrl}
                onChange={(e) => patch({ masterUrl: e.target.value })}
              />
            </label>
          </div>
          <details className="media-details">
            <summary>
              PRINCIPES D’ENTENTE — Éric Boucher × Dominique Soucy
            </summary>
            <ol>
              {brief.principles.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </details>
          {brief.resources.map((r, i) => (
            <div className="media-resource" key={i}>
              <h3>{r.title}</h3>
              <label className="media-field">
                Statut — {r.title}
                <input
                  value={r.status}
                  onChange={(e) =>
                    patch({
                      resources: brief.resources.map((v, n) =>
                        n === i ? { ...v, status: e.target.value } : v,
                      ),
                    })
                  }
                />
              </label>
              <label className="media-field">
                Lien du document — {r.title}
                <input
                  type="url"
                  placeholder="À ajouter lorsque le document est disponible"
                  value={r.url}
                  onChange={(e) =>
                    patch({
                      resources: brief.resources.map((v, n) =>
                        n === i ? { ...v, url: e.target.value } : v,
                      ),
                    })
                  }
                />
              </label>
              {webUrl(r.url) && (
                <a
                  href={webUrl(r.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ouvrir le document <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          ))}
          <details className="media-details">
            <summary>Objectifs et rôles du projet</summary>
            <ul>
              {brief.objectives.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
            {brief.roles.map((r) => (
              <div key={r.name}>
                <h3>{r.name}</h3>
                <p>{r.details}</p>
              </div>
            ))}
          </details>
          {w.links && (
            <div className="media-resource">
              <h3>Liens déjà enregistrés</h3>
              <p className="media-preserved">{w.links}</p>
            </div>
          )}
        </section>
        <section className="media-panel">
          <h2>NOTES</h2>
          <label className="media-field">
            Notes de la mission
            <textarea
              rows={6}
              value={w.notes || ""}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  worlds: s.worlds.map((world) =>
                    world.id === w.id
                      ? { ...world, notes: e.target.value }
                      : world,
                  ),
                }))
              }
            />
          </label>
          {w.description && (
            <details className="media-details">
              <summary>Description déjà enregistrée</summary>
              <p>{w.description}</p>
            </details>
          )}
        </section>
        <section className="media-panel" aria-labelledby="media-history-title">
          <h2 id="media-history-title">HISTORIQUE / ACTIVITÉ</h2>
          {activity.length ? (
            <ul className="media-activity">
              {activity.map((e, i) => (
                <li key={`${e.at}-${i}`}>
                  <time>
                    {new Date(e.at).toLocaleString("fr-CA", {
                      timeZone: "America/Toronto",
                    })}
                  </time>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Les changements du casting et les fermetures de milestones
              apparaîtront ici.
            </p>
          )}
          <LifecycleControls
            item={w}
            activeLabel={projectStatus(w)}
            label={w.title}
            onChange={(status) =>
              update((s) => ({
                ...s,
                worlds: s.worlds.map((world) =>
                  world.id === w.id ? transitionProject(world, status) : world,
                ),
              }))
            }
          />
          <details className="media-details">
            <summary>Gérer la mission et ajouter des actions</summary>
            <ProjectEditor world={w} />
          </details>
        </section>
      </div>
    </Shell>
  );
}
