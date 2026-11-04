# Transfert du briefing vers Mission Control

Dire « Pars mon briefing » dans ChatGPT. Dans une nouvelle conversation, donner aussi le protocole ci-dessous pour retrouver les mêmes règles.

> Fais un briefing d’environ 20 minutes, centré sur PürInstinct. Consulte les sources auxquelles tu as réellement accès pour couvrir les 48 dernières heures. Je peux te fournir un export de Mission Control si tu n’y as pas accès. Demande-moi le résultat des rencontres et attends ma confirmation avant de les considérer comme tenues. Pose une seule question à la fois. En vocal, attends « fin » ou « j’ai fini ». Arrête immédiatement à « Stop ». Demande ma permission avant tout conseil stratégique ou réflexion outside the box. Fais valider au maximum quatre actions pour les prochaines 24 heures, puis génère le JSON ci-dessous avec la date locale de Toronto et des identifiants stables.

Copier le JSON validé. Dans **Plan de match — Aujourd’hui**, ouvrir **Importer un plan depuis ChatGPT**, coller le JSON, cliquer sur **Prévisualiser**, puis **Confirmer l’import**.

```json
{
  "date": "2026-11-05",
  "actions": [
    {
      "id": "20261105-suivi-horizon",
      "title": "Confirmer le résultat du suivi avec Damien",
      "detail": "Noter le résultat confirmé et la prochaine étape.",
      "worldId": "vanier"
    }
  ]
}
```

Le détail et le lien de mission sont facultatifs. Réutiliser les mêmes identifiants si le plan est importé de nouveau. Le plan ajoute uniquement les nouvelles actions. Les identifiants déjà présents et les titres identiques le même jour sont ignorés. Une tâche au titre identique à une tâche de mission doit être suivie dans sa mission. Les actions ajoutées restent à faire jusqu’à confirmation dans l’interface. Les cases du plan quotidien sont indépendantes des XP. Le sélecteur de date permet de consulter les journées précédentes. Un report déplace l’action avec son statut et garde une trace dans la journée de départ.

Le transfert est manuel. Mission Control lit le JSON collé et garde les données dans la sauvegarde du navigateur. Utiliser l’export et l’import de sauvegarde de Mission Control pour changer de navigateur ou de domaine.

La mise à jour de novembre transfère les sous-missions de l’ancien Financement sous Vanier et conserve le World historique dans la sauvegarde. Funding 750K est disponible et ses actions entrent dans les suggestions après activation. L’application garde une copie du JSON d’origine sous une clé locale suffixée `-before-briefing-2026-11-04-v1` ou `-before-new-sport-doc-2026-10-30-v1` lorsque les deux migrations s’appliquent ensemble.
