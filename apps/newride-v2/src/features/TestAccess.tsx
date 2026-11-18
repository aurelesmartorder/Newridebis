import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LogIn, LogOut, ShieldCheck } from "lucide-react";
import { command, Header, useEngine } from "./workspace/shared";
export function TestAccess() {
  const { state, notice } = useEngine();
  const form = useRef<HTMLFormElement>(null);
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), 15000);
    return () => clearTimeout(timer);
  }, []);
  useEffect(
    () => () => {
      form.current?.reset();
    },
    [],
  );
  function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const input = event.currentTarget.elements.namedItem(
      "password",
    ) as HTMLInputElement;
    if (input) input.value = "";
    if (!email || !password) return;
    const frame = document.getElementById(
      "newride-engine",
    ) as HTMLIFrameElement | null;
    frame?.contentWindow?.postMessage(
      { type: "newride-v2-command", command: "test-login", email, password },
      location.origin,
    );
  }
  return (
    <>
      <Header
        number="ACCÈS TEST / FACULTATIF"
        title="DEUX PROFILS. UN MÊME LIEN."
        description="Cet accès sert aux essais des fonctions partagées. La navigation reste libre sans compte."
      />
      <div className="studio-two">
        <section className="studio-panel">
          <ShieldCheck size={27} strokeWidth={1.3} />
          <h2>
            {state.authenticated
              ? "Votre compte est connecté."
              : "Retrouvez votre compte test."}
          </h2>
          {!state.ready ? (
            <p role="status">
              {slow
                ? "Les services n’ont pas pu être chargés. Rechargez la page ou continuez à explorer sans compte."
                : "Connexion aux services NewRide en cours…"}
            </p>
          ) : state.authenticated ? (
            <>
              <p>
                Pseudo : <strong>{state.accountLabel || "Votre compte"}</strong>
              </p>
              <Link className="studio-dark" to="/ali?section=memory">Mon parcours avec ALI <ArrowRight size={18}/></Link>
              <Link className="studio-dark" to="/discover">
                Ouvrir la communauté <ArrowRight size={18} />
              </Link>
              <button
                className="studio-text-link"
                onClick={() => command("test-logout")}
                disabled={state.authBusy || state.socialBusy}
              >
                <LogOut size={17} />
                Déconnecter ce compte
              </button>
            </>
          ) : (
            <form ref={form} onSubmit={login}>
              <label htmlFor="test-email">Email du compte test</label>
              <input
                id="test-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                maxLength={254}
              />
              <label htmlFor="test-password">Mot de passe</label>
              <input
                id="test-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={200}
              />
              <button
                className="studio-dark"
                disabled={state.authBusy || state.socialBusy}
              >
                <LogIn size={17} />
                {state.authBusy ? "Connexion…" : "Se connecter au compte test"}
              </button>
            </form>
          )}
          {notice && <p role="status">{notice}</p>}
          <p className="test-access-note">
            L’application ne conserve pas votre mot de passe. Une session de
            connexion peut rester active dans ce navigateur jusqu’à votre
            déconnexion.
          </p>
        </section>
        <section className="studio-panel studio-learn">
          <h2>Un appareil par testeur.</h2>
          <p>
            Ouvrez le compte A dans une fenêtre et le compte B dans un autre
            navigateur ou une fenêtre privée. Deux onglets du même navigateur
            partagent généralement la même session.
          </p>
          <ol className="test-access-steps">
            <li>Envoyer une demande d’amitié au pseudo du second compte.</li>
            <li>Accepter depuis le second compte.</li>
            <li>Publier un message de test depuis A.</li>
            <li>Actualiser depuis B, puis aimer et commenter.</li>
            <li>Vérifier le retour depuis A.</li>
          </ol>
          <Link className="studio-text-link" to="/discover">
            Parcourir sans se connecter <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </>
  );
}
