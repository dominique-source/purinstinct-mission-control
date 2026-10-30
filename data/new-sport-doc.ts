import type { MediaBrief, Mission, State, World } from "@/types";
import { transition } from "@/lib/lifecycle";
export const NEW_SPORT_UPDATE = "new-sport-doc-2026-10-30-v1";
export const CASTING_MASTER =
  "https://docs.google.com/spreadsheets/d/1ebwkhcJOu6rQK5BPThQfISpW4rbbp16WHLJD6bpjY1E/edit";
const normalized = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
const milestones = [
  {
    title: "CASTING INITIAL",
    owner: "Dominique Soucy",
    stage: "in_progress",
    objective:
      "Revoir avec Éric la première liste large de 86 profils pour réduire, prioriser et décider qui contacter ou intégrer dans le deck.",
    tasks: [
      "Revoir la liste avec Éric Boucher",
      "Réduire et prioriser les profils",
      "Assurer une représentation féminine réelle : la liste ne doit pas être composée uniquement d’hommes",
      "Identifier les personnes essentielles au storytelling et à la crédibilité",
      "Décider qui contacter et qui intégrer dans le deck",
    ],
  },
  {
    title: "CONCEPT DE LA SÉRIE DOCUMENTAIRE",
    owner: "Éric Boucher",
    stage: "in_progress",
    objective:
      "Éric écrit le concept, la structure narrative, le storytelling et le document de présentation de la série.",
    tasks: [
      "Écrire le concept de la série",
      "Développer la structure et le storytelling",
      "Préparer le document de présentation",
    ],
  },
  {
    title: "CONCEPT DU GAME SHOW / NOUVEAU SPORT",
    owner: "Éric Boucher",
    stage: "in_progress",
    objective:
      "Éric développe le concept du game show, le format de tournoi et le document de présentation. Dominique participe à la création du nouveau sport et du système de jeu.",
    tasks: [
      "Développer le concept du game show",
      "Définir le format de tournoi",
      "Créer le sport et le système de jeu avec Dominique",
      "Préparer le document de présentation",
    ],
  },
  {
    title: "PRÉSENTATION INTERNE",
    owner: "Éric Boucher × Dominique Soucy",
    stage: "upcoming",
    objective:
      "Présenter à Évelyne et Dominique les deux documents : série documentaire et game show / nouveau sport.",
    tasks: [
      "Présenter le document de la série documentaire",
      "Présenter le document du game show / nouveau sport",
      "Recueillir les commentaires d’Évelyne et Dominique",
    ],
  },
  {
    title: "CORRECTIONS",
    owner: "Éric Boucher × Dominique Soucy",
    stage: "upcoming",
    objective:
      "Intégrer les commentaires après la présentation, effectuer les corrections et ajustements, puis obtenir la validation finale.",
    tasks: [
      "Consolider les commentaires",
      "Corriger et ajuster les deux documents",
      "Valider les versions finales",
    ],
  },
  {
    title: "OUTREACH / PITCH",
    owner: "Éric Boucher",
    stage: "upcoming",
    objective:
      "Éric commence officiellement la représentation et le développement pour vendre les deux shows auprès des producteurs, diffuseurs, plateformes et partenaires potentiels.",
    tasks: [
      "Identifier producteurs, diffuseurs, plateformes et partenaires",
      "Préparer les approches",
      "Présenter les deux projets et suivre les retours",
    ],
  },
  {
    title: "SIGNATURES",
    owner: "Éric Boucher × Dominique Soucy",
    stage: "upcoming",
    objective:
      "Signer les ententes nécessaires lorsque des partenaires de production ou de diffusion sont trouvés.",
    tasks: [
      "Confirmer les partenaires de production ou diffusion",
      "Valider les ententes nécessaires",
      "Signer les ententes",
    ],
  },
  {
    title: "HOLLYWOOD",
    owner: "Éric Boucher × Dominique Soucy",
    stage: "someday",
    objective: "Un jour 😄 — clin d’œil à la formulation originale d’Éric.",
    tasks: [],
  },
] as const;
export function makeMediaBrief(): MediaBrief {
  return {
    version: 1,
    milestoneIds: [],
    masterUrl: CASTING_MASTER,
    shortlist: "",
    activity: [],
    objectives: [
      "Une série documentaire autour de Dominique Soucy, de PürInstinct et du processus de création d’un nouveau sport.",
      "Un nouveau sport distinct de PürInstinct.",
      "Un format de tournoi / game show télévisé basé sur ce nouveau sport.",
      "Un casting initial d’athlètes, experts, personnalités et personnes crédibles pour contribuer au développement ou apparaître dans le projet.",
      "Les documents de présentation nécessaires pour présenter et vendre les deux projets.",
    ],
    tiers: [
      {
        name: "S TIER",
        label: "GAME CHANGERS",
        count: 13,
        description:
          "Personnes extrêmement connues, médiatisées ou au plus haut niveau mondial. Elles peuvent changer la portée du projet, sa crédibilité, son attractivité pour un diffuseur et son potentiel médiatique.",
      },
      {
        name: "A TIER",
        label: "PROFILS TRÈS FORTS",
        count: 7,
        description:
          "Profils très crédibles : sport professionnel, calibre international, notoriété importante, accès plausible et potentiel casting élevé.",
      },
      {
        name: "B TIER",
        label: "ATHLÈTES EXCEPTIONNELS",
        count: 26,
        description:
          "Athlètes ou anciens athlètes de très haut niveau : olympiens, professionnels, internationaux ou qualités physiques exceptionnelles. Profils pour tester ou contribuer à créer le sport, parfois déjà proches de Dominique ou de PürInstinct.",
      },
      {
        name: "C TIER",
        label: "EXECUTIVES / CRÉDIBILITÉ / RÉSEAU",
        count: 25,
        description:
          "Pas nécessairement des athlètes principaux. Leur crédibilité, expertise, réseau, expérience, lecture du projet, présence caméra ou connaissance de Dominique et de PürInstinct enrichissent le documentaire.",
      },
      {
        name: "D TIER",
        label: "EXCELLENTS FIGURANTS / ATHLÈTES TERRAIN",
        count: 15,
        description:
          "Très bons athlètes, anciens pros, semi-pros ou personnes ayant joué à PürInstinct. Qualités athlétiques, disponibilité pour les tests et profils visuels ou humains utiles à la création du sport et à la série.",
      },
    ],
    roles: [
      {
        name: "Dominique Soucy",
        details:
          "Protagoniste principal de la série documentaire; co-créateur et co-propriétaire envisagé à 50 % du nouveau sport / format. Responsable du premier bassin de casting, ouvre son réseau sportif et professionnel et participe aux décisions créatives et commerciales.",
      },
      {
        name: "Éric Boucher",
        details:
          "Créateur / auteur du concept de série et scénariste. Développe la structure narrative et le concept du game show, prépare les documents de présentation, mène éventuellement le démarchage auprès des producteurs et diffuseurs. Producteur délégué au contenu selon les principes d’entente.",
      },
    ],
    principles: [
      "La série documentaire est développée par Éric Boucher.",
      "Dominique est le protagoniste principal.",
      "Le nouveau sport est une création distincte de PürInstinct.",
      "La propriété du nouveau sport / format est envisagée à 50 % Dominique Soucy et 50 % Éric Boucher.",
      "PürInstinct demeure la propriété exclusive de Dominique / PURINSTINCT Worldwide inc. Sa propriété intellectuelle ne se mélange pas automatiquement à celle du nouveau sport.",
      "Le sport doit idéalement rester la propriété des créateurs et être exploité par licences plutôt que vendu.",
      "Les athlètes participants peuvent éventuellement être reconnus comme cocréateurs ou recevoir une participation économique dans le format, sans contrôle ni propriété automatique du sport.",
      "Éric prépare les decks et mène ensuite le pitch auprès des producteurs et diffuseurs.",
      "Éric est payé à partir du budget d’un producteur lorsqu’une entente de production est signée, pas directement par Dominique maintenant.",
      "Une diligence devra être faite concernant tout droit antérieur pouvant toucher PürInstinct ou d’anciens producteurs.",
    ],
    resources: [
      { title: "CONCEPT SÉRIE", status: "Éric en rédaction", url: "" },
      { title: "CONCEPT GAME SHOW", status: "Éric en rédaction", url: "" },
    ],
  };
}
/** One-time additive content update: match an existing dynamic mission before creating one. */
export function applyNewSportDoc(state: State): State {
  if (state.contentUpdates?.includes(NEW_SPORT_UPDATE)) return state;
  const existing =
    state.worlds.find((w) => normalized(w.title) === "newsportdoc") ||
    state.worlds.find((w) => normalized(w.title) === "newsport");
  let id = existing?.id || "new-sport-doc";
  while (!existing && state.worlds.some((w) => w.id === id)) id += "-new";
  const brief = existing?.mediaBrief || makeMediaBrief();
  const missions = [...state.missions];
  const ids = milestones.map((item, i) => {
    const match = missions.find(
      (m) => m.worldId === id && normalized(m.title) === normalized(item.title),
    );
    if (match) {
      const index = missions.indexOf(match);
      missions[index] = {
        ...match,
        owner: match.owner || item.owner,
        planningState: match.planningState || item.stage,
      };
      return match.id;
    }
    let mid = `${id}-milestone-${i + 1}`;
    while (missions.some((m) => m.id === mid)) mid += "-new";
    const m: Mission = {
      id: mid,
      worldId: id,
      title: item.title,
      objective: item.objective,
      description: item.objective,
      owner: item.owner,
      planningState: item.stage,
      status: "active",
      xpReward: 0,
      notes: "",
      dependencies: [],
      order:
        Math.max(
          0,
          ...missions.filter((m) => m.worldId === id).map((m) => m.order),
        ) + 1,
      tasks: item.tasks.map((title, n) => ({
        id: `${mid}-task-${n + 1}`,
        title,
        completed: false,
        xp: 0,
        status: "active",
      })),
    };
    missions.push(m);
    return mid;
  });
  const base: World = existing || {
    id,
    number: String(state.worlds.length + 1).padStart(2, "0"),
    title: "NEW SPORT DOC",
    subtitle: "",
    description: "",
    accent: "#CCFF00",
    order: Math.max(0, ...state.worlds.map((w) => w.order)) + 1,
    unlockConditions: [],
  };
  const world: World = {
    ...transition(base, "active"),
    status: "active",
    availability: undefined,
    title: "NEW SPORT DOC",
    objective:
      "Créer un nouveau sport. Documenter sa naissance. Construire son format télé.",
    subtitle: "Avec Éric Boucher",
    partners: "Éric Boucher",
    projectType: "Média",
    accent: "#CCFF00",
    mediaBrief: { ...brief, milestoneIds: ids },
  };
  return {
    ...state,
    worlds: existing
      ? state.worlds.map((w) => (w.id === id ? world : w))
      : [...state.worlds, world],
    missions,
    contentUpdates: [...(state.contentUpdates || []), NEW_SPORT_UPDATE],
  };
}
