import type { DailyAction } from "@/lib/daily-plan";
import type { Mission, State } from "@/types";

export const BRIEFING_20261118_UPDATE = "briefing-2026-11-18-school-scaleup-v1";
const day = "2026-11-18";
const actions: Omit<DailyAction, "order">[] = [
  {
    id: "briefing-20261118-games-inventory",
    date: day, worldId: "vanier", status: "todo", history: [],
    title: "Dresser l'inventaire et le budget des 15 ateliers",
    detail: "À partir des jeux réellement retenus avec Damien, distinguer matériel existant, matériel simple, prototypes techniques et structures portables. Prévoir quantité pour 1 000 élèves/4 h, duplication des postes, sécurité, transport, douanes/taxes, pièces de rechange et coûts d'exploitation. Aucun prix ni jeu inventé : obtenir des soumissions avant de fixer le budget.",
  },
  {
    id: "briefing-20261118-suppliers",
    date: day, worldId: "vanier", status: "todo", history: [],
    title: "Préparer les demandes de prix et les essais fournisseurs",
    detail: "Rédiger les fiches techniques des produits prioritaires; comparer au moins 2 ou 3 fabricants par famille, demander MOQ, prix prototype et série, délais, transport livré Québec, garanties, normes, documentation et échantillons. Ne placer aucune commande sans approbation. Objectif première commande autour du 2 janvier 2027 (maximum 17 janvier).",
  },
  {
    id: "briefing-20261118-financing",
    date: day, worldId: "financement", status: "todo", history: [],
    title: "Monter un dossier de financement sans dilution",
    detail: "Chiffrer séparément CAPEX portable des 15 ateliers et fonds de roulement pour 20 écoles; préparer scénarios de trésorerie bas/médian/haut en distinguant lettre d'intention et contrat payé. Examiner BDC équipement, FLI/FLS local, Investissement Québec, subventions adaptées et prêts privés encadrés. Parler aux mentors; ne pas promettre d'admissibilité ni solliciter d'argent automatiquement.",
  },
];

const scaleupMission: Mission = {
  id: "games-school-2026-scaleup-kit",
  worldId: "vanier",
  title: "KIT PILOTE MOBILE — 15 ATELIERS / 1 000 ÉLÈVES",
  objective: "Concevoir, chiffrer et financer un seul kit pilote mobile détenu par PürInstinct, destiné à être réutilisé dans 20 écoles; commande initiale visée dans 45 jours (maximum 60).",
  description: "Le programme comporte conférence, cliniques et formations sur plusieurs mois, conclues par une grande journée. Chaque élève fait les 15 ateliers. Dimensionnement cible : jusqu'à 1 000 élèves sur 4 heures; 15 000 passages au total, à organiser en flux parallèles. La première année : aucun équipement vendu aux écoles, prototypes transportés et opérés par PürInstinct. Le test du 17 novembre à L'Horizon a confirmé l'engagement des jeunes avec 14 élèves en 75 minutes même en mode analogique; RFID/site bloqués par le réseau scolaire, écran non utilisé, tuiles à améliorer. Ne pas confondre validation sportive et validation de la technologie ou de l'échelle.",
  notes: "Budget inconnu jusqu'aux spécifications et soumissions; ne pas réactiver INSTINCT TV ni CLINIQUES. Damien garde le volet pédagogique. Priorité scolaire exclusive. Le suivi des 20 lettres d'intention demeure une mission distincte; Vanier annoncée reçue, L'Horizon probable. Revue des retours scolaires dimanche 22 novembre et objectif 20 lettres signées entre le 2 et le 9 décembre. Quatrième courriel aux 36 premiers contacts après bilan et disponibilité de la vidéo, pas d'envoi automatique.",
  status: "active", planningState: "in_progress", xpReward: 850,
  order: 100, dependencies: [], tasks: [
    "Valider avec Damien la sélection officielle des 15 jeux : 3 par zone",
    "Inventorier le matériel disponible et les manques pour chaque atelier",
    "Déterminer les quantités, rotations et postes parallèles pour 1 000 élèves en 4 heures",
    "Rédiger les spécifications des arènes, tuiles, chronomètres, accessoires et transport",
    "Obtenir des prix d'échantillons et des soumissions comparables de fournisseurs",
    "Tester le matériel et la procédure de secours analogique/hors ligne",
    "Calculer le CAPEX total, les dépenses d'exploitation et le besoin de trésorerie",
    "Comparer emprunt d'équipement, FLI/FLS, financements publics et prêt privé",
    "Valider les engagements des écoles avant toute commande importante",
    "Décider de la première commande au plus tard le 17 janvier 2027",
  ].map((title,i)=>({id:`games-school-2026-scaleup-kit-${i+1}`,title,completed:false,status:"active" as const,xp:50})),
};

export function applyBriefing20261118Update(state: State): State {
  if (state.contentUpdates?.includes(BRIEFING_20261118_UPDATE)) return state;
  if (!state.worlds.some(w => w.id === "vanier") || !state.worlds.some(w => w.id === "financement")) return state;
  const dailyActions = [...(state.dailyActions ?? [])];
  for (const a of actions) {
    if (dailyActions.some(existing=>existing.id===a.id)) continue;
    const sameDay=dailyActions.filter(x=>x.date===day);
    if (sameDay.length>=5) break;
    dailyActions.push({...a,order:Math.max(0,...sameDay.map(x=>x.order))+1});
  }
  const missions=state.missions.some(m=>m.id===scaleupMission.id) ? state.missions : [...state.missions,scaleupMission];
  return {...state,dailyActions,missions,contentUpdates:[...(state.contentUpdates??[]),BRIEFING_20261118_UPDATE]};
}
