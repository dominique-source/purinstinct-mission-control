"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Flame,
  Lock,
  Target,
  Trophy,
  Zap,
  ChevronRight,
  Flag,
  Radio,
  Layers,
  ScanLine,
  Handshake,
  Focus,
} from "lucide-react";
import { useStudio } from "./provider";
import { Shell } from "./shell";
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
  const xp = totalXp(state),
    lv = level(xp);
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
  const done = state.missions.filter(complete).length;
  const dateRange = `${new Date(state.settings.seasonStart + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "short" })} → ${new Date(state.settings.seasonEnd + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "short", year: "numeric" })}`;
  return (
    <Shell>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span className="blue-dot" />
            {state.settings.seasonTitle}
          </div>
          <h1>
            MISSION <span>CONTROL</span>
            <span className="heading-dot">.</span>
          </h1>
          <p>La vision est grande. La prochaine action est claire.</p>
        </div>
        <div className="season-date">
          <span>CAMPAGNE EN COURS</span>
          <strong>{dateRange.toUpperCase()}</strong>
          <div>
            <i /> PRÊT À AVANCER, DOMINIQUE
          </div>
        </div>
      </div>
      <section className="metrics" aria-label="Votre progression">
        <div className="metric">
          <span>
            <Zap size={14} /> TOTAL XP
          </span>
          <strong>
            {xp.toLocaleString("fr-CA")} <small>XP</small>
          </strong>
          <div>
            <span>LEVEL {lv.level}</span>
            <span>
              {lv.next ? `${lv.next.toLocaleString("fr-CA")} XP` : "MAX LEVEL"}
            </span>
          </div>
          <Progress value={lv.percent} />
        </div>
        <div className="metric">
          <span>
            <Target size={14} /> PROGRESSION GLOBALE
          </span>
          <strong>
            {globalProgress(state)}
            <small>%</small>
          </strong>
          <p>Votre campagne de 30 jours</p>
        </div>
        <div className="metric">
          <span>
            <Focus size={14} /> MISSIONS
          </span>
          <strong>
            {
              state.missions.filter(
                (m) => !m.archived && !complete(m) && !locked(m, state),
              ).length
            }
            <small> ACTIVES</small>
          </strong>
          <p>
            <b className="green">{done.toString().padStart(2, "0")}</b> missions
            terminées
          </p>
        </div>
        <div className="metric">
          <span>
            <Flame size={14} /> CURRENT STREAK
          </span>
          <strong>
            {streak(state)}
            <small> JOUR{streak(state) > 1 ? "S" : ""}</small>
          </strong>
          <p>Garder le mouvement.</p>
        </div>
      </section>
      <div className="primary-grid">
        <section className="mission-hero">
          <div className="court-art" aria-hidden="true">
            <div className="court-floor" />
            <div className="court-hoop" />
            <div className="court-light" />
            <span className="art-word">
              THE
              <br />
              FIRST.
            </span>
            <span className="art-caption">UNE ÉCOLE. TOUT UN MOUVEMENT.</span>
          </div>
          <div className="hero-content">
            <div className="eyebrow">
              <span className="live-dot" /> MISSION ACTUELLE{" "}
              <span className="tag">{current?.id || "FIN"}</span>
            </div>
            <div className="hero-world">
              {currentWorld?.title || "SEASON COMPLETE"}
            </div>
            <h2>
              {current?.id === "V1"
                ? "BÂTIR L’ÉCOLE\nFONDATRICE."
                : current?.title || "LA VISION PREND VIE."}
            </h2>
            <p>
              {currentWorld?.subtitle || "Toutes vos missions sont terminées."}
            </p>
            <div className="hero-progress">
              <Progress value={current ? progress(current) : 100} />
              <strong>{current ? progress(current) : 100}%</strong>
              <span>
                <Zap size={13} /> {current?.xpReward || 0} XP
              </span>
            </div>
            <div className="next-action">
              <span>PROCHAINE ACTION</span>
              <strong>
                {current?.tasks.find((t) => !t.completed)?.title ||
                  "Choisir une nouvelle mission"}
              </strong>
            </div>
            {current && (
              <Link className="button primary" href={`/mission/${current.id}`}>
                OUVRIR LA MISSION <ArrowRight size={17} />
              </Link>
            )}
          </div>
          <div className="hero-bottom">
            <span>
              <i /> FOCUS MODE
            </span>
            <span>
              UNE MISSION À LA FOIS <Focus size={14} />
            </span>
          </div>
        </section>
        <section className="final-boss">
          <div className="eyebrow">
            <Trophy size={14} /> FINAL BOSS <span className="gold-dot" />
          </div>
          <div className="boss-emblem">
            <Trophy size={35} />
          </div>
          <span className="boss-date">
            {new Date(state.settings.finalBossDate)
              .toLocaleDateString("fr-CA", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "America/Toronto",
              })
              .toUpperCase()}
          </span>
          <h2>
            THE FIRST.
            <br />
            THE NEXT LEVEL.
          </h2>
          <p>{state.settings.finalBossTitle}</p>
          <div className="countdown" aria-label="Temps avant la finale">
            {[
              [cd.days, "JOURS"],
              [cd.hours, "HEURES"],
              [cd.minutes, "MINUTES"],
            ].map(([n, label]) => (
              <div key={label}>
                <strong suppressHydrationWarning>
                  {now === null ? "—" : n.toString().padStart(2, "0")}
                </strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
          <Link href="/world/final" className="boss-link">
            LA DESTINATION <ArrowUpRight size={17} />
          </Link>
        </section>
      </div>
      <div className="section-heading">
        <div>
          <span className="eyebrow">LA CAMPAGNE</span>
          <h2>
            {state.worlds.length === 5 ? "CINQ" : state.worlds.length} WORLDS.
            UNE VISION.
          </h2>
        </div>
        <span>
          {state.worlds
            .filter((w) => !worldLocked(w, state))
            .length.toString()
            .padStart(2, "0")}{" "}
          UNLOCKED{" "}
          <span className="muted">
            / {state.worlds.length.toString().padStart(2, "0")} WORLDS
          </span>
        </span>
      </div>
      <section className="world-grid">
        {state.worlds.map((w, i) => {
          const ms = state.missions
            .filter((m) => m.worldId === w.id && !m.archived)
            .sort((a, b) => a.order - b.order);
          const isLocked = worldLocked(w, state);
          const Icon = worldIcons[i % 5];
          return (
            <Link
              href={`/world/${w.id}`}
              className={`world-card ${isLocked ? "is-locked" : ""}`}
              style={{ "--accent": w.accent } as React.CSSProperties}
              key={w.id}
            >
              <div className="world-card-top">
                <span>WORLD {w.number}</span>
                {isLocked ? <Lock size={14} /> : <ArrowUpRight size={16} />}
              </div>
              <div className={`world-visual visual-${i % 5}`}>
                <Icon size={43} strokeWidth={1} />
                <span>{w.number}</span>
              </div>
              <h3>{w.title}</h3>
              <p>{w.subtitle}</p>
              <div className="world-progress">
                <span>{isLocked ? "VERROUILLÉ" : "PROGRESSION"}</span>
                <strong>{weighted(ms)}%</strong>
              </div>
              <Progress value={weighted(ms)} />
              <ul>
                {ms.slice(0, 3).map((m) => (
                  <li key={m.id}>
                    {complete(m) ? (
                      <Check size={12} />
                    ) : locked(m, state) ? (
                      <Lock size={11} />
                    ) : (
                      <span className="task-dot" />
                    )}
                    <span>
                      {m.title.charAt(0) +
                        m.title.slice(1).toLocaleLowerCase("fr")}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="world-card-footer">
                {isLocked ? (
                  <>
                    <Lock size={12} /> Thumbs up de Vanier
                  </>
                ) : (
                  <>
                    <Zap size={12} />
                    {ms
                      .reduce((a, m) => a + m.xpReward, 0)
                      .toLocaleString("fr-CA")}{" "}
                    XP À CONQUÉRIR
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </section>
      <section className="agenda">
        <Link href="/mission/C1">
          <span className="agenda-number">01</span>
          <div>
            <span className="eyebrow">
              <i className="green-dot" />
              {state.settings.todayLabel}
            </span>
            <h3>CLINIQUES / STRIPE</h3>
            <p>{state.settings.todayGoal}</p>
          </div>
          <ArrowUpRight size={22} />
        </Link>
        <Link href="/mission/I1">
          <span className="agenda-number">02</span>
          <div>
            <span className="eyebrow">{state.settings.nextLabel}</span>
            <h3>INSTINCT / ZONE3</h3>
            <p>{state.settings.nextGoal}</p>
          </div>
          <ArrowUpRight size={22} />
        </Link>
      </section>
      <div className="bottom-note">
        <span>
          <span className="blue-dot" />{" "}
          {ready
            ? "PROGRESSION SAUVEGARDÉE SUR CET APPAREIL"
            : "CHARGEMENT DE LA PROGRESSION"}
        </span>
        <span>
          OPEN. FOCUS. COMPLETE. REPEAT. <ChevronRight size={12} />
        </span>
      </div>
    </Shell>
  );
}
