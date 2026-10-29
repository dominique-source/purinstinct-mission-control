"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ChartNoAxesCombined,
  Globe2,
  LayoutDashboard,
  Menu,
  Settings2,
  Target,
  Trophy,
} from "lucide-react";
import { useStudio } from "./provider";
import { AnimatedNumber } from "./animated-number";
import { projectGroups } from "@/lib/project-navigation";
import { globalProgress, level, totalXp } from "@/lib/engine";
export function Shell({ children }: { children: React.ReactNode }) {
  const { state } = useStudio();
  const path = usePathname();
  const xp = totalXp(state);
  const lv = level(xp);
  const links = [
    { href: "/", label: "Mission Control", icon: LayoutDashboard },
    { href: "/world/vanier", label: "Les missions", icon: Globe2 },
    { href: "/archive", label: "Missions terminées", icon: Archive },
    { href: "/settings", label: "Paramètres", icon: Settings2 },
  ];
  const dates = `${new Date(state.settings.seasonStart + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long" })} au ${new Date(state.settings.seasonEnd + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" })}`;
  return (
    <div
      className={`campaign-app ${path === "/" ? "dashboard-route" : "detail-route"}`}
    >
      <a className="skip" href="#main">
        Aller au contenu
      </a>
      <header className="command-header">
        <Link
          href="/"
          className="command-brand"
          aria-label="PürInstinct — Mission Control"
        >
          <strong>
            PÜR<span>INSTINCT</span>
            <sup>®</sup>
          </strong>
          <em>Le sport à l’état pur.</em>
        </Link>
        <div className="command-season">
          <Link href="/">MISSION CONTROL</Link>
          <span>{state.settings.seasonTitle.replace(/^SEASON 01 — /, "")}</span>
          <strong>{dates.toUpperCase()}</strong>
        </div>
        <div className="command-stats">
          <div className="hud-stat xp-stat">
            <Trophy />
            <span>
              <strong>
                <AnimatedNumber value={xp} /> <b>XP</b>
              </strong>
              <small>/ {lv.next?.toLocaleString("fr-CA") || "MAX LEVEL"}</small>
              <i className="hud-xp-track">
                <i style={{ width: `${lv.percent}%` }} />
              </i>
            </span>
          </div>
          <div className="hud-stat">
            <ChartNoAxesCombined />
            <span>
              <strong>{globalProgress(state)}%</strong>
              <small>COMPLÉTÉ</small>
            </span>
          </div>
          <div className="hud-stat">
            <Target />
            <span>
              <strong>{projectGroups(state).active.length}</strong>
              <small>MISSIONS ACTIVES</small>
            </span>
          </div>
        </div>
        <Link className="commander" href="/settings">
          <span className="commander-avatar">DS</span>
          <span>
            DOMINIQUE<small>LEVEL {lv.level}</small>
          </span>
        </Link>
        <details className="command-menu">
          <summary aria-label="Ouvrir la navigation">
            <Menu size={23} />
          </summary>
          <nav aria-label="Navigation principale">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
            <div className="menu-worlds">
              {state.worlds.map((w) => (
                <Link href={`/world/${w.id}`} key={w.id}>
                  <span style={{ color: w.accent }}>{w.number}</span>
                  {w.title}
                </Link>
              ))}
            </div>
          </nav>
        </details>
      </header>
      <main id="main" className="command-main">
        {children}
      </main>
      <footer className="command-footer">
        <Link href="/" className="footer-brand">
          PÜR<span>INSTINCT</span>
        </Link>
        <span className="footer-values">
          VISION <i /> DISCIPLINE <i /> IMPACT <i /> COMMUNAUTÉ <i /> 15 AVRIL
          2027
        </span>
        <span>Le sport à l’état pur.</span>
      </footer>
      <nav className="mobile-command-nav" aria-label="Navigation mobile">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            href={href}
            key={href}
            className={
              (
                href === "/"
                  ? path === "/"
                  : path.startsWith(href.split("/").slice(0, 2).join("/"))
              )
                ? "selected"
                : ""
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
