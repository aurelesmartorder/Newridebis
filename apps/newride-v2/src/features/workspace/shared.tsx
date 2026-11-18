import {
  createContext,
  useContext,
  useId,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Compass } from "lucide-react";

import {
  acceptPoint,
  distance,
  readRides,
  type GpsPoint,
} from "../../lib/guestRide";
export type Post = {
  id: string;
  caption: string;
  isSelf?: boolean;
  authorName?: string;
  photo_url?: string;
  like?: { count: number; likedByMe?: boolean };
  comments?: { id: string; content: string; authorName?: string }[];
};
export type Snapshot = {
  ready?: boolean;
  chatBusy?: boolean;
  chatError?: string;
  chatHistoryLoading?: boolean;
  videoLoading?: boolean;
  videoProgress?: string;
  videoReport?: {summary?:string; observations?: unknown; frameCount?:number}|null;
  accountLabel?: string;
  authBusy?: boolean;
  socialBusy?: boolean;
  socialError?: string;
  friends?: { id: string; username: string }[];
  incoming?: { requesterId: string; username: string }[];
  sent?: { addresseeId: string; username: string }[];
  authenticated?: boolean;
  voiceActive?: boolean;
  connecting?: boolean;
  posts?: Post[];
  program?: { day: string; activity: string; detail: string }[];
  chat?: { id?: number; conversation_id?: string | null; role: string; content: string; created_at?: string }[];
  chatHistory?: { id?: number; conversation_id?: string | null; role: string; content: string; created_at?: string }[];
};
export function command(command: string, text?: string, id?: string) {
  const frame = document.getElementById(
    "newride-engine",
  ) as HTMLIFrameElement | null;
  frame?.contentWindow?.postMessage(
    { type: "newride-v2-command", command, text, id },
    location.origin,
  );
}
export function Header({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="studio-heading">
      <div>
        <p className="ride-kicker">NEWRIDE / {number}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function Empty({
  title,
  text,
  link,
  label,
}: {
  title: string;
  text: string;
  link?: string;
  label?: string;
}) {
  return (
    <div className="studio-empty">
      <span className="studio-empty-mark">NR /</span>
      <h2>{title}</h2>
      <p>{text}</p>
      {link && (
        <Link className="studio-text-link" to={link}>
          {label}
          <ArrowRight size={18} />
        </Link>
      )}
    </div>
  );
}
const ServiceContext = createContext<{
  state: Snapshot;
  notice: string;
  setNotice: React.Dispatch<React.SetStateAction<string>>;
} | null>(null);
export function ServiceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Snapshot>({});
  const [notice, setNotice] = useState("");
  useEffect(() => {
    function receive(event: MessageEvent) {
      const frame = document.getElementById(
        "newride-engine",
      ) as HTMLIFrameElement | null;
      if (
        event.origin !== location.origin ||
        event.source !== frame?.contentWindow
      )
        return;
      if (event.data?.type === "newride-v2-session-reset")
        setState({ ready: false });
      if (event.data?.type === "newridebis-ready")
        setState({ ...event.data, ready: true });
      if (event.data?.type === "newride-v2-notice")
        setNotice(String(event.data.message).slice(0, 500));
    }
    addEventListener("message", receive);
    return () => removeEventListener("message", receive);
  }, []);
  return (
    <ServiceContext value={{ state, notice, setNotice }}>
      {children}
    </ServiceContext>
  );
}
export function useEngine() {
  const value = useContext(ServiceContext);
  if (!value) throw Error("ServiceProvider absent");
  return value;
}
function useGpsRecorder() {
  const [rides, setRides] = useState(() =>
    readRides(localStorage.getItem("newride.v2.gps")),
  );
  const [points, setPoints] = useState<GpsPoint[]>([]);
  const [started, setStarted] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState("");
  const watch = useRef<number | null>(null);
  const pointRef = useRef<GpsPoint[]>([]);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(
    () => () => {
      if (watch.current !== null)
        navigator.geolocation.clearWatch(watch.current);
    },
    [],
  );
  function start() {
    if (watch.current !== null) return;
    if (!navigator.geolocation) {
      setError("Le GPS n’est pas disponible sur cet appareil.");
      return;
    }
    setError("");
    pointRef.current = [];
    setPoints([]);
    setStarted(Date.now());
    watch.current = navigator.geolocation.watchPosition(
      (position) => {
        const p = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          at: position.timestamp,
          accuracy: position.coords.accuracy,
        };
        const next = acceptPoint(pointRef.current, p);
        if (next === pointRef.current) {
          setError("Signal imprécis : ce point n’est pas retenu.");
          return;
        }
        pointRef.current = next;
        setPoints(next);
        setError("");
      },
      () => {
        setError(
          "Le GPS n’est pas accessible. Vérifiez l’autorisation de localisation de votre navigateur.",
        );
        if (watch.current !== null)
          navigator.geolocation.clearWatch(watch.current);
        watch.current = null;
        setStarted(null);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 },
    );
  }
  function stop() {
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null;
    if (started && pointRef.current.length) {
      const ride = {
        id: crypto.randomUUID(),
        startedAt: started,
        endedAt: Date.now(),
        points: pointRef.current,
        distance: distance(pointRef.current),
      };
      const updated = [ride, ...rides].slice(0, 100);
      try {
        localStorage.setItem("newride.v2.gps", JSON.stringify(updated));
        setRides(updated);
        setError("Séance enregistrée sur cet appareil.");
      } catch {
        setError(
          "Stockage plein : gardez cette page ouverte pour exporter le tracé.",
        );
      }
    } else
      setError(
        "Aucun point GPS exploitable : aucun parcours n’a été enregistré.",
      );
    setStarted(null);
  }
  return {
    rides,
    points,
    started,
    error,
    start,
    stop,
    seconds: started ? Math.floor((now - started) / 1000) : 0,
  };
}
const GpsContext = createContext<ReturnType<typeof useGpsRecorder> | null>(
  null,
);
export function GpsProvider({ children }: { children: React.ReactNode }) {
  const value = useGpsRecorder();
  return <GpsContext value={value}>{children}</GpsContext>;
}
export function useRideRecorder() {
  const value = useContext(GpsContext);
  if (!value) throw Error("GpsProvider absent");
  return value;
}
export function clock(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
export function Trace({ points }: { points: GpsPoint[] }) {
  const gridId = useId();
  if (points.length < 2)
    return (
      <div className="trace-empty">
        <Compass size={42} strokeWidth={1} />
        <p>Votre tracé prendra forme ici.</p>
        <span>Au moins deux points GPS précis sont nécessaires.</span>
      </div>
    );
  const xs = points.map((p) => p.lng),
    ys = points.map((p) => p.lat);
  const left = Math.min(...xs),
    top = Math.max(...ys),
    scale = Math.max(Math.max(...xs) - left, top - Math.min(...ys), 0.00001);
  return (
    <svg
      className="ride-trace"
      viewBox="0 0 600 360"
      role="img"
      aria-label="Tracé des points GPS enregistrés, sans fond de carte"
    >
      <defs>
        <pattern
          id={gridId}
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path d="M30 0H0V30" fill="none" stroke="#d9dfd1" strokeWidth=".5" />
        </pattern>
      </defs>
      <rect width="600" height="360" fill={`url(#${gridId})`} />
      <polyline
        points={points
          .map(
            (p) =>
              `${60 + ((p.lng - left) / scale) * 480},${40 + ((top - p.lat) / scale) * 280}`,
          )
          .join(" ")}
        fill="none"
        stroke="#ff714e"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
