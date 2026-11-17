import {
  Component,
  Suspense,
  lazy,
  useEffect,
  useState,
  type ReactNode,
  type ErrorInfo,
} from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import {
  Activity,
  ArrowRight,
  AudioLines,
  Bell,
  BookOpen,
  ChevronDown,
  CircleHelp,
  ChessKnight as Footprints,
  Home,
  Radio,
  Settings2,
  ShieldCheck,
  UsersRound,
  WifiOff,
  X,
} from "lucide-react";
import { StoreProvider, useStore } from "./Store";
import { Dashboard } from "../features/Dashboard";
import { Dialog, Button, Skeleton } from "../components/ui";
const Coaching = lazy(() =>
  import("../features/Coaching").then((m) => ({ default: m.Coaching })),
);
const ExerciseDetail = lazy(() =>
  import("../features/Coaching").then((m) => ({ default: m.ExerciseDetail })),
);
const Sources = lazy(() =>
  import("../features/Coaching").then((m) => ({ default: m.Sources })),
);
const Live = lazy(() =>
  import("../features/Live").then((m) => ({ default: m.Live })),
);
const Stable = lazy(() =>
  import("../features/Stable").then((m) => ({ default: m.Stable })),
);
const SessionDetail = lazy(() =>
  import("../features/Stable").then((m) => ({ default: m.SessionDetail })),
);
const Experts = lazy(() =>
  import("../features/Experts").then((m) => ({ default: m.Experts })),
);
const navigation = [
  {
    path: "/",
    label: "Flux",
    icon: Home,
    description: "Votre quotidien équestre",
  },
  {
    path: "/coaching",
    label: "Coaching",
    icon: BookOpen,
    description: "Exercices & objectifs",
  },
  {
    path: "/live",
    label: "Live",
    icon: AudioLines,
    description: "Votre séance en direct",
  },
  {
    path: "/experts",
    label: "Experts",
    icon: UsersRound,
    description: "Les professionnels",
  },
  {
    path: "/ecurie",
    label: "Écurie",
    icon: Footprints,
    description: "Votre duo & votre carnet",
  },
];
function Shell() {
  const { data, storageError } = useStore();
  const location = useLocation();
  const [help, setHelp] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const horse = data.horses.find((h) => h.id === data.selectedHorseId);
  const active = data.sessions.find((s) => s.status !== "finished");
  useEffect(() => {
    document.querySelector("main")?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
    setNotifications(false);
  }, [location.pathname]);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  const date = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="NewRide, accueil">
          <img src="/newride.svg" alt="" />
          <span>
            newride<span className="brand-period">.</span>
          </span>
        </Link>
        <p className="brand-descriptor">L’ÉQUITATION, EN CONNEXION</p>
        <nav className="desktop-navigation" aria-label="Navigation principale">
          {navigation.map(({ path, label, icon: Icon, description }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""} ${path === "/live" ? "nav-live" : ""}`
              }
            >
              <Icon size={21} strokeWidth={1.7} />
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              {path === "/live" && <span className="nav-live-dot" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-quote">
            <span>«</span>
            <p>
              Bien monter,
              <br />
              c’est d’abord
              <br />
              mieux écouter.
            </p>
            <i>LA PHILOSOPHIE NEWRIDE</i>
          </div>
          <button className="help-button" onClick={() => setHelp(true)}>
            <CircleHelp size={18} />
            Un repère pour commencer
            <ArrowRight size={15} />
          </button>
          <Link to="/ecurie?tab=cavalier" className="profile-button">
            <span className="profile-avatar">
              {data.riderName ? data.riderName.slice(0, 2).toUpperCase() : "NR"}
            </span>
            <div>
              <strong>{data.riderName || "Mon espace"}</strong>
              <small>Votre carnet personnel</small>
            </div>
            <Settings2 size={17} />
          </Link>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <Link to="/" className="brand mobile-brand">
            <img src="/newride.svg" alt="" />
            <span>newride.</span>
          </Link>
          <div className="header-context">
            <span className="context-dot" />
            Votre espace équestre
            <span className="top-divider" />
            <span className="header-date">{date}</span>
          </div>
          <div className="header-actions">
            <Link className="horse-switch" to="/ecurie">
              <Footprints size={17} />
              <span>{horse?.name || "Mon écurie"}</span>
              <ChevronDown size={14} />
            </Link>
            <button
              className="icon-button notification-button"
              onClick={() => setNotifications(true)}
              aria-label="Ouvrir mes notifications"
            >
              <Bell size={20} />
            </button>
            <Link
              to="/ecurie?tab=cavalier"
              className="header-avatar"
              aria-label="Mon profil"
            >
              {data.riderName ? data.riderName.slice(0, 2).toUpperCase() : "NR"}
            </Link>
          </div>
        </header>
        {!online && (
          <div role="status" className="status-banner">
            <WifiOff size={17} />
            Hors connexion. Vos données restent locales ; les pages non encore
            chargées peuvent être indisponibles.
          </div>
        )}
        {storageError && (
          <div role="alert" className="status-banner error-banner">
            {storageError}
          </div>
        )}
        {active && location.pathname !== "/live" && (
          <Link className="active-session-banner" to="/live">
            <Radio size={18} />
            Séance {active.status === "paused"
              ? "en pause"
              : "en cours"} avec {active.horseName}
            <span>
              Revenir à ma séance
              <ArrowRight size={16} />
            </span>
          </Link>
        )}
        <main id="main" tabIndex={-1}>
          <Suspense fallback={<Skeleton rows={4} />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/coaching" element={<Coaching />} />
              <Route path="/coaching/:id" element={<ExerciseDetail />} />
              <Route path="/live" element={<Live />} />
              <Route path="/experts" element={<Experts />} />
              <Route path="/ecurie" element={<Stable />} />
              <Route path="/seances/:id" element={<SessionDetail />} />
              <Route path="/sources" element={<Sources />} />
              <Route
                path="*"
                element={
                  <div className="card empty-state">
                    <h1>Retrouvons le bon chemin.</h1>
                    <p>Cette page n’existe pas.</p>
                    <Link to="/" className="button button-primary">
                      Revenir à l’accueil
                    </Link>
                  </div>
                }
              />
            </Routes>
          </Suspense>
          <footer className="page-footer">
            <span>
              <ShieldCheck size={14} />
              Votre pratique, à votre rythme.
            </span>
            <span>
              V2 · Carnet local sur cet appareil{" "}
              <Link to="/sources">Sources & limites</Link>
            </span>
          </footer>
        </main>
      </div>
      <nav className="bottom-navigation" aria-label="Navigation mobile">
        {navigation.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            end={path === "/"}
            to={path}
            className={({ isActive }) =>
              `${isActive ? "active" : ""} ${path === "/live" ? "bottom-live" : ""}`
            }
          >
            <span>
              <Icon size={21} strokeWidth={1.8} />
            </span>
            <strong>{label}</strong>
          </NavLink>
        ))}
      </nav>
      {help && (
        <Dialog
          title="Bienvenue dans votre espace"
          onClose={() => setHelp(false)}
        >
          <div className="welcome-steps">
            <p>
              Cette V2 est indépendante de votre application actuelle. Commencez
              simplement :
            </p>
            <ol>
              <li>Ajoutez votre cheval dans l’Écurie.</li>
              <li>Choisissez un exercice dans Coaching.</li>
              <li>Préparez puis chronométrez votre séance dans Live.</li>
              <li>Retrouvez votre ressenti dans le carnet.</li>
            </ol>
            <p>
              Ce premier module est un carnet local avec guide de séance. Le
              casque, la conversation IA, la synchronisation et les réservations
              ne sont pas encore intégrés.
            </p>
            <Button onClick={() => setHelp(false)}>C’est parti</Button>
          </div>
        </Dialog>
      )}
      {notifications && (
        <Dialog
          title="Vos notifications"
          onClose={() => setNotifications(false)}
        >
          <div className="empty-state">
            <Bell size={30} />
            <h3>Tout est calme ici</h3>
            <p>
              Aucune nouvelle notification. Les rappels de soins ne sont pas
              encore activés dans cette version.
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("NewRide UI error", error.name, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <div className="fatal-error">
        <h1>Un instant pour reprendre.</h1>
        <p>
          Impossible d’afficher cet écran. Vos données locales n’ont pas été
          effacées.
        </p>
        <button
          className="button button-primary"
          onClick={() => window.location.reload()}
        >
          Recharger
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <StoreProvider>
          <Shell />
        </StoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
