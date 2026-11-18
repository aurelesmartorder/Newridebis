import { useState, useRef, useEffect } from "react";
import { useStore } from "../../app/Store";
import { aliContext } from "../../lib/aliContext";
import { buildAliPlan } from "../../lib/aliCoach";
import { MediaPicker } from "../../components/MediaPicker";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  History,
  Mic,
  MessageSquareText,
  Plus,
  Search,
  Send,
} from "lucide-react";

import { command, Header, Empty } from "./shared";
import type { WorkspaceModel } from "./model";
export function AliPage({ model }: { model: WorkspaceModel }) {
  const {data:localData}=useStore();
  const coachPlan=buildAliPlan(localData);
  const [shareContext,setShareContext]=useState(false);
  const sending=useRef(false);
  const [sentQuestion,setSentQuestion]=useState("");
  const [video, setVideo] = useState<File|null>(null);
  const [historyRequested,setHistoryRequested]=useState(false);
  const [historyQuery,setHistoryQuery]=useState("");
  const [selectedThreadId,setSelectedThreadId]=useState("");
  const {
    setParams,
    state,
    setNotice,
    notice,
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
  useEffect(()=>{if(state.chatBusy)sending.current=false;if(state.chatError){sending.current=false;setQuestion(previous=>previous||sentQuestion)}},[state.chatBusy,state.chatError]);
  useEffect(()=>{
    if(!state.authenticated){setHistoryRequested(false);return;}
    if(section==="library"&&!historyRequested){setHistoryRequested(true);command("chat-history");}
  },[section,state.authenticated,historyRequested]);
  const historyMessages=state.chat||[];
  const conversations:{id:string;title:string;date:string;messages:typeof historyMessages}[]=[];
  for(const message of historyMessages){
    const stamp=message.created_at?new Date(message.created_at).getTime():NaN;
    const last=conversations[conversations.length-1];
    const lastStamp=last?.messages.at(-1)?.created_at?new Date(last.messages.at(-1)!.created_at!).getTime():NaN;
    if(!last||!Number.isFinite(stamp)||!Number.isFinite(lastStamp)||stamp-lastStamp>60*60*1000){
      const id=Number.isFinite(stamp)?new Date(stamp).toISOString():`live-${conversations.length}`;
      conversations.push({id,title:message.role==="user"?message.content:"Discussion ALI",date:Number.isFinite(stamp)?new Date(stamp).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"Récemment",messages:[message]});
    }else last.messages.push(message);
  }
  conversations.reverse();
  const visibleConversations=conversations.filter(item=>item.title.toLocaleLowerCase("fr").includes(historyQuery.trim().toLocaleLowerCase("fr"))||item.messages.some(message=>message.content.toLocaleLowerCase("fr").includes(historyQuery.trim().toLocaleLowerCase("fr"))));
  const selectedConversation=visibleConversations.find(item=>item.id===selectedThreadId)||visibleConversations[0];
  return (
    <>
      <Header
        number="ALI / CONVERSATION"
        title="ALI, votre coach."
        description="Posez votre question. ALI vous répond sans détour."
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
          ["library", "Bibliothèque"],
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
              <h2>Votre conversation avec ALI.</h2>
              {notice && <p role="status" className="ali-chat-notice">{notice} {!state.authenticated&&<Link to="/acces-test">Me connecter</Link>}</p>}
              <div className="ali-chat-history" role="log" aria-live="polite" aria-label="Historique de la conversation">{state.chat?.map((message,i)=><article className={message.role==='user'?'ali-message from-rider':'ali-message from-ali'} key={i}><strong>{message.role==='user'?'Vous':'ALI'}</strong><p>{message.content}</p></article>)}{state.chatBusy&&<p className="ali-chat-pending" role="status">ALI prépare sa réponse…</p>}</div>
              {state.chatError&&<p role="alert" className="media-error">{state.chatError}</p>}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!question.trim() || state.chatBusy || sending.current) return;
                  if (!state.ready) {setNotice('Le service ALI se prépare. Réessayez dans un instant.');return;}
                  if (!state.authenticated) {setNotice('Connectez votre compte pour discuter avec ALI. Votre question reste conservée.');return;}
                  const frame=document.getElementById('newride-engine') as HTMLIFrameElement|null;
                  if(!frame?.contentWindow){setNotice('Le service ALI n’est pas prêt. Votre question est conservée.');return;}
                  sending.current=true;setSentQuestion(question);
                  frame.contentWindow.postMessage({type:'newride-v2-command',command:'chat',text:question,context:shareContext?aliContext(localData,question):null},location.origin);
                  setQuestion('');
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
                <label className="ali-context-choice"><input type="checkbox" checked={shareContext} onChange={e=>setShareContext(e.target.checked)}/>Utiliser le cheval sélectionné et les cinq derniers bilans de cet appareil</label>
                <p className="media-hint">Les échanges de ce compte sont conservés pour consultation et continuité. Cochez la case pour transmettre aussi à ALI le cheval choisi et les bilans de cet appareil.</p>
                <button className="studio-dark" disabled={!question.trim() || state.chatBusy}>
                  <Send size={17} />
                  {state.chatBusy ? "Réponse en cours…" : "Envoyer à ALI"}
                </button>
              </form>
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
            <article className="program-day" aria-live="polite">
              <span>PLAN ALI · {coachPlan.horseName || "DUO À SÉLECTIONNER"}</span>
              <h3>{coachPlan.priority}</h3>
              <p>{coachPlan.evidenceLabel}</p>
              <p><strong>{coachPlan.exercise?.title || "Choisir un exercice"}</strong><br />{coachPlan.nextStep}</p>
              {coachPlan.criteria.length > 0 && <ul>{coachPlan.criteria.map((criterion) => <li key={criterion}>{criterion}</li>)}</ul>}
              <p className="media-hint">{coachPlan.safetyNotice}</p>
              {coachPlan.exercise && <Link className="studio-text-link" to={`/live?exercice=${encodeURIComponent(coachPlan.exercise.id)}`}>Préparer cet exercice <ArrowRight size={17} /></Link>}
            </article>
            <Link className="studio-dark" to="/exercices">
              Explorer les exercices <ArrowRight size={18} />
            </Link>
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
      {section === "library" && (
        <section className="studio-panel ali-library">
          <div className="ali-library-heading">
            <div><span className="ride-kicker">VOTRE HISTORIQUE ALI</span><h2>Vos conversations.</h2><p>Retrouvez vos questions et les réponses d’ALI.</p></div>
            <button className="studio-primary" type="button" onClick={()=>setParams({section:"voice"})}><Plus size={18}/> Nouvelle discussion</button>
          </div>
          {!state.authenticated ? (
            <div className="ali-library-locked"><MessageSquareText size={28}/><h3>Votre bibliothèque vous attend.</h3><p>Connectez-vous pour retrouver les discussions enregistrées sur votre compte.</p><Link className="studio-dark" to="/acces-test">Se connecter</Link></div>
          ) : (
            <>
              <label className="ali-library-search"><Search size={18}/><input aria-label="Rechercher dans les discussions" value={historyQuery} onChange={event=>setHistoryQuery(event.target.value)} placeholder="Rechercher une question ou un sujet"/></label>
              {state.chatHistoryLoading&&<p role="status" className="ali-chat-pending">Chargement de votre bibliothèque…</p>}
              {state.chatError&&<p role="alert" className="media-error">{state.chatError}</p>}
              {!state.chatHistoryLoading&&conversations.length===0&&<div className="ali-library-locked"><MessageSquareText size={28}/><h3>Aucune discussion enregistrée pour le moment.</h3><p>Vos prochaines questions envoyées à ALI apparaîtront ici.</p><button className="studio-dark" type="button" onClick={()=>{setHistoryRequested(false);command("chat-history")}}>Actualiser</button></div>}
              {conversations.length>0&&<div className="ali-library-layout"><nav className="ali-thread-list" aria-label="Discussions enregistrées">{visibleConversations.map(item=><button type="button" className={selectedConversation?.id===item.id?"selected":""} key={item.id} onClick={()=>setSelectedThreadId(item.id)}><span>{item.date}</span><strong>{item.title.slice(0,72)}{item.title.length>72?"…":""}</strong><small>{item.messages.length} message{item.messages.length>1?"s":""}</small></button>)}{visibleConversations.length===0&&<p>Aucun résultat pour cette recherche.</p>}</nav><div className="ali-thread-view" role="log" aria-label="Contenu de la discussion">{selectedConversation?selectedConversation.messages.map((message,index)=><article className={message.role==="user"?"ali-message from-rider":"ali-message from-ali"} key={`${selectedConversation.id}-${index}`}><strong>{message.role==="user"?"Vous":"ALI"}</strong><p>{message.content}</p></article>):<p>Sélectionnez une discussion.</p>}</div></div>}
              <p className="media-hint">Les discussions sont regroupées par proximité de leurs horodatages ; ce regroupement ne remplace pas un identifiant de conversation dédié.</p>
            </>
          )}
        </section>
      )}
      {section === "video" && (
        <section className="studio-panel"><span className="ride-kicker">ALI / OBSERVER APRÈS LA SÉANCE</span><h2>Un autre angle de vue.</h2><MediaPicker kind="video" file={video} onChange={setVideo}/><p className="compat-note">L’analyse porte sur des images extraites de la vidéo, après enregistrement. Elle ne mesure pas des angles ou une boiterie et ne remplace pas un professionnel.</p><button className="studio-primary" disabled={!video || !state.authenticated || state.videoLoading} onClick={()=>{const frame=document.getElementById('newride-engine') as HTMLIFrameElement|null;frame?.contentWindow?.postMessage({type:'newride-v2-command',command:'video-analyze',file:video},location.origin)}}>{state.videoLoading ? 'Analyse en cours…' : 'Envoyer les images à ALI pour analyse'}</button>{!state.authenticated && <p>Connectez votre compte dans <Link to="/acces-test">Accès test</Link> pour demander une analyse.</p>}<p role="status">{state.videoProgress}</p>{state.videoReport?.summary && <article><h3>Retour d’ALI</h3><p>{state.videoReport.summary}</p><small>{state.videoReport.frameCount} images examinées · interprétation à vérifier avec votre enseignant</small></article>}</section>
      )}
    </>
  );
}
