"use client";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Users,
  Zap,
  TrendingUp,
  RotateCcw,
} from "lucide-react";
import { Shell } from "./shell";
import {
  defaultSchoolDraft,
  parseSchoolDraft,
  schoolFinance,
  SCHOOL_STORAGE_KEY,
  type SchoolYear,
  type SchoolDraft,
} from "@/lib/school-finance";
const money = (value: number | null) =>
  value === null
    ? "À définir"
    : new Intl.NumberFormat("fr-CA", {
        style: "currency",
        currency: "CAD",
        maximumFractionDigits: 0,
      }).format(value);
const percent = (value: number | null) =>
  value === null
    ? "Non calculable"
    : `${value.toLocaleString("fr-CA", { maximumFractionDigits: 1 })} %`;
type NumericKey = Exclude<keyof SchoolYear, "conference">;
const subscribeHydration = () => () => {};
function loadDraft() {
  try {
    const raw = localStorage.getItem(SCHOOL_STORAGE_KEY);
    const saved = raw ? parseSchoolDraft(raw) : null;
    return {
      draft: saved ?? defaultSchoolDraft(),
      blocked: Boolean(raw && !saved),
      message:
        raw && !saved
          ? "Brouillon incompatible conservé. Réinitialisez pour enregistrer un nouveau scénario."
          : "Brouillon sur cet appareil uniquement.",
    };
  } catch {
    return {
      draft: defaultSchoolDraft(),
      blocked: true,
      message: "Stockage indisponible. Vos modifications restent en mémoire.",
    };
  }
}
export function SchoolSimulator() {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => true,
    () => false,
  );
  return hydrated ? (
    <SchoolSimulatorEditor />
  ) : (
    <Shell>
      <p role="status">Chargement du simulateur…</p>
    </Shell>
  );
}
function SchoolSimulatorEditor() {
  const [initial] = useState(loadDraft);
  const [draft, setDraft] = useState<SchoolDraft>(initial.draft);
  const [year, setYear] = useState(0);
  const [storageBlocked, setStorageBlocked] = useState(initial.blocked);
  const [message, setMessage] = useState(initial.message);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState("event");
  const save = (next: SchoolDraft, reset = false) => {
    setDraft(next);
    if (storageBlocked && !reset) return;
    try {
      localStorage.setItem(SCHOOL_STORAGE_KEY, JSON.stringify(next));
      setStorageBlocked(false);
      setMessage("Brouillon enregistré sur cet appareil uniquement.");
    } catch {
      setMessage(
        "Enregistrement impossible. Vos modifications restent en mémoire.",
      );
    }
  };
  const input = draft.years[year];
  const result = schoolFinance(input);
  const update = (patch: Partial<SchoolYear>) =>
    save({
      ...draft,
      years: draft.years.map((item, index) =>
        index === year ? { ...item, ...patch } : item,
      ) as SchoolDraft["years"],
    });
  const field = (key: NumericKey, label: string, unit?: string) => (
    <label className="sim-field" key={key}>
      <span>{label}</span>
      <div>
        <input
          aria-label={label}
          type="number"
          min={key === "days" ? 1 : 0}
          max={1e9}
          step={
            [
              "students",
              "zones",
              "courts",
              "teachers",
              "staff",
              "coordinators",
              "days",
            ].includes(key)
              ? 1
              : "any"
          }
          value={input[key] ?? ""}
          placeholder={key === "priceOverride" ? "Automatique" : undefined}
          onChange={(event) => {
            const raw = event.target.value;
            if (key === "priceOverride" && raw === "") {
              update({ priceOverride: null });
              return;
            }
            const value = Number(raw);
            if (
              raw !== "" &&
              event.target.validity.valid &&
              Number.isFinite(value)
            )
              update({ [key]: value });
          }}
        />
        {unit && <small>{unit}</small>}
      </div>
    </label>
  );
  const totals = draft.years.map(schoolFinance);
  return (
    <Shell>
      <div className="simulator">
        <Link className="sim-back" href="/finances">
          <ArrowLeft size={16} /> Finances
        </Link>
        <header className="sim-hero">
          <div>
            <p className="sim-eyebrow">
              <ShieldCheck size={15} /> FINANCES / ESPACE PRIVÉ
            </p>
            <h1>
              SIMULATEUR <span>ÉCOLES</span>
            </h1>
            <p>Vos ressources. Votre événement. Votre vision.</p>
            <span className="sim-sample">
              SCÉNARIO EXEMPLE · ESTIMATIONS EN $ CA
            </span>
          </div>
          <div className="sim-hero-stat">
            <Zap />
            <strong>{result.capacity}</strong>
            <span>places simultanées</span>
          </div>
        </header>
        <nav className="sim-tabs" aria-label="Vues du simulateur">
          {[
            ["event", "01", "Mon événement"],
            ["result", "02", "Mon résultat"],
            ["vision", "03", "Ma vision 3 ans"],
          ].map(([id, number, label]) => (
            <button
              key={id}
              aria-pressed={view === id}
              onClick={() => setView(id)}
            >
              <span>{number}</span>
              {label}
            </button>
          ))}
        </nav>
        <div className="sim-toolbar">
          <div className="sim-years" role="group" aria-label="Année à modifier">
            {[0, 1, 2].map((index) => (
              <button
                aria-pressed={year === index}
                key={index}
                onClick={() => setYear(index)}
              >
                Année {index + 1}
              </button>
            ))}
          </div>
          <span>Chaque année est indépendante</span>
        </div>
        {view === "event" && (
          <section className="sim-event" aria-labelledby="sim-event-title">
            <div className="sim-panel">
              <p className="sim-eyebrow">
                01 / MON ÉVÉNEMENT · ANNÉE {year + 1}
              </p>
              <h2 id="sim-event-title">DÉFINIR LE TERRAIN</h2>
              <div className="sim-fields">
                {field("students", "Élèves à accueillir")}
                {field("zones", "Zones d’activité")}
                {field("courts", "Terrains PürInstinct")}
                {field("teachers", "Enseignants disponibles")}
                {field("staff", "Intervenants PürInstinct")}
                {field("hours", "Heures payées par intervenant", "h")}
              </div>
              <p className="sim-muted">
                Le nombre d’élèves sert à planifier la capacité. Le prix dépend
                des ressources et de la marge choisie.
              </p>
            </div>
            <aside className="sim-panel sim-capacity">
              <Users />
              <p className="sim-eyebrow">CAPACITÉ & ÉQUIPE</p>
              <strong>
                {result.capacity}
                <small>places simultanées</small>
              </strong>
              <p>
                {result.activeCapacity} en activité + {result.activeCapacity} en
                attente
              </p>
              <div className="sim-capacity-bottom">
                <span>
                  <b>{result.waves ?? "—"}</b> vagues minimum
                </span>
                <span>
                  <b>{result.minimumStaff}</b> intervenants calculés
                </span>
              </div>
              <p className="sim-muted">
                {result.stations} postes − {input.teachers} enseignants, minimum
                0, + {input.coordinators} coordonnateurs.
              </p>
            </aside>
          </section>
        )}
        {(view === "event" || view === "result") && (
          <section className="sim-results" aria-label="Mon résultat">
            <div>
              <span>COÛT DE PRODUCTION</span>
              <strong>{money(result.cost)}</strong>
              <small>Ressources et production</small>
            </div>
            <div className="sim-price">
              <span>PRIX PROPOSÉ À L’ÉCOLE</span>
              <strong>{money(result.price)}</strong>
              <small>
                {input.priceOverride === null
                  ? "Calculé selon la marge cible"
                  : "Prix saisi manuellement"}
              </small>
            </div>
            <div
              className={
                result.profit !== null && result.profit < 0
                  ? "sim-loss"
                  : "sim-profit"
              }
            >
              <span>MARGE BRUTE</span>
              <strong>{money(result.profit)}</strong>
              <small>{percent(result.margin)} · avant frais généraux</small>
            </div>
          </section>
        )}
        {view === "result" && (
          <section className="sim-panel">
            <p className="sim-eyebrow">02 / MON RÉSULTAT · ANNÉE {year + 1}</p>
            <h2>CHOISIR VOTRE ÉQUILIBRE</h2>
            <div className="sim-fields">
              {field("targetMargin", "Marge brute cible", "%")}
              {field("priceOverride", "Prix à l’école · saisie libre", "$ CA")}
            </div>
            <p>
              Prix calculé selon la marge cible :{" "}
              <b>{money(result.suggestedPrice)}</b>.
            </p>
            <button
              className="sim-action"
              onClick={() => update({ priceOverride: null })}
            >
              Utiliser le prix calculé
            </button>
            <p className="sim-muted">
              Coût ÷ (1 − marge cible). Une saisie libre conserve votre prix et
              recalcule la marge réelle.
            </p>
          </section>
        )}
        {view === "vision" && (
          <section aria-labelledby="sim-vision-title">
            <p className="sim-eyebrow">03 / MA VISION 3 ANS</p>
            <h2 id="sim-vision-title">CONSTRUIRE LA CONTINUITÉ</h2>
            <div className="sim-comparison">
              {totals.map((item, index) => (
                <article className="sim-panel" key={index}>
                  <p className="sim-eyebrow">ANNÉE {index + 1}</p>
                  <h3>{["LANCER", "DÉVELOPPER", "PÉRENNISER"][index]}</h3>
                  <span>Prix à l’école</span>
                  <strong>{money(item.price)}</strong>
                  <dl>
                    <div>
                      <dt>Production</dt>
                      <dd>{money(item.cost)}</dd>
                    </div>
                    <div>
                      <dt>Marge brute</dt>
                      <dd>{money(item.profit)}</dd>
                    </div>
                    <div>
                      <dt>Marge</dt>
                      <dd>{percent(item.margin)}</dd>
                    </div>
                    <div>
                      <dt>Équipe PürInstinct</dt>
                      <dd>
                        {draft.years[index].staff} × {draft.years[index].hours}{" "}
                        h
                      </dd>
                    </div>
                  </dl>
                  <button
                    className="sim-action"
                    onClick={() => {
                      setYear(index);
                      setView("event");
                    }}
                  >
                    Modifier l’année {index + 1} →
                  </button>
                </article>
              ))}
            </div>
            <div className="sim-total">
              <TrendingUp />
              <span>Marge brute cumulée sur trois ans</span>
              <strong>
                {totals.every((item) => item.profit !== null)
                  ? money(totals.reduce((sum, item) => sum + item.profit!, 0))
                  : "À définir"}
              </strong>
            </div>
            <p className="sim-muted">
              La participation de l’école peut réduire le personnel requis.
              Aucune réduction automatique. Conférence généralement renouvelée à
              l’année 4.
            </p>
          </section>
        )}
        <div className="sim-warnings" role="status">
          {input.staff !== result.minimumStaff && (
            <p>
              Équipe à valider : {input.staff} intervenants saisis, contre{" "}
              {result.minimumStaff} calculés. L’écart est conservé comme
              hypothèse explicite.
            </p>
          )}
          {input.installation > 0 && (
            <p>
              Installation : vérifier que les {money(input.installation)} ne
              comptent pas une seconde fois les heures déjà incluses dans le
              personnel.
            </p>
          )}
          {result.capacity === 0 && input.students > 0 && (
            <p>Aucune capacité disponible. Ajoutez une zone ou un terrain.</p>
          )}
          {input.targetMargin >= 100 && (
            <p>
              Une marge cible de 100 % ou plus ne permet pas de calculer un
              prix. Ajustez la cible ou saisissez un prix libre.
            </p>
          )}
          {result.requiredMinutes !== null && (
            <p>
              Horaire estimé : {result.requiredMinutes} min pour {result.waves}{" "}
              vagues, contre {result.availableMinutes} min disponibles.{" "}
              {result.requiredMinutes > result.availableMinutes
                ? "Temps insuffisant dans cette hypothèse."
                : "À confirmer sur le terrain, incluant pauses et rotations."}
            </p>
          )}
        </div>
        <details className="sim-panel sim-advanced">
          <summary>
            Ressources et coûts avancés <span>AJUSTER +</span>
          </summary>
          <p className="sim-muted">
            Hypothèses de l’année {year + 1}. Tous les montants sont des
            estimations. Les heures de cliniques sont des heures-intervenants
            cumulées.
          </p>
          <div className="sim-fields">
            {field("hourlyCost", "Coût horaire par intervenant", "$ CA/h")}
            {field("coordinators", "Coordonnateurs requis")}
            {field("clinicHours", "Cliniques · heures-intervenants", "h")}
            {field("trainingHours", "Formation · heures-intervenants", "h")}
            {field("conferenceCost", "Conférence · coût interne", "$ CA")}
            {field("transport", "Transport et équipement", "$ CA")}
            {field("installation", "Installation et production", "$ CA")}
            {field("dj", "DJ et sonorisation", "$ CA")}
            {field("balls", "Ballons laissés à l’école", "$ CA")}
            {field("administration", "Administration et application", "$ CA")}
            {field("days", "Jours d’événement")}
            {field("operatingHours", "Heures d’exploitation par jour", "h")}
            {field("waveMinutes", "Durée d’une vague", "min")}
            {field("transitionMinutes", "Transition entre vagues", "min")}
          </div>
          <label className="sim-check">
            <input
              type="checkbox"
              checked={input.conference}
              onChange={(event) => update({ conference: event.target.checked })}
            />{" "}
            Inclure la conférence
          </label>
          <p className="sim-muted">
            Valeur catalogue indicative de la conférence : 2 000 $ CA. Elle est
            distincte du coût interne.
          </p>
          <h3>DÉTAIL DU COÛT</h3>
          <dl className="sim-breakdown">
            {result.lineItems.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{money(item.value)}</dd>
              </div>
            ))}
          </dl>
        </details>
        <footer className="sim-save">
          <span role="status">{message}</span>
          <button onClick={() => resetDialog.current?.showModal()}>
            <RotateCcw size={15} /> Réinitialiser l’exemple
          </button>
        </footer>
        <dialog
          ref={resetDialog}
          className="sim-confirm"
          aria-labelledby="sim-reset-title"
        >
          <h2 id="sim-reset-title">Réinitialiser les trois années ?</h2>
          <p>
            Le brouillon du simulateur sera remplacé par l’exemple de référence.
          </p>
          <button autoFocus onClick={() => resetDialog.current?.close()}>
            Conserver mon brouillon
          </button>
          <button
            onClick={() => {
              save(defaultSchoolDraft(), true);
              resetDialog.current?.close();
            }}
          >
            Confirmer la réinitialisation
          </button>
        </dialog>
      </div>
    </Shell>
  );
}
