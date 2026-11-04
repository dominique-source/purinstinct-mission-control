import type { Mission, State, World } from "@/types";

export const GAMES_CREATION_UPDATE = "games-creation-2026-11-04-v1";

type Entry = { title: string; detail: string };
const gameEntries: Entry[] = [
  { title: "Décrire le jeu de base avec les pods lumineux", detail: "Deux équipes de couleurs distinctes; toucher son pod avant l'adversaire. Les couleurs changent après un contact, et le prochain pod peut être au même endroit ou ailleurs. Duel de 20 secondes, nombre de touches gagnantes." },
  { title: "Documenter la variante passes à la main", detail: "Pods plus espacés. Après avoir touché son pod, effectuer une passe au partenaire, récupérer le ballon sans le laisser toucher le sol, puis atteindre le prochain pod avec le ballon. Si la passe est échappée, la refaire." },
  { title: "Documenter la variante passe frappée du poing", detail: "Faire progresser le ballon par une frappe du poing vers le partenaire en déplacement. Le joueur avec le ballon atteint le pod. Le ballon ne touche pas le sol." },
  { title: "Documenter la variante au pied", detail: "Faire progresser le ballon par une passe au pied, reprendre possession et courir toucher le pod sans que le ballon touche le sol." },
  { title: "Tester les variantes à deux couleurs par équipe", detail: "Exemple : rouge et bleu contre jaune et vert; changement de repères et de décision en mouvement." },
  { title: "Classer les jeux dans les cinq zones", detail: "Vitesse, Agilité, Habiletés manuelles, Habiletés au pied et Game IQ; permettre plusieurs zones pour un même jeu." },
  { title: "Tester les jeux sur le terrain avec Damien", detail: "Évaluer les règles, la sécurité, les intensités, les progressions de difficulté et les besoins matériels avant validation." },
];
const productEntries: Entry[] = [
  { title: "Retrouver les anciens plans et notes des produits", detail: "Rassembler les documents déjà préparés; ne pas refaire le travail existant." },
  { title: "Concevoir les tuiles interactives PürInstinct", detail: "Grandes tuiles lumineuses au sol sur lesquelles on appuie, avec changement de couleurs et jeux programmables depuis une application PürInstinct. Inspiration fonctionnelle Activate, règles originales." },
  { title: "Définir l'application de contrôle des tuiles", detail: "Scénarios de réaction, vitesse, couleurs, équipes, mémoire et comptage des points. Spécifier les besoins avant développement." },
  { title: "Concevoir l'horloge double de compétition", detail: "Deux chronomètres et un gros bouton : le temps de l'équipe engagée s'écoule jusqu'à ce qu'elle réussisse le défi et appuie; son temps s'arrête et celui de l'autre équipe reprend, comme une horloge d'échecs." },
  { title: "Concevoir Ultimatum Tag Arena", detail: "Arène gonflable de 18 m de diamètre, style arène UFC, deux portes; conçue pour Ultimatum Tag, jeu d'agilité." },
  { title: "Concevoir Ultimatum Balls Arena", detail: "Arène gonflable distincte de 18 m de diamètre, style arène UFC, deux portes; conçue pour Ultimatum Balls, jeu d'habiletés manuelles." },
  { title: "Étudier les prototypes, fournisseurs et coûts", detail: "Chiffrer tuiles, application, horloge et chacune des deux arènes séparément; préparer les étapes de prototypage et essais." },
];
function addProject(state: State, id: string, title: string, subtitle: string, accent: string, objective: string, entries: Entry[], partner?: string) {
  if (state.worlds.some(w => w.id === id || w.title.trim().toLocaleLowerCase("fr") === title.toLocaleLowerCase("fr"))) return state;
  const order = Math.max(0, ...state.worlds.map(w => w.order)) + 1;
  const world: World = { id, number: String(order).padStart(2, "0"), order, title, subtitle, accent, status: "active", availability: "available", projectType: "Développement", partners: partner, startDate: "2026-11-04", objective, description: objective, unlockConditions: [] };
  const missions: Mission[] = entries.map((entry, i) => ({
    id: `${id}-${i + 1}`, worldId: id, title: entry.title, objective: entry.detail,
    description: entry.detail, notes: "", order: i + 1, status: "active",
    planningState: "upcoming", xpReward: 0, dependencies: [],
    tasks: [{ id: `${id}-${i + 1}-task`, title: entry.title, completed: false, status: "active", xp: 0 }],
  }));
  return { ...state, worlds: [...state.worlds, world], missions: [...state.missions, ...missions] };
}
export function applyGamesCreationUpdate(state: State): State {
  if (state.contentUpdates?.includes(GAMES_CREATION_UPDATE)) return state;
  let next = addProject(state, "creation-jeux-games", "CRÉATION DE JEUX", "PürInstinct Games · bibliothèque de jeux", "#68c8ff", "Développer et tester les jeux évolutifs des PürInstinct Games, dont les quatre variantes à pods lumineux créées avec Damien le 4 novembre 2026.", gameEntries, "Damien Thuillier");
  next = addProject(next, "creation-produits-games", "CRÉATION DE PRODUITS", "PürInstinct Games · équipement exclusif", "#ca9aff", "Développer quatre produits : tuiles interactives et application, horloge double, Ultimatum Tag Arena et Ultimatum Balls Arena. Concepts à étudier, pas de prototype confirmé.", productEntries);
  return { ...next, contentUpdates: [...(next.contentUpdates ?? []), GAMES_CREATION_UPDATE] };
}
