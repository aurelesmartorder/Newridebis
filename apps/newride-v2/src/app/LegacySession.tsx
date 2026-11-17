import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { safeReturnTo } from "./navigation";
import { Skeleton } from "../components/ui";
type Status = "loading" | "anonymous" | "authenticated" | "unavailable";
const Context = createContext<Status>("loading");
const VoiceContext = createContext(false);
export function LegacySessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [voice, setVoice] = useState(false);
  useEffect(() => {
    function receive(event: MessageEvent) {
      const frame = document.getElementById(
        "newride-engine",
      ) as HTMLIFrameElement | null;
      if (
        event.origin !== location.origin ||
        event.source !== frame?.contentWindow ||
        event.data?.type !== "newridebis-ready"
      )
        return;
      setStatus(
        event.data.authenticated === true ? "authenticated" : "anonymous",
      );
      setVoice(event.data.voiceActive === true);
    }
    addEventListener("message", receive);
    return () => removeEventListener("message", receive);
  }, []);
  return (
    <Context value={status}>
      <VoiceContext value={voice}>{children}</VoiceContext>
    </Context>
  );
}
export const useLegacySession = () => useContext(Context);
export const useVoiceActive = () => useContext(VoiceContext);
export function RequireAccount({ children }: { children: ReactNode }) {
  const status = useLegacySession();
  const location = useLocation();
  if (status === "loading") return <Skeleton rows={2} />;
  if (status !== "authenticated")
    return (
      <Navigate
        replace
        to={`/connexion?retour=${encodeURIComponent(safeReturnTo(location.pathname + location.search))}`}
      />
    );
  return children;
}
export function LoginScreen() {
  const status = useLegacySession();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const target = safeReturnTo(params.get("retour"));
  useEffect(() => {
    if (status === "authenticated") navigate(target, { replace: true });
  }, [status, target, navigate]);
  return (
    <section className="account-intro">
      <span className="ride-kicker">VOTRE COMPTE NEWRIDEBIS</span>
      <h1>Retrouvons votre coaching.</h1>
      <p>
        Connectez-vous ci-dessous avec votre compte NewRidebis. Votre
        destination sera conservée. Aucun compte n’est requis pour explorer les
        leçons et les autres espaces.
      </p>
    </section>
  );
}
