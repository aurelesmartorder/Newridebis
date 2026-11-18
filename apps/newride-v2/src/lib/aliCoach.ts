import { exercises, type Exercise } from "../content/exercises.ts";
import type { AppData, Session } from "./model.ts";

export type AliProgressStage = "start" | "repeat" | "reported_progress" | "safety_pause";
export interface AliPlan {
  horseName: string | null;
  stage: AliProgressStage;
  priority: string;
  exercise: Exercise | null;
  nextStep: string;
  criteria: string[];
  evidence: { sessionId: string; date: string; outcome: Session["outcome"] }[];
  evidenceLabel: string;
  safetyNotice: string;
}

/** Deterministic v1 coaching policy. Rider reports inform adaptation; they never certify mastery. */
export function buildAliPlan(data: AppData, horseId = data.selectedHorseId): AliPlan {
  const horse = data.horses.find((item) => item.id === horseId) ?? null;
  const history = data.sessions
    .filter((session) => session.status === "finished" && (!horse || session.horseId === horse.id))
    .sort((a, b) => (b.finishedAt ?? b.startedAt) - (a.finishedAt ?? a.startedAt));
  const last = history[0];
  const sameExerciseReports = last
    ? [...new Map(history.filter((session) => session.exerciseId === last.exerciseId && session.outcome === "comfortable").map((session) => [session.id, session])).values()]
    : [];
  const evidence = sameExerciseReports.map((session) => ({
    sessionId: session.id,
    date: new Date(session.finishedAt ?? session.startedAt).toISOString().slice(0, 10),
    outcome: session.outcome,
  }));

  if (last?.outcome === "stop") {
    return {
      horseName: horse?.name ?? null,
      stage: "safety_pause",
      priority: "Comprendre la difficulté et préserver le confort du duo",
      exercise: exercises.find((item) => item.id === last.exerciseId) ?? null,
      nextStep: "Ne pas augmenter la difficulté ni reprendre automatiquement. Faites le point avec un enseignant ; si une douleur ou une irrégularité est suspectée, demandez l’avis d’un vétérinaire.",
      criteria: [], evidence: [],
      evidenceLabel: "Dernier bilan déclaré : séance interrompue / difficulté.",
      safetyNotice: "La sécurité prime sur la progression. ALI ne pose pas de diagnostic.",
    };
  }

  if (last?.outcome === "repeat") {
    const exercise = exercises.find((item) => item.id === last.exerciseId) ?? null;
    return {
      horseName: horse?.name ?? null,
      stage: "repeat",
      priority: "Rendre la tâche plus simple et retrouver une réponse confortable",
      exercise,
      nextStep: exercise?.easier ?? "Reprenez une étape plus simple déjà travaillée avec votre enseignant.",
      criteria: exercise?.criteria ?? [], evidence: [],
      evidenceLabel: "Dernier bilan déclaré : exercice à reprendre tranquillement.",
      safetyNotice: "Si la difficulté persiste ou semble liée à une gêne, interrompez et demandez conseil.",
    };
  }

  if (last?.outcome === "comfortable") {
    const exercise = exercises.find((item) => item.id === last.exerciseId) ?? null;
    const repeated = evidence.length >= 2;
    return {
      horseName: horse?.name ?? null,
      stage: "reported_progress",
      priority: repeated ? "Consolider sans confondre ressenti et maîtrise" : "Répéter dans un autre contexte avant d’augmenter la difficulté",
      exercise,
      nextStep: repeated
        ? (exercise?.harder ?? "Variez un seul paramètre, avec l’accord de votre enseignant.")
        : "Reprenez le même exercice une autre séance et notez un critère concret. N’augmentez qu’un seul paramètre, si le duo reste à l’aise.",
      criteria: exercise?.criteria ?? [], evidence,
      evidenceLabel: repeated
        ? `${evidence.length} retours positifs déclarés sur des séances distinctes. Cela indique une progression rapportée, pas une compétence certifiée.`
        : "Un retour positif déclaré : utile pour adapter la suite, insuffisant pour conclure à une progression stabilisée.",
      safetyNotice: "Aucune mesure de casque ni validation professionnelle n’est associée à ces retours.",
    };
  }

  const first = exercises.find((item) => item.level === "Découverte") ?? exercises[0] ?? null;
  return {
    horseName: horse?.name ?? null,
    stage: "start",
    priority: "Établir un point de départ simple et observable",
    exercise: first,
    nextStep: first?.goal ?? "Choisissez un exercice adapté au niveau actuel du couple.",
    criteria: first?.criteria ?? [], evidence: [],
    evidenceLabel: history.length ? "Aucun retour exploitable sur le dernier exercice." : "Pas encore de bilan de séance : ALI ne présume pas de votre niveau.",
    safetyNotice: "Parcours pédagogique indicatif ; les prérequis de l’exercice et l’encadrement restent déterminants.",
  };
}
