import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { SharedFeed, SocialConnection, FriendshipPanel } from "./SharedSocial";
import { Header, Empty, command } from "./shared";
import type { WorkspaceModel } from "./model";
export function CommunityPage({ model }: { model: WorkspaceModel }) {
  const {
    setParams,
    state,
    draft,
    setDraft,
    drafts,
    section,
    community,
    saveDraft,
  } = model;
  const pendingPublish = useRef<string | null>(null);
  useEffect(() => {
    if (!state.socialBusy && pendingPublish.current !== null) {
      if (state.socialError) setDraft(pendingPublish.current);
      pendingPublish.current = null;
    }
  }, [state.socialBusy, state.socialError]);
  return (
    <>
      <Header
        number="COMMUNAUTÉ / L’ÉQUITATION SE PARTAGE"
        title="LES MÊMES ÉMOTIONS."
        description="Des moments à raconter, des chemins à découvrir et des rencontres à préparer."
      />
      <SocialConnection state={state} />
      <nav className="studio-segments" aria-label="Rubriques de la communauté">
        {[
          ["social", "Le fil"],
          ["routes", "Balades"],
          ["events", "Événements"],
          ["services", "Professionnels"],
          ["top", "Progression"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={community === id}
            onClick={() => setParams({ rubrique: id })}
          >
            {label}
          </button>
        ))}
      </nav>
      {community === "social" && (
        <div className="studio-social-layout">
          <div>
            <FriendshipPanel state={state} />
            <section className="studio-panel compose">
              <span className="ride-kicker">VOTRE MOMENT À CHEVAL</span>
              <label htmlFor="social-draft">
                Qu’avez-vous envie de raconter ?
              </label>
              <textarea
                id="social-draft"
                value={draft}
                maxLength={4000}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Une sensation, un progrès, un beau moment…"
              />
              <div>
                <span>
                  {state.authenticated
                    ? "Choisissez : conserver ici ou publier à vos amis."
                    : "Brouillon privé · sur cet appareil"}
                </span>
                <button
                  className="studio-dark"
                  disabled={!draft.trim()}
                  onClick={saveDraft}
                >
                  Conserver <ArrowRight size={17} />
                </button>
                {state.authenticated && (
                  <button
                    className="studio-dark"
                    disabled={!draft.trim() || state.socialBusy}
                    onClick={() => {
                      pendingPublish.current = draft;
                      command("publish", draft);
                      setDraft("");
                    }}
                  >
                    {state.socialBusy ? "Envoi…" : "Publier à mes amis"}
                    <ArrowRight size={17} />
                  </button>
                )}
              </div>
            </section>
            <SharedFeed state={state} />
            {!state.posts?.length && (
              <Empty
                title="DE LA PLACE POUR VOS HISTOIRES."
                text={
                  state.authenticated
                    ? "Aucune publication de votre cercle n’est chargée. Acceptez la demande d’amitié, publiez depuis le second compte puis actualisez le fil."
                    : "Aucune publication communautaire n’est chargée dans ce mode. Les brouillons ci-dessous restent privés et ne sont pas des publications partagées."
                }
              />
            )}
            {drafts.map((d) => (
              <article className="studio-panel journal-entry" key={d.id}>
                <span>BROUILLON PRIVÉ</span>
                <p>{d.text}</p>
                <time>{new Date(d.at).toLocaleDateString("fr-FR")}</time>
              </article>
            ))}
          </div>
          <aside>
            <img
              src="/photos/landscape.webp"
              alt="Deux personnes et leurs chevaux en montagne"
            />
            <span className="ride-kicker">UN LIEN QUI SE PARTAGE</span>
            <h2>
              LES HISTOIRES
              <br />
              COMMENCENT DEHORS.
            </h2>
            <Link className="studio-text-link" to="/carte">
              Retrouver vos tracés <ArrowUpRight size={18} />
            </Link>
          </aside>
        </div>
      )}
      {community === "routes" && (
        <div className="studio-live-hero">
          <img src="/photos/trail.webp" alt="Sortie en forêt à cheval" />
          <div>
            <span className="ride-kicker">EXPLORER À VOTRE RYTHME</span>
            <h2>
              AU BOUT
              <br />
              DU CHEMIN.
            </h2>
            <p>
              Préparez une sortie, enregistrez votre tracé et conservez les
              points de votre téléphone.
            </p>
            <Link className="studio-primary" to="/carte">
              Vos parcours <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
      {community === "events" && (
        <Empty
          title="LES RENDEZ-VOUS À VENIR."
          text="Aucun événement vérifié n’est disponible dans ce mode. Nous n’affichons ni concours fictifs ni fausses disponibilités."
          link="/pro"
          label="Préparer votre entourage"
        />
      )}
      {community === "services" && (
        <Empty
          title="LE BON REGARD À VOS CÔTÉS."
          text="Trouvez un professionnel et vérifiez directement ses compétences, ses coordonnées et ses disponibilités."
          link="/experts"
          label="Rechercher un professionnel"
        />
      )}
      {community === "top" && (
        <Empty
          title="VOTRE PARCOURS VOUS APPARTIENT."
          text="Sans données comparables et vérifiées, aucun classement n’est affiché. Retrouvez vos propres séances et observations."
          link="/performances"
          label="Ouvrir votre carnet"
        />
      )}
    </>
  );
}
