import type { State, Mission } from "@/types";
import type { DailyAction } from "@/lib/daily-plan";

export const RFID_READINESS_UPDATE = "rfid-readiness-2026-11-09-v1";
const worldId = "technologie";
const missionId = "rfid-readiness-20261109";
const dailyId = "briefing-20261109-rfid-audit";

const tasks = [
  ["inventory", "Inventorier le matériel réel : environ 100 bracelets, lecteurs RFID/NFC, Android, Mac, câble HDMI et télévision"],
  ["audit", "Auditer l'application existante : inscription, associations RFID, scores, base de données, leaderboard, déploiement et accès"],
  ["compatibility", "Vérifier modèle et protocole des bracelets et lecteurs, identifier UID/écriture et compatibilité"],
  ["registration", "Tester réellement : créer un participant fictif, lire un bracelet et l'associer à son dossier"],
  ["rescan", "Rescanner le bracelet et vérifier que le bon participant est reconnu après actualisation"],
  ["scores", "Saisir un résultat, vérifier sauvegarde, historique et recalcul des classements sans doublon"],
  ["fallback", "Vérifier Android et saisie manuelle de secours, ainsi que la synchronisation des résultats"],
  ["tv", "Connecter l'ordinateur à la télévision avec le câble acheté et tester le leaderboard 16:9 en direct"],
  ["simulation", "Simuler avec 10 participants et 10 bracelets, erreurs et connexion interrompue; documenter les résultats"],
  ["blockers", "Lister ce qui manque, classer les blocages P0/P1/P2 et valider la préparation du test de l'Horizon le 17 novembre"],
] as const;

function applyOriginalRfidReadinessUpdate(state: State): State {
  if (state.contentUpdates?.includes(RFID_READINESS_UPDATE)) return state;
  const missions = [...state.missions];
  if (state.worlds.some((w) => w.id === worldId) && !missions.some((m) => m.id === missionId)) {
    const mission: Mission = {
      id: missionId,
      worldId,
      title: "AUDIT RFID | PREMIER TEST RÉEL",
      objective: "Prouver de bout en bout : bracelet réel → participant → score → classement → télévision, avant le 17 novembre.",
      description: "Audit du système EXISTANT et premier essai physique. Ne pas confondre code présent et fonctionnement validé. Aucun achat supplémentaire sans vérification du matériel. Le câble ordinateur-TV est déjà acheté. Ne pas modifier l'application Games ici : consigner constats, blocages et étapes de test.",
      notes: "À vérifier : type exact des bracelets et lecteur, identification par UID ou écriture nécessaire, connexion Android, base de données, sauvegarde, classement, mode manuel et affichage TV. Livrable : état par fonction (fonctionnel, partiel, non testé, absent), liste du matériel présent/manquant, blocages P0/P1/P2 et protocole d'essai avec 10 bracelets. Test physique à réaliser avec Dominique; aucun résultat présumé.",
      status: "active",
      planningState: "in_progress",
      order: Math.max(0, ...missions.filter((m) => m.worldId === worldId).map((m) => m.order)) + 1,
      xpReward: 0,
      dependencies: [],
      tasks: tasks.map(([id, title]) => ({
        id: `${missionId}-${id}`,
        title,
        completed: false,
        status: "active",
        xp: 0,
      })),
    };
    missions.push(mission);
  }
  const dailyActions = [...(state.dailyActions ?? [])];
  const date = "2026-11-09";
  const today = dailyActions.filter((a) => a.date === date);
  if (today.length < 5 && !dailyActions.some((a) => a.id === dailyId)) {
    const action: DailyAction = {
      id: dailyId,
      date,
      title: "Faire l'audit RFID et préparer le premier test réel",
      detail: "Mission TECHNOLOGIE : inventorier le matériel et vérifier l'application existante, déterminer les blocages pour associer un bracelet à un participant, enregistrer un score et afficher le leaderboard sur TV. Le câble HDMI est acheté. Objectif : plan de test physique, liste des éléments manquants et préparation au 17 novembre. Ne pas déclarer le système prêt sans essai.",
      worldId,
      status: "todo",
      order: Math.max(0, ...today.map((a) => a.order)) + 1,
      history: [],
    };
    dailyActions.push(action);
  }
  return {
    ...state,
    missions,
    dailyActions,
    contentUpdates: [...(state.contentUpdates ?? []), RFID_READINESS_UPDATE],
  };
}

const RFID_TEST_NOV12 = "rfid-test-2026-11-12-v1";
export function applyRfidReadinessUpdate(state: State): State {
  const previous = applyOriginalRfidReadinessUpdate(state);
  if (previous.contentUpdates?.includes(RFID_TEST_NOV12)) return previous;
  if (!previous.worlds.some((w) => w.id === worldId)) return previous;
  const date = "2026-11-12";
  const id = "briefing-20261112-rfid-physical-test";
  const title = "Tester réellement les bracelets RFID";
  const dailyActions = [...(previous.dailyActions ?? [])];
  const existing = dailyActions.find((a) => a.id === id || (a.date === date && a.title.trim().toLocaleLowerCase("fr") === title.toLocaleLowerCase("fr")));
  if (!existing) {
    const sameDay = dailyActions.filter((a) => a.date === date);
    if (sameDay.length >= 5) return previous;
    dailyActions.push({
      id, date, title, worldId, status: "todo", history: [],
      order: Math.max(0, ...sameDay.map((a) => a.order)) + 1,
      detail: "Effectuer aujourd’hui le test physique des bracelets et lecteurs existants : lire et associer un bracelet à un participant, rescanner, saisir un score, vérifier sauvegarde et classement. Vérifier Android, mode manuel et affichage TV si possible. Consigner les résultats et blocages avant le test du 17 novembre à L’Horizon. Ne pas déclarer le test réussi avant validation réelle.",
    });
  }
  return { ...previous, dailyActions, contentUpdates: [...(previous.contentUpdates ?? []), RFID_TEST_NOV12] };
}
