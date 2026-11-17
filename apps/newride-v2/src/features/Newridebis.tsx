import { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ExternalLink, LogIn, ShieldCheck } from "lucide-react";
import { Button, Badge } from "../components/ui";
export type OriginalTab =
  | "live"
  | "perf"
  | "map"
  | "discover"
  | "coach"
  | "pro";
const headings: Record<OriginalTab, [string, string]> = {
  live: ["Live", "Séance, suivi et commandes de coaching NewRidebis."],
  perf: [
    "Vos performances",
    "Retrouvez les séances et les analyses de NewRidebis.",
  ],
  map: ["Votre carte", "Tracés, localisation et exploration de vos sorties."],
  discover: [
    "Discover",
    "Communauté, balades, événements, services et classement.",
  ],
  coach: [
    "Votre coach ALI",
    "Conversation vocale, leçons, programmes, mémoire et analyse vidéo.",
  ],
  pro: ["Votre espace Pro", "Coachs, échanges et bilans de NewRidebis."],
};
export function Newridebis({
  tab,
  visible = true,
  loginRequested = false,
}: {
  tab: OriginalTab;
  visible?: boolean;
  loginRequested?: boolean;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [params] = useSearchParams();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [connected, setConnected] = useState(false);
  const section =
    params.get("section") ||
    (location.pathname === "/ali/conversation" ? "voice" : "");
  const lesson = params.get("lecon") || "";
  const sub = params.get("rubrique") || "";
  function route() {
    frame.current?.contentWindow?.postMessage(
      { type: "newride-v2-route", tab, section, lesson, sub },
      location.origin,
    );
  }
  useEffect(() => {
    const timer = setTimeout(() => setFailed(true), 15000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    function message(event: MessageEvent) {
      if (
        event.origin !== location.origin ||
        event.source !== frame.current?.contentWindow ||
        event.data?.type !== "newridebis-ready"
      )
        return;
      setLoaded(true);
      setFailed(false);
      setConnected(event.data.authenticated === true);
    }
    addEventListener("message", message);
    return () => removeEventListener("message", message);
  }, []);
  useEffect(() => {
    if (visible) route();
  }, [tab, section, lesson, sub, loaded, visible]);
  useEffect(() => {
    if (visible && loaded && loginRequested && !connected)
      frame.current?.contentWindow?.postMessage(
        { type: "newride-v2-route", action: "login" },
        location.origin,
      );
  }, [visible, loaded, loginRequested, connected]);
  return (
    <>
      <div className="page-intro compat-intro">
        <div>
          <p className="eyebrow">VOTRE ÉQUITATION, EN CONNEXION</p>
          <h1>
            {headings[tab][0]}
            <span className="greeting-dot">.</span>
          </h1>
          <p>{headings[tab][1]}</p>
        </div>
        <Badge tone={connected ? "green" : "neutral"}>
          {connected ? "Compte connecté" : "Exploration sans compte"}
        </Badge>
      </div>
      <div className="compat-toolbar">
        <p>
          <ShieldCheck size={16} />
          Retrouvez votre compte et vos échanges.
          Connectez-vous pour la conversation vocale.
        </p>
        <Button
          variant="secondary"
          onClick={() =>
            frame.current?.contentWindow?.postMessage(
              { type: "newride-v2-route", action: "login" },
              location.origin,
            )
          }
        >
          <LogIn size={16} />
          {connected ? "Mon compte" : "Se connecter"}
        </Button>
      </div>
      {tab === "coach" && (
        <div className="compat-quicklinks">
          <Link to="/coaching">Accueil ALI</Link>
          <Link to="/lecons">Leçons & questions</Link>
          <Link to="/exercices">Exercices guidés V2</Link>
        </div>
      )}
      <div className="compat-frame-shell">
        {!loaded && (
          <div className="compat-loading" role="status">
            {failed ? (
              <>
                <p>Le chargement prend plus de temps que prévu.</p>
                <a
                  className="button button-secondary"
                  href={location.pathname + location.search}
                >
                  Réessayer
                </a>
              </>
            ) : (
              "Chargement de votre espace…"
            )}
          </div>
        )}
        <iframe
          id="newride-engine"
          ref={frame}
          title={`NewRidebis — ${headings[tab][0]}`}
          src="/newridebis/index.html"
          className="compat-frame"
          allow="microphone; camera; geolocation; autoplay"
          onLoad={route}
        />
      </div>
      <p className="compat-note">
        Vos fiches chevaux locales de la V2 et votre compte NewRidebis sont
        encore deux espaces distincts. Le capteur de casque n’est pas validé par
        cette reprise.
      </p>
    </>
  );
}
