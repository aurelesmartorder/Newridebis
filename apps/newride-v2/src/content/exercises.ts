export type Discipline = "Fondamentaux" | "Dressage" | "Extérieur";
export interface ExerciseStep {
  title: string;
  instruction: string;
  seconds: number;
}
export interface Exercise {
  id: string;
  title: string;
  subtitle: string;
  discipline: Discipline;
  duration: number;
  level: string;
  goal: string;
  prerequisite: string;
  stop: string;
  observation: string;
  sources: string[];
  steps: ExerciseStep[];
  diagram: "circle" | "transition" | "line";
}

export const exercises: Exercise[] = [
  {
    id: "rythme-au-pas",
    title: "Trouver votre rythme",
    subtitle: "Régularité au pas",
    discipline: "Fondamentaux",
    duration: 12,
    level: "Accessible",
    diagram: "circle",
    goal: "Observer la régularité du pas et garder une intention simple sur une grande courbe.",
    prerequisite:
      "Cheval habituellement monté, environnement clos adapté et allure du pas maîtrisée. Pour un débutant, présence d’un enseignant.",
    stop: "Arrêtez le travail si le cheval présente une gêne, une irrégularité inhabituelle ou si vous vous sentez en difficulté.",
    observation:
      "Avez-vous pu garder un pas régulier sur une grande courbe, sans multiplier les demandes ?",
    sources: [
      "ISES — principes de signaux cohérents et progression par étapes",
    ],
    steps: [
      {
        title: "Prendre vos repères",
        instruction:
          "Installez-vous au pas sur la piste. Prenez le temps de sentir le mouvement, sans chercher à le modifier.",
        seconds: 180,
      },
      {
        title: "Écouter le rythme",
        instruction:
          "Sur une ligne dégagée, portez votre attention sur le rythme du pas. Gardez une seule intention : sa régularité.",
        seconds: 180,
      },
      {
        title: "Dessiner une grande courbe",
        instruction:
          "Si vous êtes à l’aise, dessinez une grande courbe puis retrouvez la piste. Gardez une trajectoire adaptée à votre cheval.",
        seconds: 180,
      },
      {
        title: "Revenir au calme",
        instruction:
          "Revenez sur une ligne simple au pas. Laissez un temps calme avant de faire le bilan.",
        seconds: 180,
      },
    ],
  },
  {
    id: "transitions-preparees",
    title: "Préparer, puis demander",
    subtitle: "Transitions pas–arrêt",
    discipline: "Dressage",
    duration: 15,
    level: "Bases acquises",
    diagram: "transition",
    goal: "Préparer une transition simple et observer la réponse, sans ajouter plusieurs corrections simultanées.",
    prerequisite:
      "Couple déjà autonome au pas et à l’arrêt dans une carrière sécurisée. Les aides sont celles apprises avec votre enseignant.",
    stop: "Ne répétez pas une demande en augmentant automatiquement son intensité. En cas de gêne ou d’incompréhension persistante, faites une pause et demandez conseil.",
    observation:
      "La préparation vous a-t-elle aidé à obtenir une transition calme avec vos aides habituelles ?",
    sources: [
      "ISES — apprentissage par étapes",
      "Heliyon 2025, DOI 10.1016/j.heliyon.2025.e41947 — étude exploratoire de l’enseignement",
    ],
    steps: [
      {
        title: "Installer le pas",
        instruction:
          "Prenez un pas confortable sur une ligne simple. Choisissez un repère visible pour préparer votre transition.",
        seconds: 240,
      },
      {
        title: "Préparer une transition",
        instruction:
          "Avant votre repère, préparez un arrêt avec les aides que vous connaissez. Après la réponse, revenez à une demande légère.",
        seconds: 180,
      },
      {
        title: "Laisser le temps",
        instruction:
          "Repartez calmement au pas. Espacez les essais ; observez ce qui a changé plutôt que de multiplier les demandes.",
        seconds: 240,
      },
      {
        title: "Retrouver la fluidité",
        instruction:
          "Terminez par un pas calme. Retenez une observation précise pour votre prochain échange avec un enseignant.",
        seconds: 240,
      },
    ],
  },
  {
    id: "lignes-et-courbes",
    title: "Une trajectoire, une intention",
    subtitle: "Direction & grandes lignes",
    discipline: "Fondamentaux",
    duration: 10,
    level: "Accessible",
    diagram: "line",
    goal: "Prévoir sa trajectoire et rester disponible pour le mouvement du cheval.",
    prerequisite:
      "Direction et arrêt maîtrisés au pas. Carrière dégagée, sans obstacle imposé.",
    stop: "Gardez vos distances avec les autres chevaux. Revenez à la piste si la trajectoire choisie n’est plus disponible.",
    observation:
      "Avez-vous pu annoncer mentalement votre trajectoire et la suivre sans vous précipiter ?",
    sources: ["ISES — tâches progressives et sécurité"],
    steps: [
      {
        title: "Lire votre espace",
        instruction:
          "Au pas, repérez deux points éloignés dans votre espace de travail. Vérifiez que le passage reste libre.",
        seconds: 180,
      },
      {
        title: "Relier deux repères",
        instruction:
          "Choisissez une ligne simple entre vos repères. Regardez où vous souhaitez aller et utilisez vos aides habituelles.",
        seconds: 150,
      },
      {
        title: "Arrondir la trajectoire",
        instruction:
          "Reliez maintenant votre ligne à une grande courbe. Adaptez-la à l’espace disponible, sans virage serré.",
        seconds: 150,
      },
      {
        title: "Clore la séance",
        instruction:
          "Revenez calmement au pas sur la piste. Prenez un instant pour retenir ce qui vous a semblé plus facile.",
        seconds: 120,
      },
    ],
  },
];

export const scientificSources = [
  {
    title: "Principes d’apprentissage du cheval",
    publisher: "International Society for Equitation Science",
    url: "https://www.equitationscience.com/ises-training-principles",
    detail:
      "Recommandations professionnelles. Ne valident pas l’efficacité de NewRide.",
  },
  {
    title: "Enseignement et biomécanique",
    publisher: "Heliyon · 2025",
    url: "https://doi.org/10.1016/j.heliyon.2025.e41947",
    detail:
      "Étude exploratoire ; ne démontre pas une acquisition durable ni un effet du coaching vocal automatisé.",
  },
  {
    title: "Feedback instrumenté du cavalier",
    publisher: "Frontiers · 2022",
    url: "https://doi.org/10.3389/fspor.2022.899379",
    detail:
      "Étude pilote de 16 cavaliers avec un montage spécifique ; non transférable au seul casque.",
  },
  {
    title: "Mesures inertielles chez le cheval",
    publisher: "Sensors · 2024",
    url: "https://doi.org/10.3390/s24248170",
    detail:
      "Les emplacements de mesure sont essentiels. Aucune validation des métriques NewRide.",
  },
];
