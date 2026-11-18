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
  Ellipsis,
  Mic,
  Menu,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";

import { command, Header } from "./shared";
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
  const [selectedTopic,setSelectedTopic]=useState("all");
  const [libraryMenuOpen,setLibraryMenuOpen]=useState(false);
  const [threadActionsFor,setThreadActionsFor]=useState("");
  const [deleteThread,setDeleteThread]=useState<{id:string;title:string}|null>(null);
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
    section,
    lesson,
    saveDraft,
  } = model;
  useEffect(()=>{if(state.chatBusy)sending.current=false;if(state.chatError){sending.current=false;setQuestion(previous=>previous||sentQuestion)}},[state.chatBusy,state.chatError]);
  useEffect(()=>{
    if(!state.authenticated){setHistoryRequested(false);return;}
    if((section==="library"||section==="voice")&&state.authenticated&&!historyRequested){setHistoryRequested(true);command("chat-history");}
  },[section,state.authenticated,historyRequested]);
  const historyMessages=state.chatHistory||[];
  const conversations:{id:string;title:string;date:string;messages:typeof historyMessages}[]=[];
  for(const message of historyMessages){
    const stamp=message.created_at?new Date(message.created_at).getTime():NaN;
    const last=conversations[conversations.length-1];
    const lastStamp=last?.messages.at(-1)?.created_at?new Date(last.messages.at(-1)!.created_at!).getTime():NaN;
    const conversationId=message.conversation_id||"";
    if(conversationId){
      const existing=conversations.find(item=>item.id===conversationId);
      if(existing){existing.messages.push(message);if(message.role==="user"&&existing.title==="Discussion ALI")existing.title=message.content;}
      else conversations.push({id:conversationId,title:message.role==="user"?message.content:"Discussion ALI",date:Number.isFinite(stamp)?new Date(stamp).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"Récemment",messages:[message]});
    }else if(!last||!Number.isFinite(stamp)||!Number.isFinite(lastStamp)||stamp-lastStamp>60*60*1000){
      const id=Number.isFinite(stamp)?new Date(stamp).toISOString():`legacy-${conversations.length}`;
      conversations.push({id,title:message.role==="user"?message.content:"Discussion ALI",date:Number.isFinite(stamp)?new Date(stamp).toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}):"Récemment",messages:[message]});
    }else last.messages.push(message);
  }
  conversations.reverse();
  const visibleConversations=conversations.filter(item=>item.title.toLocaleLowerCase("fr").includes(historyQuery.trim().toLocaleLowerCase("fr"))||item.messages.some(message=>message.content.toLocaleLowerCase("fr").includes(historyQuery.trim().toLocaleLowerCase("fr"))));
  const topics=[
    {id:"seances",label:"Séances & exercices",pattern:/\b(s[eé]ance|exercice|galop|trot|incurv|transition|dressage|obstacle|saut|carri[eè]re|entra[iî]nement|travail)\b/i},
    {id:"cheval",label:"Comportement du cheval",pattern:/\b(comportement|peur|stress|agress|mord|embarque|refus|confiance|relation|comprendre mon cheval)\b/i},
    {id:"sante",label:"Santé & sécurité",pattern:/\b(v[eé]t[eé]rinaire|sant[eé]|bless|boiter|chute|urgence|douleur|soin|casque|s[eé]curit[eé])\b/i},
    {id:"balades",label:"Balades & itinéraires",pattern:/\b(balade|randonn[eé]e|itin[eé]raire|chemin|sortie|promenade|gps)\b/i},
    {id:"materiel",label:"Matériel & équipement",pattern:/\b(selle|filet|mors|[eé]quipement|mat[eé]riel|tapis|protections|casque connect[eé])\b/i},
    {id:"progression",label:"Progression & objectifs",pattern:/\b(progress|objectif|niveau|galop [1-7]|comp[eé]tence|bilan|progr[eè]s|routine)\b/i},
  ];
  const topicFor=(conversation:typeof conversations[number])=>{
    const text=[conversation.title,...conversation.messages.map(message=>message.content)].join(" ");
    return topics.find(topic=>topic.pattern.test(text))?.id||"general";
  };
  const topicGroups=[...topics,{id:"general",label:"Questions générales",pattern:/.^/}].map(topic=>({
    ...topic,
    conversations:visibleConversations.filter(conversation=>topicFor(conversation)===topic.id),
  })).filter(topic=>topic.conversations.length>0);
  const filteredConversations=selectedTopic==="all"?visibleConversations:visibleConversations.filter(conversation=>topicFor(conversation)===selectedTopic);
  const selectedConversation=filteredConversations.find(item=>item.id===selectedThreadId);
  const activeChat=state.chat||[];
  function newConversation(){
    const id=crypto.randomUUID();
    setSelectedThreadId(id);setSelectedTopic("all");setQuestion("");setThreadActionsFor("");setLibraryMenuOpen(false);
    command("chat-new",undefined,id);
  }
  return (
    <>
      {(section==="voice"||section==="library")?<div className="ali-chat-page-heading"><div><span className="ride-kicker">NEWRIDE / ALI</span><h1>Discussion avec ALI</h1><p>Un échange ciblé, relié à votre progression équestre.</p></div><Link className="studio-text-link" to="/ali/a-propos">Découvrir ALI <ArrowUpRight size={17}/></Link></div>:<Header number="ALI / COACHING" title="ALI, votre coach." description="Leçons, progression et échanges adaptés à votre pratique."><Link className="studio-text-link" to="/ali/a-propos">En savoir plus <ArrowUpRight size={18}/></Link></Header>}
      <nav className="studio-segments" aria-label="Espaces du coaching">
        {[
          ["voice", "Discussion"],
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
      {(section === "voice" || section === "library") && (
        <section className="ali-chat-workspace" aria-label="Discussion écrite avec ALI">
          <button className="ali-chat-mobile-backdrop" type="button" aria-label="Fermer la liste des discussions" onClick={()=>setLibraryMenuOpen(false)} hidden={!libraryMenuOpen}/>
          <aside className={`ali-chat-sidebar${libraryMenuOpen?" is-open":""}`} aria-label="Discussions ALI">
            <div className="ali-chat-sidebar-top">
              <Link to="/" className="ali-chat-brand">ALI <span>by NewRide</span></Link>
              <button type="button" className="ali-sidebar-icon mobile-only" aria-label="Fermer la liste" onClick={()=>setLibraryMenuOpen(false)}><X size={20}/></button>
            </div>
            <button className="ali-chat-new" type="button" onClick={newConversation}><Plus size={18}/> Nouvelle discussion</button>
            {state.authenticated&&<label className="ali-sidebar-search"><Search size={17}/><input aria-label="Rechercher une discussion" value={historyQuery} onChange={event=>setHistoryQuery(event.target.value)} placeholder="Rechercher une discussion"/></label>}
            {!state.authenticated?<div className="ali-chat-auth-note"><p>Connectez-vous pour discuter avec ALI et conserver vos échanges.</p><Link to="/acces-test">Se connecter</Link></div>:<>
              <p className="ali-sidebar-label">Classées par sujet</p>
              <button className={`ali-topic-all${selectedTopic==="all"?" selected":""}`} type="button" aria-pressed={selectedTopic==="all"} onClick={()=>setSelectedTopic("all")}><span>Toutes les discussions</span><small>{visibleConversations.length}</small></button>
              {state.chatHistoryLoading&&<p className="ali-sidebar-loading">Chargement…</p>}
              <nav className="ali-topic-groups ali-chat-topic-groups" aria-label="Sujets des discussions">
                {topicGroups.map(group=><details key={group.id} open={selectedTopic===group.id||undefined}>
                  <summary><span>{group.label}</span><small>{group.conversations.length}</small></summary>
                  <div className="ali-topic-threads">
                    {group.conversations.map(item=><div className={`ali-thread-row${selectedThreadId===item.id?" selected":""}`} key={item.id}>
                      <button type="button" className="ali-thread-open" onClick={()=>{setSelectedTopic(group.id);setSelectedThreadId(item.id);setLibraryMenuOpen(false);command("chat-open",undefined,item.id)}}>
                        <strong>{item.title.slice(0,64)}{item.title.length>64?"…":""}</strong><small>{item.date}</small>
                      </button>
                      <button type="button" className="ali-thread-actions-trigger" aria-label={`Actions pour ${item.title}`} aria-expanded={threadActionsFor===item.id} onClick={()=>setThreadActionsFor(threadActionsFor===item.id?"":item.id)}><Ellipsis size={17}/></button>
                      {threadActionsFor===item.id&&<div className="ali-thread-actions-menu"><button type="button" onClick={()=>{setDeleteThread({id:item.id,title:item.title});setThreadActionsFor("")}}><Trash2 size={15}/> Supprimer</button></div>}
                    </div>)}
                  </div>
                </details>)}
                {topicGroups.length===0&&!state.chatHistoryLoading&&<p className="ali-library-no-results">Aucune discussion pour le moment.</p>}
              </nav>
            </>}
            <div className="ali-chat-sidebar-bottom"><Link to="/ali/a-propos">Comment ALI vous accompagne <ArrowUpRight size={15}/></Link></div>
          </aside>
          <div className="ali-chat-main">
            <div className="ali-chat-mainbar">
              <button type="button" className="ali-sidebar-icon desktop-hide" aria-label="Ouvrir les discussions" onClick={()=>setLibraryMenuOpen(true)}><Menu size={20}/></button>
              <div><span>ALI · COACH ÉQUESTRE</span><strong>{selectedConversation?.title||"Votre espace de progression"}</strong></div>
              <button type="button" className="ali-voice-quick" aria-label={state.voiceActive?"Arrêter la conversation vocale":"Parler avec ALI"} onClick={()=>{if(state.voiceActive)command("voice-stop");else if(state.authenticated)command("voice-start");else setNotice("Connectez-vous pour démarrer une conversation vocale.")}}><Mic size={18}/><span>{state.voiceActive?"Arrêter":"Voix"}</span></button>
            </div>
            <div className={`ali-chat-scroll${activeChat.length?" has-messages":""}`} role="log" aria-live="polite" aria-label="Messages de la discussion">
              {!activeChat.length?<div className="ali-chat-welcome"><span className="ali-chat-mark">ALI</span><h2>{lesson?`On travaille : ${lesson}`:"Par quoi voulez-vous progresser ?"}</h2><p>Une question précise suffit. ALI s’appuie sur vos échanges et, si vous le choisissez, sur le suivi de votre duo.</p><div className="ali-chat-suggestions"><button type="button" onClick={()=>setQuestion("Aide-moi à préparer ma prochaine séance.")}>Préparer ma prochaine séance</button><button type="button" onClick={()=>setQuestion("Comment améliorer la régularité de mon cheval ?")}>Travailler un point technique</button><button type="button" onClick={()=>setQuestion("Que dois-je observer pendant ma prochaine séance ?")}>Savoir quoi observer</button></div></div>:<div className="ali-chat-messages">{activeChat.map((message,index)=><article className={`ali-chat-message ${message.role==="user"?"from-rider":"from-ali"}`} key={`${message.conversation_id||selectedThreadId}-${message.id||index}`}><span>{message.role==="user"?"VOUS":"ALI"}</span><p>{message.content}</p></article>)}{state.chatBusy&&<article className="ali-chat-message from-ali" role="status"><span>ALI</span><p className="ali-chat-pending">Je prépare une réponse utile…</p></article>}</div>}
            </div>
            {notice&&<p role="status" className="ali-chat-notice">{notice} {!state.authenticated&&<Link to="/acces-test">Se connecter</Link>}</p>}
            {state.chatError&&<p role="alert" className="media-error">{state.chatError}</p>}
            <form className="ali-chat-composer" onSubmit={event=>{
              event.preventDefault();
              if(!question.trim()||state.chatBusy||sending.current)return;
              if(!state.ready){setNotice("Le service ALI se prépare. Réessayez dans un instant.");return;}
              if(!state.authenticated){setNotice("Connectez-vous pour discuter avec ALI. Votre question reste conservée.");return;}
              const frame=document.getElementById("newride-engine") as HTMLIFrameElement|null;
              if(!frame?.contentWindow){setNotice("Le service ALI n’est pas prêt. Votre question est conservée.");return;}
              const conversationId=selectedThreadId||crypto.randomUUID();
              if(!selectedThreadId){setSelectedThreadId(conversationId);command("chat-new",undefined,conversationId);}
              sending.current=true;setSentQuestion(question);
              frame.contentWindow.postMessage({type:"newride-v2-command",command:"chat",text:question,conversationId,context:shareContext?aliContext(localData,question):null},location.origin);
              setQuestion("");setNotice("");
            }}>
              <textarea aria-label="Message pour ALI" value={question} onChange={event=>setQuestion(event.target.value)} onKeyDown={event=>{if(event.key==="Enter"&&!event.shiftKey){event.preventDefault();event.currentTarget.form?.requestSubmit();}}} maxLength={4000} placeholder={state.authenticated?"Écrivez votre message à ALI…":"Connectez-vous pour écrire à ALI…"}/>
              <div className="ali-composer-bottom"><label><input type="checkbox" checked={shareContext} onChange={event=>setShareContext(event.target.checked)}/> Ajouter mon cheval et mes bilans</label><button type="submit" aria-label="Envoyer le message" disabled={!question.trim()||state.chatBusy||!state.authenticated}>{state.chatBusy?<span className="ali-send-loading"/>:<Send size={18}/>}</button></div>
            </form>
            <p className="ali-chat-disclaimer">ALI accompagne votre réflexion ; il ne remplace pas un enseignant ni un vétérinaire.</p>
          </div>
          {deleteThread&&<div className="ali-delete-overlay" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setDeleteThread(null)}}><section className="ali-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="ali-delete-title"><h2 id="ali-delete-title">Supprimer cette discussion ?</h2><p>« {deleteThread.title} » et ses messages seront supprimés de votre historique. Cette action est définitive.</p><div><button type="button" className="studio-secondary" onClick={()=>setDeleteThread(null)}>Annuler</button><button type="button" className="ali-delete-confirm" onClick={()=>{command("chat-delete",undefined,deleteThread.id);if(selectedThreadId===deleteThread.id)setSelectedThreadId("");setDeleteThread(null)}}><Trash2 size={16}/> Supprimer</button></div></section></div>}
        </section>
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
      {section === "video" && (
        <section className="studio-panel"><span className="ride-kicker">ALI / OBSERVER APRÈS LA SÉANCE</span><h2>Un autre angle de vue.</h2><MediaPicker kind="video" file={video} onChange={setVideo}/><p className="compat-note">L’analyse porte sur des images extraites de la vidéo, après enregistrement. Elle ne mesure pas des angles ou une boiterie et ne remplace pas un professionnel.</p><button className="studio-primary" disabled={!video || !state.authenticated || state.videoLoading} onClick={()=>{const frame=document.getElementById('newride-engine') as HTMLIFrameElement|null;frame?.contentWindow?.postMessage({type:'newride-v2-command',command:'video-analyze',file:video},location.origin)}}>{state.videoLoading ? 'Analyse en cours…' : 'Envoyer les images à ALI pour analyse'}</button>{!state.authenticated && <p>Connectez votre compte dans <Link to="/acces-test">Accès test</Link> pour demander une analyse.</p>}<p role="status">{state.videoProgress}</p>{state.videoReport?.summary && <article><h3>Retour d’ALI</h3><p>{state.videoReport.summary}</p><small>{state.videoReport.frameCount} images examinées · interprétation à vérifier avec votre enseignant</small></article>}</section>
      )}
    </>
  );
}
