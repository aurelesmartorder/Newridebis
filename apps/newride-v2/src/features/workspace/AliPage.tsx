import { useState } from "react";
import { MediaPicker } from "../../components/MediaPicker";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Mic,
  Send,
} from "lucide-react";

import { command, Header, Empty } from "./shared";
import type { WorkspaceModel } from "./model";
export function AliPage({ model }: { model: WorkspaceModel }) {
  const [video, setVideo] = useState<File|null>(null);
  const {
    setParams,
    state,
    setNotice,
    draft,
    setDraft,
    drafts,
    question,
    setQuestion,
    contact,
    section,
    lesson,
    saveDraft,
  } = model;
  return (
    <>
      <Header
        number="ALI / CONVERSATION"
        title="ON PREND LE TEMPS."
        description="Un sujet, votre contexte. Une conversation pour y voir plus clair."
      >
        <Link className="studio-text-link" to="/ali/a-propos">
          En savoir plus <ArrowUpRight size={18} />
        </Link>
      </Header>
      <nav className="studio-segments" aria-label="Espaces du coaching">
        {[
          ["voice", "Conversation"],
          ["program", "Programme"],
          ["memory", "Journal"],
          ["video", "Vidéo"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={section === id}
            onClick={() => setParams({ section: id })}
          >
            {label}
          </button>
        ))}
        <Link to="/lecons">
          Leçons <ArrowUpRight size={15} />
        </Link>
      </nav>
      {section === "voice" && (
        <>
          <div className="conversation-stage">
            <img src="/photos/portrait.webp" alt="Portrait d’un cheval gris" />
            <div className="conversation-content">
              <span className="ride-kicker">ALI / À VOTRE ÉCOUTE</span>
              <h2>
                {lesson
                  ? "UNE LEÇON.\nVOTRE REGARD."
                  : "LA BONNE QUESTION\nCHANGE TOUT."}
              </h2>
              <p>
                {lesson ||
                  "Position, confiance, contact… Commencez par ce qui vous préoccupe aujourd’hui."}
              </p>
              <div className="voice-orbit" aria-hidden="true">
                {[18, 32, 46, 26, 54, 38, 20].map((height, i) => (
                  <span key={i} style={{ height }} />
                ))}
              </div>
              <button
                className="studio-primary"
                onClick={() => {
                  setNotice("");
                  if (state.voiceActive) command("voice-stop");
                  else if (state.authenticated)
                    command("voice-start", lesson || undefined);
                  else
                    setNotice(
                      "La conversation ALI connectée n’est pas encore disponible en mode invité. Les leçons et les exercices guidés restent accessibles sans compte.",
                    );
                }}
              >
                <Mic size={19} />
                {state.connecting
                  ? "Connexion en cours…"
                  : state.voiceActive
                    ? (lesson ? "Arrêter la leçon" : "Terminer la conversation")
                    : (lesson ? "Écouter la leçon" : "Parler avec ALI")}
              </button>
              <small>
                {state.voiceActive
                  ? "Microphone actif · terminez la conversation pour le couper."
                  : "Le microphone reste éteint tant que vous ne démarrez pas une conversation."}
              </small>
            </div>
          </div>
          <div className="studio-two">
            <section className="studio-panel">
              <span className="ride-kicker">UNE QUESTION PRÉCISE</span>
              <h2>Partons de votre observation.</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!question.trim()) return;
                  if (state.authenticated) {
                    command("chat", question);
                    setQuestion("");
                  } else
                    setNotice(
                      "Les réponses ALI en ligne ne sont pas encore disponibles en mode invité. Vous pouvez conserver cette question dans votre journal.",
                    );
                }}
              >
                <label htmlFor="ali-question">Votre question à ALI</label>
                <textarea
                  id="ali-question"
                  value={question}
                  maxLength={4000}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Qu’avez-vous ressenti ? Dans quelle situation ?"
                />
                <button className="studio-dark" disabled={!question.trim()}>
                  <Send size={17} />
                  Envoyer
                </button>
              </form>
              {state.chat?.map((message, i) => (
                <div key={i} className="studio-chat">
                  <b>{message.role === "user" ? "Vous" : "ALI"}</b>
                  <p>{message.content}</p>
                </div>
              ))}
            </section>
            <section className="studio-panel studio-learn">
              <BookOpen size={26} strokeWidth={1.2} />
              <h2>Les déclics se cultivent.</h2>
              <p>
                Cinquante sujets pour explorer la position, les aides, la
                confiance et les disciplines.
              </p>
              <Link className="studio-text-link" to="/lecons">
                Choisir une leçon <ArrowRight size={18} />
              </Link>
              <Link className="studio-text-link" to="/exercices">
                Pratiquer un exercice guidé <ArrowRight size={18} />
              </Link>
            </section>
          </div>
        </>
      )}
      {section === "program" && (
        <div className="studio-two">
          <section className="studio-panel">
            <span className="ride-kicker">LE RYTHME DU DUO</span>
            <h2>Préparer, pratiquer, observer.</h2>
            <p>
              Choisissez un exercice adapté à votre niveau et gardez une
              intention simple pour la séance.
            </p>
            <Link className="studio-dark" to="/exercices">
              Explorer les exercices <ArrowRight size={18} />
            </Link>
            <button
              className="studio-text-link"
              onClick={() =>
                state.authenticated
                  ? command("program")
                  : setNotice(
                      "La génération personnalisée en ligne n’est pas disponible en mode invité. Les parcours guidés sont accessibles dès maintenant.",
                    )
              }
            >
              Générer avec ALI <ArrowRight size={18} />
            </button>
            {state.program?.map((day, i) => (
              <article className="program-day" key={i}>
                <span>{day.day}</span>
                <h3>{day.activity}</h3>
                <p>{day.detail}</p>
              </article>
            ))}
          </section>
          <img
            className="studio-portrait"
            src="/photos/trail.webp"
            alt="Cavalier sur un sentier forestier"
          />
        </div>
      )}
      {section === "memory" && (
        <section className="studio-panel studio-journal">
          <span className="ride-kicker">VOTRE JOURNAL LOCAL</span>
          <h2>Ce que vous avez remarqué.</h2>
          <p>
            Conservez une observation ou une question pour votre prochaine
            séance. Ces notes restent sur cet appareil et ne sont pas envoyées à
            ALI.
          </p>
          <label htmlFor="coach-journal">Votre observation</label>
          <textarea
            id="coach-journal"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={4000}
            placeholder="Aujourd’hui, j’ai remarqué…"
          />
          <button
            className="studio-dark"
            disabled={!draft.trim()}
            onClick={saveDraft}
          >
            Conserver la note <Check size={18} />
          </button>
          {drafts.map((d) => (
            <article className="journal-entry" key={d.id}>
              <time>{new Date(d.at).toLocaleDateString("fr-FR")}</time>
              <p>{d.text}</p>
            </article>
          ))}
        </section>
      )}
      {section === "video" && (
        <section className="studio-panel"><span className="ride-kicker">ALI / OBSERVER APRÈS LA SÉANCE</span><h2>Un autre angle de vue.</h2><MediaPicker kind="video" file={video} onChange={setVideo}/><p className="compat-note">L’analyse porte sur des images extraites de la vidéo, après enregistrement. Elle ne mesure pas des angles ou une boiterie et ne remplace pas un professionnel.</p><button className="studio-primary" disabled={!video || !state.authenticated || state.videoLoading} onClick={()=>{const frame=document.getElementById('newride-engine') as HTMLIFrameElement|null;frame?.contentWindow?.postMessage({type:'newride-v2-command',command:'video-analyze',file:video},location.origin)}}>{state.videoLoading ? 'Analyse en cours…' : 'Envoyer les images à ALI pour analyse'}</button>{!state.authenticated && <p>Connectez votre compte dans <Link to="/acces-test">Accès test</Link> pour demander une analyse.</p>}<p role="status">{state.videoProgress}</p>{state.videoReport?.summary && <article><h3>Retour d’ALI</h3><p>{state.videoReport.summary}</p><small>{state.videoReport.frameCount} images examinées · interprétation à vérifier avec votre enseignant</small></article>}</section>
      )}
    </>
  );
}
