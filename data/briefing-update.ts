import type { State, World, Mission } from "@/types";
import type { DailyAction } from "@/lib/daily-plan";

export const BRIEFING_UPDATE = "briefing-2026-11-04-v1";
export const FUNDING_ID = "funding-750k";
export const schools = [
  "Geneviève Adam — École de la Croisée, Laval. Environ 2 000 élèves, 18 enseignants d’éducation physique et plusieurs espaces sportifs. Explorer formation, conférences, cliniques et Games d’avril.",
  "Louis-Philippe Rosa — Collège Notre-Dame. Introduction possible à d’autres enseignants. Localisation à confirmer.",
  "Josiane — École Havre-Jeunesse. Échange positif et suivi à organiser.",
];
const firstPlan: DailyAction[] = [
  {
    id: "briefing-20261104-doc",
    title: "Finaliser le document Games scolaires 2027",
    worldId: "vanier",
    detail:
      "Finaliser le document avancé, puis l’envoyer aux trois enseignants. Les envois restent à confirmer.",
  },
  {
    id: "briefing-20261104-costs",
    title: "Avancer la grille de coûts pendant 30 minutes",
    worldId: "vanier",
    detail:
      "Intervenants, frais PürInstinct, matériel, AV, DJ, food truck, engagement local et scénarios selon la taille et les ressources de l’école.",
  },
  {
    id: "briefing-20261104-meetings",
    title: "Confirmer les résultats des rencontres",
    detail:
      "Damien Thuillier, École de l’Horizon, 10 h 45–12 h. Tout est prêt, faire le suivi demain. David Ricca à 13 h. Première rencontre exploratoire, aucune préparation restante. Recueillir le résultat et la prochaine étape après confirmation.",
  },
  {
    id: "briefing-20261104-setup",
    title: "Mettre en place la réorganisation Mission Control",
    detail:
      "Financement Vanier et Funding 750K. Travail confié à Codex. Cocher après livraison et vérification.",
  },
].map((action, index) => ({
  ...action,
  date: "2026-11-04",
  status: "todo",
  order: index + 1,
  history: [],
}));

const fundingTasks = [
  "Préciser l’utilisation des fonds et le budget",
  "Mettre à jour le deck investisseur",
  "Valider la structure et les modalités de levée",
  "Identifier les investisseurs pertinents",
  "Documenter les rencontres et leurs résultats",
  "Faire les suivis à cadence humaine",
  "Confirmer les engagements et le closing",
];

export function applyBriefingUpdate(state: State): State {
  if (state.contentUpdates?.includes(BRIEFING_UPDATE)) return state;
  const legacy = state.worlds.find((w) => w.id === "financement");
  const funding: World = {
    id: FUNDING_ID,
    number: legacy?.number || String(state.worlds.length + 1),
    order:
      legacy?.order ?? Math.max(0, ...state.worlds.map((w) => w.order)) + 1,
    title: "FUNDING 750K",
    subtitle: "750 000 $ US",
    accent: "#89d6bd",
    availability: "available",
    status: "active",
    unlockConditions: [],
    objective: "Lever 750 000 $ US pour PürInstinct Worldwide.",
    description:
      "Équipement des PürInstinct Games, solidité opérationnelle de la première année, développement commercial, marketing et production de vidéos premium pour les écoles du Québec. Possibilités télé et documentaire selon les décisions et budgets. Rencontre exploratoire avec David Ricca le 4 novembre à 13 h. Résultat à confirmer.",
  };
  const existingFunding = state.worlds.some((w) => w.id === FUNDING_ID);
  const maxVanierOrder = Math.max(
    0,
    ...state.missions.filter((m) => m.worldId === "vanier").map((m) => m.order),
  );
  const missions = state.missions.map((m) =>
    m.worldId === "financement"
      ? {
          ...m,
          worldId: "vanier",
          order: maxVanierOrder + m.order,
          vanierFunding: true,
        }
      : m,
  );
  if (!existingFunding) {
    fundingTasks.forEach((title, index) => {
      const id = `${FUNDING_ID}-${index + 1}`;
      const mission: Mission = {
        id,
        worldId: FUNDING_ID,
        title,
        objective: title,
        description: "",
        notes: "",
        status: "active",
        order: index + 1,
        xpReward: 0,
        dependencies: [],
        tasks: [
          {
            id: `${id}-task`,
            title,
            completed: false,
            status: "active",
            xp: 0,
          },
        ],
      };
      missions.push(mission);
    });
  }
  const worlds = state.worlds.filter((w) => w.id !== "financement");
  if (!worlds.some((w) => w.id === "vanier") && legacy)
    worlds.push({
      ...legacy,
      id: "vanier",
      title: "VANIER",
      unlockConditions: [],
    });
  const currentMedia = worlds.find(
    (w) => w.mediaBrief && w.title.toLowerCase().includes("new sport"),
  );
  return {
    ...state,
    worlds: existingFunding ? worlds : [...worlds, funding],
    missions,
    archivedVanierFunding: state.archivedVanierFunding ?? legacy,
    activeWorldId:
      state.activeWorldId === "financement" ? "vanier" : state.activeWorldId,
    dailyActions: state.dailyActions?.some((a) => a.date === "2026-11-04")
      ? state.dailyActions
      : [
          ...(state.dailyActions ?? []),
          ...firstPlan.filter(
            (a) => !state.dailyActions?.some((saved) => saved.id === a.id),
          ),
        ],
    briefingMediaWorldId: currentMedia?.id,
    contentUpdates: [...(state.contentUpdates ?? []), BRIEFING_UPDATE],
  };
}
