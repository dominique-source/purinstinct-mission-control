"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe2,
  Archive,
  Settings2,
  ChevronRight,
  ArrowUpRight,
  Command,
  Zap,
  Target,
} from "lucide-react";
import { useStudio } from "./provider";
import { level, totalXp } from "@/lib/engine";
export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { state } = useStudio();
  const lv = level(totalXp(state));
  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        Aller au contenu
      </a>
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">
            P<span>ı</span>
          </span>
          <div>
            PÜRINSTINCT<small>STUDIO</small>
          </div>
        </Link>
        <div className="workspace-label">VOTRE ESPACE DE COMMANDE</div>
        <nav>
          {[
            { href: "/", icon: LayoutDashboard, label: "Mission Control" },
            { href: "/world/vanier", icon: Globe2, label: "Les Worlds" },
            { href: "/archive", icon: Archive, label: "Missions terminées" },
            { href: "/settings", icon: Settings2, label: "Paramètres" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={
                (
                  href === "/"
                    ? path === "/"
                    : path.startsWith(href.split("/").slice(0, 2).join("/"))
                )
                  ? "nav-link selected"
                  : "nav-link"
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {href === "/" && <ChevronRight size={14} />}
            </Link>
          ))}
        </nav>
        <div className="sidebar-worlds">
          <div className="workspace-label">
            VOTRE CAMPAGNE{" "}
            <span>{String(state.worlds.length).padStart(2, "0")}</span>
          </div>
          {state.worlds.map((w) => (
            <Link href={`/world/${w.id}`} key={w.id}>
              <i style={{ background: w.accent }} />
              {w.title}
              <span>{w.number}</span>
            </Link>
          ))}
        </div>
        <div className="side-bottom">
          <div className="season-mini">
            <Target size={20} />
            <span>
              UNE VISION.
              <br />
              <strong>UNE MISSION À LA FOIS.</strong>
            </span>
          </div>
          <Link href="/settings" className="user">
            <div className="avatar">DS</div>
            <span>
              Dominique Soucy<small>Fondateur · PürInstinct</small>
            </span>
            <Settings2 size={16} />
          </Link>
        </div>
      </aside>
      <div className="main-wrap">
        <header className="topbar">
          <div>
            <Command size={16} />
            <span>STUDIO</span>
            <ChevronRight size={13} />
            <strong>MISSION CONTROL</strong>
          </div>
          <div>
            <span className="online-dot" />
            <span className="local-label">Sauvegarde locale</span>
            <span className="level-pill">
              <Zap size={13} /> LEVEL {lv.level}
            </span>
            <div className="avatar">DS</div>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer>
          <span>PÜRINSTINCT STUDIO © 2026</span>
          <span>
            CHAQUE MISSION COMPTE. <ArrowUpRight size={12} />
          </span>
        </footer>
      </div>
    </div>
  );
}
