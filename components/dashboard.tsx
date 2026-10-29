"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Flag,
  Flame,
  Layers,
  Radio,
  ScanLine,
  Handshake,
  Sun,
  Trophy,
  Zap,
  Target,
  ChartNoAxesCombined,
} from "lucide-react";
import { isClosed, missionLifecycle } from "@/lib/lifecycle";
import { actionable } from "@/lib/engine";
import type { World } from "@/types";
import { NewProject } from "./new-project";
import { useStudio } from "./provider";
import { Shell } from "./shell";
import { CampaignArt, worldArt } from "./campaign-art";
import {
  projectBrowser,
  projectGroups,
  projectActivity,
  selectProject,
  subMissions,
  projectProgress,
  projectObjective,
  projectStatus,
  projectNextAction,
  projectReward,
} from "@/lib/project-navigation";
import {
  complete,
  countdown,
  globalProgress,
  level,
  recommendedAfter,
  sequenceReady,
  missionStatus,
  progress,
  streak,
  totalXp,
} from "@/lib/engine";
export const worldIcons = [Flag, Radio, Layers, ScanLine, Handshake];
export function Progress({
  value,
  label = "Progression",
}: {
  value: number;
  label?: string;
}) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function Dashboard() {
  const { state, ready, update } = useStudio();
  const router = useRouter();
  const [previewId, setPreviewId] = useState<string>();
  const heroRef = useRef<HTMLElement>(null);
  const baseBrowser = projectBrowser(state);
  const preview = state.worlds.find((w) => w.id === previewId);
  const projects =
    preview && isClosed(preview)
      ? [...baseBrowser.projects, preview]
      : baseBrowser.projects;
  const selected = preview || baseBrowser.selected;
  const browser = {
    projects,
    selected,
    index: selected ? projects.findIndex((w) => w.id === selected.id) : 0,
  };
  const selectMission = (id: string, reveal = false) => {
    setPreviewId(state.worlds.find((w) => w.id === id && isClosed(w))?.id);
    if (!state.worlds.some((w) => w.id === id && isClosed(w)))
      update((s) => selectProject(s, id));
    if (reveal)
      heroRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
  };
  const moveMission = (delta: number) => {
    const project =
      browser.projects[
        (browser.index + delta + browser.projects.length) %
          browser.projects.length
      ];
    if (project) selectMission(project.id);
  };
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  const current = browser.selected;
  const action = current ? projectNextAction(current, state) : undefined;
  const currentWorld = current;
  const cd = countdown(
    state.settings.finalBossDate,
    now ?? new Date("2026-10-26T12:00:00-04:00").getTime(),
  );
  const xp = totalXp(state),
    lv = level(xp);
  const missionProgress = current ? projectProgress(current, state) : 0;
  const milestones = ["V1", "V2", "V4", "V3", "F1"]
    .map((id) => state.missions.find((m) => m.id === id))
    .filter((m) => !!m)
    .filter((m) => actionable(m, state));
  const today = state.missions.find((m) => m.id === "C1");
  const tomorrow = state.missions.find((m) => m.id === "I1");
  const todayParent = state.worlds.find((w) => w.id === today?.worldId);
  const tomorrowParent = state.worlds.find((w) => w.id === tomorrow?.worldId);
  const groups = projectGroups(state);
  const renderProjectCard = (w: World) => {
    const ms = subMissions(state, w.id);
    const value = projectProgress(w, state);
    const isCurrent = current?.id === w.id;
    return (
      <article
        key={w.id}
        className={`world-card campaign-tile project-card project-${isClosed(w) ? "archived" : projectActivity(w)} ${isClosed(w) ? "lifecycle-closed" : ""} ${isCurrent ? "current-world" : ""}`}
        style={{ "--accent": w.accent } as React.CSSProperties}
        data-project-card={w.id}
        data-project-activity={isClosed(w) ? w.status : projectActivity(w)}
      >
        <button
          type="button"
          onClick={() => selectMission(w.id, true)}
          className="project-card-open"
          aria-label={`Afficher la mission ${w.title}`}
          aria-pressed={isCurrent}
        >
          <span className="sr-only">
            Afficher {w.title} — {value} %
          </span>
        </button>
        <CampaignArt worldId={w.id} />
        <div className="tile-shade" />
        <div className="tile-top">
          <span className="world-badge">
            {w.number}
            <small>/{state.worlds.length}</small>
          </span>
          <div>
            <span>MISSION PRINCIPALE</span>
            <h2>{w.title}</h2>
            <p>{w.partners ? `Avec ${w.partners}` : w.subtitle}</p>
          </div>
        </div>
        <span className="tile-status">{projectStatus(w)}</span>
        <div className="tile-content">
          <div className="tile-progress">
            <span className="tile-progress-value">
              <strong data-project-progress={w.id}>{value}%</strong>
              <small>PROGRESSION GLOBALE</small>
            </span>
            <Progress value={value} label={`Progression globale ${w.title}`} />
            <ChevronRight size={23} />
          </div>
          <div className="project-subtasks-label">
            {ms.length
              ? "SOUS-MISSIONS · OUVRIR LE DÉTAIL"
              : "AJOUTEZ VOS SOUS-MISSIONS"}
          </div>
          <ul>
            {ms.slice(0, 4).map((m) => (
              <li key={m.id}>
                <Link
                  href={`/mission/${m.id}`}
                  className={`project-submission-link ${missionLifecycle(m) !== "active" ? "lifecycle-closed" : ""}`}
                  aria-label={`Ouvrir la sous-mission ${m.id} — ${m.title}`}
                >
                  <span
                    className={`objective-marker ${complete(m) ? "objective-complete" : ""}`}
                  >
                    {complete(m) && <Check size={10} />}
                  </span>
                  <span className="mission-preview-title">
                    {m.title.charAt(0) +
                      m.title.slice(1).toLocaleLowerCase("fr")}
                  </span>
                  <strong>
                    {missionLifecycle(m) === "cancelled"
                      ? "ANNULÉE"
                      : missionLifecycle(m) === "completed"
                        ? "COMPLÉTÉE · 100%"
                        : `${progress(m)}%`}
                  </strong>
                </Link>
              </li>
            ))}
          </ul>
          <div className="tile-reward">
            <div>
              <span>RÉCOMPENSE</span>
              <strong>{worldArt[w.id]?.reward || "NOUVEAU NIVEAU"}</strong>
              <small>
                {projectReward(w, state).toLocaleString("fr-CA")} XP BONUS
              </small>
            </div>
          </div>
          <Link
            href={`/world/${w.id}`}
            className="project-enter button secondary"
            aria-label={`Entrer dans la mission ${w.title}`}
          >
            ENTRER <ArrowRight size={17} />
          </Link>
        </div>
      </article>
    );
  };
  return (
    <Shell>
      <div className="campaign-dashboard">
        <NewProject onCreated={() => setPreviewId(undefined)} />
        <section
          className="campaign-stage"
          aria-label="Parcourir les missions actives"
        >
          <div className="stage-photo" aria-hidden="true">
            <Image
              src="/images/campaign-backdrop.webp"
              alt=""
              fill
              priority
              sizes="100vw"
            />
          </div>
          <div className="stage-coordinates" aria-hidden="true">
            <span>46°47′ N / 71°17′ O</span>
            <span>OPÉRATION : ÉCOLE FONDATRICE</span>
          </div>
          <div className="stage-slogan" aria-hidden="true">
            LE SPORT
            <br />
            À L’ÉTAT
            <br />
            <span>PUR.</span>
          </div>
          <section
            className="current-mission-frame"
            ref={heroRef}
            aria-label="Navigateur de missions actives"
          >
            <CampaignArt
              worldId={currentWorld?.id || "vanier"}
              className="current-mission-photo"
              priority
            />
            <svg
              className="mission-frame-outline"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon
                points="0.4,7 2.8,0.7 33,0.7 36,6 96,6 99.6,14 99.6,93 97.2,99.3 2.8,99.3 0.4,93"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="mission-hud-corners" aria-hidden="true" />
            <div className="current-mission-content">
              <div className="mission-kicker">
                <span className="live-dot" />
                {current && isClosed(current)
                  ? "HISTORIQUE"
                  : "MISSIONS ACTIVES"}
                <div className="mission-browser-controls">
                  <button
                    type="button"
                    onClick={() => moveMission(-1)}
                    disabled={browser.projects.length < 2}
                    aria-label="Mission précédente"
                  >
                    <ChevronUp size={17} />
                  </button>
                  <label className="sr-only" htmlFor="mission-browser">
                    Choisir une mission active
                  </label>
                  <select
                    id="mission-browser"
                    value={current?.id || ""}
                    disabled={!browser.projects.length}
                    onChange={(e) => selectMission(e.target.value)}
                  >
                    {!current && (
                      <option value="">Aucune mission principale</option>
                    )}
                    {browser.projects.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title} · {projectProgress(w, state)} %
                      </option>
                    ))}
                  </select>
                  <span
                    className="mission-browser-count"
                    aria-label={`Mission ${current ? browser.index + 1 : 0} sur ${browser.projects.length}`}
                  >
                    {current ? browser.index + 1 : 0}/{browser.projects.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveMission(1)}
                    disabled={browser.projects.length < 2}
                    aria-label="Mission suivante"
                  >
                    <ChevronDown size={17} />
                  </button>
                </div>
              </div>
              <div
                key={current?.id || "complete"}
                className="mission-selection"
                aria-live="polite"
                aria-atomic="true"
              >
                <div
                  className={`current-mission-title ${(currentWorld?.title.length || 0) > 8 ? "long-world-title" : ""}`}
                >
                  {currentWorld?.title || "AUCUNE MISSION ACTIVE"}
                </div>
                <h1>
                  {current
                    ? projectObjective(current)
                    : "CONSULTEZ VOTRE HISTORIQUE."}
                  <ChevronRight size={20} />
                </h1>
                <span className="project-hero-status" data-project-status>
                  {current ? projectStatus(current) : "AVAILABLE"} · MISSION
                  PRINCIPALE
                </span>
                <div className="current-progress">
                  <Progress
                    value={missionProgress}
                    label={`Progression de la mission ${current?.id || "terminée"}`}
                  />
                  <strong data-project-progress={current?.id}>
                    {missionProgress}%
                  </strong>
                </div>
                <div className="current-next">
                  <span>PROCHAINE ACTION :</span>
                  <CalendarDays size={16} />
                  <strong>
                    {action ? (
                      <Link href={`/mission/${action.mission.id}`}>
                        {action.mission.id} —{action.task.title}
                      </Link>
                    ) : current && projectStatus(current) === "WAITING" ? (
                      "Aucune autre action disponible. Reprendre une mission en attente ou en pause."
                    ) : (
                      "Choisir une nouvelle mission"
                    )}
                  </strong>
                </div>
                <div className="current-mission-bottom">
                  <span>
                    <Zap size={13} />
                    {current ? projectReward(current, state) : 0} XP · BONUS
                    MISSION
                  </span>
                  {current && (
                    <Link
                      href={`/world/${current.id}`}
                      className="mission-launch"
                    >
                      ENTRER DANS LA MISSION <ArrowRight size={15} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
          <section className="final-boss-frame">
            <Trophy className="boss-trophy" size={48} />
            <span className="boss-overline">COMPTE À REBOURS</span>
            <div className="boss-label">FINAL BOSS</div>
            <h2>
              {new Date(state.settings.finalBossDate)
                .toLocaleDateString("fr-CA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  timeZone: "America/Toronto",
                })
                .toUpperCase()}
            </h2>
            <div className="boss-lower">
              <p>{state.settings.finalBossTitle}</p>
              <div
                className="boss-timer"
                aria-label="Compte à rebours vers le Final Boss"
              >
                {[
                  [cd.days, "JOURS"],
                  [cd.hours, "HEURES"],
                  [cd.minutes, "MIN"],
                ].map(([n, label]) => (
                  <div key={label}>
                    <strong>
                      {now === null ? "—" : n.toString().padStart(2, "0")}
                    </strong>
                    <small>{label}</small>
                  </div>
                ))}
              </div>
            </div>
            <Link className="boss-destination" href="/world/final">
              LA DESTINATION <ArrowUpRight size={15} />
            </Link>
          </section>
        </section>
        <div className="mobile-xp-strip">
          <Zap size={22} />
          <strong>{xp.toLocaleString("fr-CA")} XP</strong>
          <span>LEVEL {lv.level}</span>
          <Progress value={lv.percent} label="Prochain niveau" />
          <small>
            {lv.next ? `${lv.next.toLocaleString("fr-CA")} XP` : "MAX"}
          </small>
        </div>
        <section
          className="mission-collection"
          aria-labelledby="missions-heading"
        >
          <header className="mission-collection-heading">
            <h2 id="missions-heading">MISSIONS</h2>
            <div className="mission-priority-legend">
              <span>ACTIVES · {groups.active.length}</span>
              <span>AVAILABLE / EN ATTENTE · {groups.available.length}</span>
            </div>
          </header>
          {groups.live.length ? (
            <div
              className="world-grid campaign-worlds mission-live-row"
              role="group"
              aria-label="Missions actives puis disponibles"
            >
              {groups.live.map(renderProjectCard)}
            </div>
          ) : (
            <p className="mission-empty-row">
              Aucune mission en cours. Vous pouvez créer ou réactiver une
              mission.
            </p>
          )}
          {!!groups.archived.length && (
            <>
              <div className="mission-archive-heading">
                ARCHIVES / TERMINÉES <span>{groups.archived.length}</span>
              </div>
              <div
                className="world-grid campaign-worlds mission-archive-row"
                role="group"
                aria-label="Missions complétées et annulées"
              >
                {groups.archived.map(renderProjectCard)}
              </div>
            </>
          )}
        </section>
        <section className="tactical-grid" aria-label="Objectifs tactiques">
          <div className="tactical-panel today-panel">
            <header>
              <Sun size={22} />
              <div>
                <h2>{state.settings.todayLabel}</h2>
                <span>
                  {today && actionable(today, state)
                    ? "PRIORITÉ IMMÉDIATE"
                    : "HISTORIQUE"}
                </span>
              </div>
            </header>
            <Link
              href="/mission/C1"
              className={`tactical-objective ${today && !actionable(today, state) ? "lifecycle-closed" : ""}`}
            >
              <Target size={30} />
              <div>
                <h3>CLINIQUES / STRIPE</h3>
                <span>
                  {today && actionable(today, state)
                    ? "MISSION PRIORITAIRE"
                    : today
                      ? todayParent && isClosed(todayParent)
                        ? projectStatus(todayParent)
                        : missionStatus(today, state)
                      : "HISTORIQUE"}
                </span>
                <p>{state.settings.todayGoal}</p>
              </div>
              <strong className="tactical-ring">
                {today ? progress(today) : 0}%
              </strong>
            </Link>
          </div>
          <div className="tactical-panel tomorrow-panel">
            <header>
              <CalendarDays size={22} />
              <div>
                <h2>{state.settings.nextLabel}</h2>
                <span>
                  {tomorrow && actionable(tomorrow, state)
                    ? "PROCHAINE SÉQUENCE"
                    : "HISTORIQUE"}
                </span>
              </div>
            </header>
            <Link
              href="/mission/I1"
              className={`tactical-objective ${tomorrow && !actionable(tomorrow, state) ? "lifecycle-closed" : ""}`}
            >
              <Radio size={30} />
              <div>
                <h3>INSTINCT</h3>
                <span>
                  {tomorrow && actionable(tomorrow, state)
                    ? "IMMERSION TOTALE"
                    : tomorrow
                      ? tomorrowParent && isClosed(tomorrowParent)
                        ? projectStatus(tomorrowParent)
                        : missionStatus(tomorrow, state)
                      : "HISTORIQUE"}
                </span>
                <p>{state.settings.nextGoal}</p>
              </div>
              <strong className="tactical-ring">
                {tomorrow ? progress(tomorrow) : 0}%
              </strong>
            </Link>
          </div>
          <div className="tactical-panel milestones-panel">
            <header>
              <Flag size={21} />
              <h2>PROCHAINS JALONS</h2>
            </header>
            <ol>
              {milestones.map((m, i) => (
                <li key={m.id}>
                  <Link href={`/mission/${m.id}`}>
                    <span>{complete(m) ? <Check size={10} /> : i + 1}</span>
                    <strong>
                      {m.title.charAt(0) + m.title.slice(1).toLowerCase()}
                    </strong>
                    <small>
                      {complete(m)
                        ? "COMPLETE"
                        : m.workState
                          ? missionStatus(m, state)
                          : !sequenceReady(m, state)
                            ? `Conseillé après ${recommendedAfter(m, state).join(", ")}`
                            : "DISPONIBLE"}
                    </small>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
          <div className="tactical-panel global-panel">
            <header>
              <ChartNoAxesCombined size={21} />
              <h2>PROGRESSION GLOBALE</h2>
              <strong>{globalProgress(state)}%</strong>
            </header>
            <div className="world-intelligence">
              {state.worlds.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() =>
                    isClosed(w)
                      ? router.push(`/world/${w.id}`)
                      : selectMission(w.id, true)
                  }
                  aria-label={`${isClosed(w) ? "Consulter" : "Afficher"} ${w.title} depuis la vue d’ensemble`}
                  className={isClosed(w) ? "lifecycle-closed" : ""}
                  style={{ "--accent": w.accent } as React.CSSProperties}
                >
                  <span>
                    {w.title.charAt(0) + w.title.slice(1).toLowerCase()}
                  </span>
                  <Progress
                    value={projectProgress(w, state)}
                    label={`Progression globale ${w.title}`}
                  />
                  <strong data-project-progress={w.id}>
                    {projectProgress(w, state)}%
                  </strong>
                </button>
              ))}
            </div>
            <div className="intelligence-quote">
              ON BÂTIT
              <br />
              QUELQUE CHOSE
              <br />
              <span>DE VRAIMENT GRAND.</span>
            </div>
          </div>
        </section>
        <div className="campaign-statusline">
          <span>
            <span className="blue-dot" />
            {ready
              ? "PROGRESSION SAUVEGARDÉE SUR CET APPAREIL"
              : "CHARGEMENT DE LA CAMPAGNE"}
          </span>
          <span>
            <Flame size={12} />
            {streak(state)} JOURS DE STREAK <i />{" "}
            {
              state.missions.filter((m) => missionLifecycle(m) !== "active")
                .length
            }{" "}
            MISSIONS FERMÉES
          </span>
          <span>OPEN. FOCUS. COMPLETE. REPEAT.</span>
        </div>
      </div>
    </Shell>
  );
}
