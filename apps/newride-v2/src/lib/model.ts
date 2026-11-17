export interface Horse {
  id: string;
  name: string;
  breed: string;
  birthYear: number | null;
}
export interface Session {
  id: string;
  horseId: string;
  horseName: string;
  exerciseId: string;
  title: string;
  startedAt: number;
  elapsedMs: number;
  runningSince: number | null;
  status: "active" | "paused" | "finished";
  finishedAt?: number;
  notes?: string;
  outcome?: "comfortable" | "repeat" | "stop";
  evidenceSource?: "rider_report";
}
export interface AppData {
  version: 1;
  riderName: string;
  horses: Horse[];
  selectedHorseId: string;
  favorites: string[];
  sessions: Session[];
  voice: boolean;
}
export const initialData: AppData = {
  version: 1,
  riderName: "",
  horses: [],
  selectedHorseId: "",
  favorites: [],
  sessions: [],
  voice: false,
};
export type Action =
  | { type: "horse/add"; horse: Horse }
  | { type: "horse/select"; id: string }
  | { type: "favorite/toggle"; id: string }
  | { type: "profile/update"; name: string }
  | { type: "voice/set"; enabled: boolean }
  | { type: "session/start"; session: Session }
  | { type: "session/pause"; now: number }
  | { type: "session/resume"; now: number }
  | {
      type: "session/finish";
      now: number;
      notes: string;
      outcome: NonNullable<Session["outcome"]>;
    }
  | { type: "reset" };
export function elapsed(session: Session, now: number) {
  return (
    session.elapsedMs +
    (session.runningSince === null
      ? 0
      : Math.max(0, now - session.runningSince))
  );
}
export function reducer(state: AppData, action: Action): AppData {
  switch (action.type) {
    case "horse/add":
      return {
        ...state,
        horses: [...state.horses, action.horse],
        selectedHorseId: action.horse.id,
      };
    case "horse/select":
      return state.horses.some((h) => h.id === action.id)
        ? { ...state, selectedHorseId: action.id }
        : state;
    case "favorite/toggle":
      return {
        ...state,
        favorites: state.favorites.includes(action.id)
          ? state.favorites.filter((id) => id !== action.id)
          : [...state.favorites, action.id],
      };
    case "profile/update":
      return { ...state, riderName: action.name.trim().slice(0, 60) };
    case "voice/set":
      return { ...state, voice: action.enabled };
    case "session/start":
      return state.sessions.some((s) => s.status !== "finished") ||
        !state.horses.some((h) => h.id === action.session.horseId)
        ? state
        : { ...state, sessions: [action.session, ...state.sessions] };
    case "session/pause":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.status === "active"
            ? {
                ...s,
                elapsedMs: elapsed(s, action.now),
                runningSince: null,
                status: "paused",
              }
            : s,
        ),
      };
    case "session/resume":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.status === "paused"
            ? { ...s, runningSince: action.now, status: "active" }
            : s,
        ),
      };
    case "session/finish":
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.status !== "finished"
            ? {
                ...s,
                elapsedMs: elapsed(s, action.now),
                runningSince: null,
                status: "finished",
                finishedAt: action.now,
                notes: action.notes.trim().slice(0, 2000),
                outcome: action.outcome,
                evidenceSource: "rider_report",
              }
            : s,
        ),
      };
    case "reset":
      return { ...initialData, horses: [], favorites: [], sessions: [] };
  }
}
export function parseStoredData(raw: string | null): AppData {
  if (!raw) return initialData;
  const data: unknown = JSON.parse(raw);
  if (!data || typeof data !== "object")
    throw new Error("Format de sauvegarde inconnu");
  const d = data as AppData;
  if (
    d.version !== 1 ||
    typeof d.riderName !== "string" ||
    typeof d.voice !== "boolean" ||
    typeof d.selectedHorseId !== "string" ||
    !Array.isArray(d.horses) ||
    !Array.isArray(d.sessions) ||
    !Array.isArray(d.favorites)
  )
    throw new Error("Sauvegarde incompatible");
  if (
    !d.favorites.every((id) => typeof id === "string") ||
    !d.horses.every(
      (h) =>
        h &&
        typeof h.id === "string" &&
        typeof h.name === "string" &&
        typeof h.breed === "string" &&
        (h.birthYear === null || Number.isInteger(h.birthYear)),
    )
  )
    throw new Error("Fiches invalides");
  if (
    !d.sessions.every(
      (s) =>
        s &&
        typeof s.id === "string" &&
        typeof s.horseId === "string" &&
        typeof s.horseName === "string" &&
        typeof s.exerciseId === "string" &&
        typeof s.title === "string" &&
        Number.isFinite(s.startedAt) &&
        Number.isFinite(s.elapsedMs) &&
        s.elapsedMs >= 0 &&
        (s.runningSince === null || Number.isFinite(s.runningSince)) &&
        ["active", "paused", "finished"].includes(s.status),
    )
  )
    throw new Error("Historique invalide");
  return d;
}

export function durationLabel(ms: number) {
  const seconds = Math.floor(Math.max(0, ms) / 1000);
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
