import type { DailyAction } from "@/lib/daily-plan";
import type { State } from "@/types";

export const BRIEFING_20261123_UPDATE = "briefing-2026-11-23-games-v1";
const day = "2026-11-23";
const actions: Omit<DailyAction, "order">[] = [
  {
    id: "briefing-20261123-games",
    date: day, worldId: "vanier", status: "todo", history: [],
    title: "Organiser les 7 jeux connus dans la bibliothèque",
    detail: "Confirmer la structure de 15 ateliers (3 par zone), les 5 jeux de base documentés et les 2 nouveaux jeux mains/pieds. Transmettre les captures lorsque disponible, sans inventer les 8 jeux manquants. La création de l'onglet Les Jeux sur purinstinctgames.com se fait dans la discussion séparée.",
  },
  {
    id: "briefing-20261123-kit",
    date: day, worldId: "vanier", status: "todo", history: [],
    title: "Établir la première liste complète du matériel",
    detail: "À partir du dossier de préapprovisionnement existant, classer équipements par atelier, arènes, tuiles, chronométrage, RFID/NFC, secours analogique et transport. Marquer les quantités inconnues, sans inventer de prix ni autoriser de commande.",
  },
  {
    id: "briefing-20261123-budget",
    date: day, worldId: "financement", status: "todo", history: [],
    title: "Structurer le budget réel du lancement scolaire",
    detail: "Séparer achats et prototypes, fonctionnement des 20 écoles, fonds de roulement et mandats partiels. Inclure la cible de rémunération CEO de 5 000 $/mois seulement après financement; les autres coûts restent à chiffrer. Ne pas considérer 100 000 $ comme un besoin confirmé.",
  },
  {
    id: "briefing-20261123-video",
    date: day, worldId: "vanier", status: "waiting", history: [],
    title: "Attendre la vidéo de Youri avant les courriels",
    detail: "Les enseignants ont déjà reçu les lettres d'intention. Aucune nouvelle relance scolaire aujourd'hui. Lorsque la vidéo sera réellement livrée, préparer les prochains courriels aux enseignants et aux élus. Ne rien marquer comme envoyé.",
  },
];

export function applyBriefing20261123Update(state: State): State {
  if (state.contentUpdates?.includes(BRIEFING_20261123_UPDATE)) return state;
  const dailyActions = [...(state.dailyActions ?? [])];
  for (const a of actions) {
    if (dailyActions.some((existing) => existing.id === a.id || (existing.date === day && existing.title.trim().toLocaleLowerCase("fr") === a.title.trim().toLocaleLowerCase("fr")))) continue;
    if (dailyActions.filter((existing) => existing.date === day).length >= 5) break;
    if (a.worldId && !state.worlds.some((world) => world.id === a.worldId)) continue;
    dailyActions.push({ ...a, order: Math.max(0, ...dailyActions.filter((item) => item.date === day).map((item) => item.order)) + 1 });
  }
  return { ...state, dailyActions, contentUpdates: [...(state.contentUpdates ?? []), BRIEFING_20261123_UPDATE] };
}
