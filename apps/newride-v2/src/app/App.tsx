import {
  Component,
  useEffect,
  useState,
  useRef,
  type ReactNode,
  type ErrorInfo,
} from "react";
import { BrowserRouter, Link, NavLink, useLocation } from "react-router-dom";
import {
  Activity,
  MapPin,
  Compass,
  ChartNoAxesCombined,
  Ellipsis,
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { StoreProvider, useStore } from "./Store";
import { ServiceProvider } from "../features/workspace/shared";
import { HelmetProvider } from "../features/helmet/HelmetProvider";
import { GpsProvider, useRideRecorder } from "../features/Workspace";
import { RetainedScreens } from "./routes";
import { NavigationState, useTabNavigation } from "./NavigationState";
import { LegacySessionProvider, useVoiceActive } from "./LegacySession";
import { type TabId } from "./navigation";
import { Newridebis } from "../features/Newridebis";
import { Dialog, Button } from "../components/ui";
const navigation = [
 {id:"today" as TabId,path:"/",label:"Accueil",icon:Home,description:"Votre quotidien équestre"},
 {id:"ali" as TabId,path:"/coaching",label:"ALI",icon:AudioLines,description:"Parler, écouter, s’entraîner"},
 {id:"helmet" as TabId,path:"/casque",label:"Mon casque",icon:Radio,description:"Connexion & sécurité"},
 {id:"community" as TabId,path:"/discover",label:"Communauté",icon:Compass,description:"Amis, moments & balades"},
 {id:"stable" as TabId,path:"/ecurie",label:"Mon écurie",icon:Footprints,description:"Chevaux, carnet & entourage"},
];
const mobileNavigation = navigation;
const legacyTabs: Record<
  string,
  "live" | "perf" | "map" | "discover" | "coach" | "pro"
> = {
  "/live": "live",
  "/lecons": "coach",
  "/performances": "perf",
  "/carte": "map",
  "/discover": "discover",
  "/ali": "coach",
  "/ali/conversation": "coach",
  "/connexion": "coach",
  "/acces-test": "coach",
  "/pro": "pro",
};

function Shell() {
  const { data, storageError } = useStore();
  const { activeTab, destination } = useTabNavigation();
  const voiceActive = useVoiceActive();
  const gps = useRideRecorder();
  const [railCollapsed, setRailCollapsed] = useState(false);
  const location = useLocation();
  const legacyTab = legacyTabs[location.pathname];
  const lastLegacy = useRef<
    "live" | "perf" | "map" | "discover" | "coach" | "pro"
  >("coach");
  if (legacyTab) lastLegacy.current = legacyTab;
  const [engineMounted, setEngineMounted] = useState(!!legacyTab);
  useEffect(() => {
    if (legacyTab) setEngineMounted(true);
  }, [legacyTab]);
  const [help, setHelp] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const chatSection = new URLSearchParams(location.search).get("section") || "voice";
  const aliChatFullscreen =
    (location.pathname === "/ali" || location.pathname === "/ali/conversation") &&
    (chatSection === "voice" || chatSection === "library");
  const horse = data.horses.find((h) => h.id === data.selectedHorseId);
  const active = data.sessions.find((s) => s.status !== "finished");
  useEffect(() => {
    document.querySelector("main")?.focus({ preventScroll: true });

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
    <div className={`app-shell ${location.pathname !== "/" ? "feature-shell" : ""} ${railCollapsed ? "compact-rail" : ""} ${aliChatFullscreen ? "ali-chat-fullscreen" : ""}`}>
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
          {navigation.map(({ id, path, label, icon: Icon, description }) => (
            <NavLink
              key={path}
              to={destination(id)}
              end={path === "/"}
              className={({ isActive }) =>
                `nav-item ${activeTab === id ? "active" : ""} ${path === "/casque" ? "nav-live" : ""}`
              }
            >
              <Icon size={21} strokeWidth={1.7} />
              <span>
                <strong>{label}</strong>
                <small>{description}</small>
              </span>
              
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className="rail-toggle"
            onClick={() => setRailCollapsed((v) => !v)}
            aria-label={
              railCollapsed
                ? "Développer la navigation"
                : "Réduire la navigation"
            }
          >
            {railCollapsed ? (
              <PanelLeftOpen size={20} />
            ) : (
              <PanelLeftClose size={20} />
            )}
            <span>Réduire la navigation</span>
          </button>
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

            {voiceActive && (
              <Link to="/ali?section=voice" className="voice-active-pill">
                <span />
                Microphone ALI actif
              </Link>
            )}
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
        {gps.started && (
          <div className="gps-recording-banner" role="status">
            <Link to="/live">
              GPS du téléphone en cours · {Math.floor(gps.seconds / 60)} min
            </Link>
            <button onClick={gps.stop}>Terminer et conserver</button>
          </div>
        )}
        {active && location.pathname !== "/seance-guidee" && (
          <Link className="active-session-banner" to="/seance-guidee">
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
          <RetainedScreens />
          {engineMounted && (
            <div hidden={!legacyTab}>
              <Newridebis tab={lastLegacy.current} visible={!!legacyTab} />
            </div>
          )}

          <footer className="page-footer">
            <span>
              <ShieldCheck size={14} />
              Votre pratique, à votre rythme.
            </span>
            <span>
              Votre carnet · Sur cet appareil{" "}
              <Link to="/sources">Sources & limites</Link>
            </span>
          </footer>
        </main>
      </div>
      <nav className={`bottom-navigation${aliChatFullscreen ? " is-chat-hidden" : ""}`} aria-label="Navigation mobile">
        {mobileNavigation.map(({ id, path, label, icon: Icon }) => (
          <NavLink
            key={path}
            end={path === "/"}
            to={destination(id)}
            className={({ isActive }) =>
              `${activeTab === id ? "active" : ""} ${path === "/casque" ? "bottom-live" : ""}`
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
              Retrouvez le coaching dans ALI, la connexion et la sécurité dans Mon casque, les balades dans Communauté et votre historique dans Mon écurie. Un compte donne accès à la conversation vocale et aux publications partagées.
              L’Écurie V2 reste locale ; le casque et les réservations ne sont
              pas validés par cette reprise.
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
          <LegacySessionProvider>
            <NavigationState>
              <HelmetProvider>
                <GpsProvider>
                  <ServiceProvider>
                    <Shell />
                  </ServiceProvider>
                </GpsProvider>
              </HelmetProvider>
            </NavigationState>
          </LegacySessionProvider>
        </StoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
