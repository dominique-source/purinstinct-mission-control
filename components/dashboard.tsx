"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Flag,
  Flame,
  Layers,
  Lock,
  Radio,
  ScanLine,
  Handshake,
  Sun,
  Trophy,
  Zap,
  Target,
  ChartNoAxesCombined,
} from "lucide-react";
import { useStudio } from "./provider";
import { Shell } from "./shell";
import { CampaignArt, worldArt } from "./campaign-art";
import {
  complete,
  countdown,
  globalProgress,
  level,
  locked,
  progress,
  streak,
  suggest,
  totalXp,
  weighted,
  worldLocked,
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
  const { state, ready } = useStudio();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);
  const current =
    state.missions.find(
      (m) =>
        m.id === state.currentId &&
        !m.archived &&
        !locked(m, state) &&
        !complete(m),
    ) || suggest(state);
  const currentWorld = state.worlds.find((w) => w.id === current?.worldId);
  const cd = countdown(
    state.settings.finalBossDate,
    now ?? new Date("2026-10-26T12:00:00-04:00").getTime(),
  );
  const xp = totalXp(state),
    lv = level(xp);
  const missionProgress = current ? progress(current) : 100;
  const milestones = ["V1", "V2", "V4", "V3", "F1"]
    .map((id) => state.missions.find((m) => m.id === id))
    .filter((m) => !!m);
  const today = state.missions.find((m) => m.id === "C1");
  const tomorrow = state.missions.find((m) => m.id === "I1");
  return (
    <Shell>
      <div className="campaign-dashboard">
        <section
          className="campaign-stage"
          aria-label="Votre mission prioritaire"
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
            PLUS DE
            <br />
            MOUVEMENT.
            <br />
            <span>PLUS D’AVENIR.</span>
          </div>
          <section className="current-mission-frame">
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
                MISSION ACTUELLE
                <span>
                  {current?.id || "FIN"} / {current ? "EN COURS" : "COMPLETE"}
                </span>
              </div>
              <div
                className={`current-mission-title ${(currentWorld?.title.length || 0) > 8 ? "long-world-title" : ""}`}
              >
                {currentWorld?.title || "SEASON COMPLETE"}
              </div>
              <h1>
                {current?.id === "V1"
                  ? "BÂTIR L’ÉCOLE FONDATRICE"
                  : current?.title || "LA VISION PREND VIE."}
                <ChevronRight size={20} />
              </h1>
              <div className="current-progress">
                <Progress value={missionProgress} label="Mission actuelle" />
                <strong>{missionProgress}%</strong>
              </div>
              <div className="current-next">
                <span>PROCHAINE ACTION :</span>
                <CalendarDays size={16} />
                <strong>
                  {current?.tasks.find((t) => !t.completed)?.title ||
                    "Choisir une nouvelle mission"}
                </strong>
              </div>
              <div className="current-mission-bottom">
                <span>
                  <Zap size={13} />
                  {current?.xpReward || 0} XP · BONUS MISSION
                </span>
                {current && (
                  <Link
                    href={`/mission/${current.id}`}
                    className="mission-launch"
                  >
                    OUVRIR LA MISSION <ArrowRight size={15} />
                  </Link>
                )}
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
          className="world-grid campaign-worlds"
          aria-label="Les Worlds de votre campagne"
        >
          {state.worlds.map((w) => {
            const ms = state.missions
              .filter((m) => m.worldId === w.id && !m.archived)
              .sort((a, b) => a.order - b.order);
            const isLocked = worldLocked(w, state);
            const isCurrent = currentWorld?.id === w.id;
            return (
              <Link
                href={`/world/${w.id}`}
                className={`world-card campaign-tile ${isLocked ? "is-locked" : ""} ${isCurrent ? "current-world" : ""}`}
                style={{ "--accent": w.accent } as React.CSSProperties}
                key={w.id}
              >
                <CampaignArt worldId={w.id} />
                <div className="tile-shade" />
                <div className="tile-top">
                  <span className="world-badge">
                    {w.number}
                    <small>/{state.worlds.length}</small>
                  </span>
                  <div>
                    <span>WORLD {w.number}</span>
                    <h2>{w.title}</h2>
                    <p>{w.subtitle}</p>
                  </div>
                  {isLocked && <Lock size={15} className="tile-lock" />}
                </div>
                <span className="tile-status">
                  {isLocked
                    ? "LOCKED"
                    : isCurrent
                      ? "MISSION ACTIVE"
                      : "UNLOCKED"}
                </span>
                <div className="tile-content">
                  <div className="tile-progress">
                    <strong>{weighted(ms)}%</strong>
                    <Progress
                      value={weighted(ms)}
                      label={`Progression ${w.title}`}
                    />
                    <ChevronRight size={23} />
                  </div>
                  <ul>
                    {ms.slice(0, 4).map((m) => (
                      <li key={m.id}>
                        <span
                          className={`objective-marker ${complete(m) ? "objective-complete" : ""}`}
                        >
                          {complete(m) && <Check size={10} />}
                        </span>
                        <span>
                          {m.title.charAt(0) +
                            m.title.slice(1).toLocaleLowerCase("fr")}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="tile-reward">
                    <div>
                      <span>RÉCOMPENSE</span>
                      <strong>
                        {worldArt[w.id]?.reward || "NOUVEAU NIVEAU"}
                      </strong>
                      <small>
                        {ms
                          .reduce((a, m) => a + m.xpReward, 0)
                          .toLocaleString("fr-CA")}{" "}
                        XP BONUS
                      </small>
                    </div>
                    {isLocked ? <Lock size={21} /> : <Trophy size={20} />}
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
        <section className="tactical-grid" aria-label="Objectifs tactiques">
          <div className="tactical-panel today-panel">
            <header>
              <Sun size={22} />
              <div>
                <h2>{state.settings.todayLabel}</h2>
                <span>PRIORITÉ IMMÉDIATE</span>
              </div>
            </header>
            <Link href="/mission/C1" className="tactical-objective">
              <Target size={30} />
              <div>
                <h3>CLINIQUES / STRIPE</h3>
                <span>MISSION PRIORITAIRE</span>
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
                <span>PROCHAINE SÉQUENCE</span>
              </div>
            </header>
            <Link href="/mission/I1" className="tactical-objective">
              <Radio size={30} />
              <div>
                <h3>INSTINCT</h3>
                <span>IMMERSION TOTALE</span>
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
                        : locked(m, state)
                          ? `Après ${m.dependencies.join(", ") || "V3"}`
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
                <Link
                  href={`/world/${w.id}`}
                  key={w.id}
                  style={{ "--accent": w.accent } as React.CSSProperties}
                >
                  <span>
                    {w.title.charAt(0) + w.title.slice(1).toLowerCase()}
                  </span>
                  <Progress
                    value={weighted(
                      state.missions.filter(
                        (m) => m.worldId === w.id && !m.archived,
                      ),
                    )}
                    label={`Progression ${w.title}`}
                  />
                  <strong>
                    {weighted(
                      state.missions.filter(
                        (m) => m.worldId === w.id && !m.archived,
                      ),
                    )}
                    %
                  </strong>
                  {worldLocked(w, state) && <Lock size={10} />}
                </Link>
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
            {state.missions.filter(complete).length} MISSIONS FERMÉES
          </span>
          <span>OPEN. FOCUS. COMPLETE. REPEAT.</span>
        </div>
      </div>
    </Shell>
  );
}
