import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  AudioLines,
  BluetoothOff,
  Check,
  CircleHelp,
  Clock3,
  Pause,
  Play,
  Repeat2,
  ShieldCheck,
  Smartphone,
  Square,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useStore } from "../app/Store";
import { exercises } from "../content/exercises";
import { durationLabel, elapsed, type Session } from "../lib/model";
import { Badge, Button, Dialog } from "../components/ui";
import { useVoiceActive } from "../app/LegacySession";
import { useAliSpeech } from "../hooks/useAliSpeech";
import { recordLearning } from "./workspace/shared";
import { HorseForm } from "./HorseForm";
export function Live() {
  const { data, dispatch } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [exerciseId, setExerciseId] = useState(() =>
    exercises.some((e) => e.id === params.get("exercice"))
      ? params.get("exercice")!
      : exercises[0].id,
  );
  const [ready, setReady] = useState(false);
  const [add, setAdd] = useState(false);
  const [finish, setFinish] = useState(false);
  const [info, setInfo] = useState(false);
  const [now, setNow] = useState(Date.now());
  const voice = useAliSpeech();
  const conversationActive = useVoiceActive();
  const session = data.sessions.find((s) => s.status !== "finished");
  const exercise = exercises.find(
    (e) => e.id === (session?.exerciseId || exerciseId),
  )!;
  useEffect(() => {
    if (!session || session.status !== "active") return;
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, [session?.status]);
  const time = session ? elapsed(session, now) : 0;
  let cumulative = 0;
  let stepIndex = exercise.steps.findIndex((step) => {
    cumulative += step.seconds * 1000;
    return time < cumulative;
  });
  if (stepIndex < 0) stepIndex = exercise.steps.length - 1;
  const step = exercise.steps[stepIndex];
  const planned = exercise.duration * 60000;
  const plannedDone = time >= planned;
  function speak() { void voice.speak(step.instruction, () => recordLearning({kind:'instruction',title:exercise.title+' · '+step.title,content:step.instruction,horse_id:session?.horseId,horse_name:session?.horseName,details:{exercise_id:exercise.id,step:stepIndex+1,playback:'started'}})); }
  useEffect(() => { voice.stop(); }, [stepIndex, session?.status]);
  function start() {
    const horse = data.horses.find((h) => h.id === data.selectedHorseId);
    if (!horse || !ready) return;
    const startedAt = Date.now();
    setNow(startedAt);
    dispatch({
      type: "session/start",
      session: {
        id: crypto.randomUUID(),
        horseId: horse.id,
        horseName: horse.name,
        exerciseId: exercise.id,
        title: exercise.title,
        startedAt,
        elapsedMs: 0,
        runningSince: startedAt,
        status: "active",
      },
    });
  }
  function finishSession(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const outcome = String(f.get("outcome")) as NonNullable<Session["outcome"]>;
    const id = session?.id;
    if(session)recordLearning({id:session.id,kind:'exercise',title:session.title,horse_id:session.horseId,horse_name:session.horseName,
      content:String(f.get('notes')||''),duration_seconds:elapsed(session,Date.now())/1000,
      details:{exercise_id:session.exerciseId,outcome,evidence:'rider_report',criteria:exercise.criteria||[],started_at:new Date(session.startedAt).toISOString()}});
    dispatch({
      type: "session/finish",
      now: Date.now(),
      notes: String(f.get("notes") || ""),
      outcome,
    });
    voice.stop();
    setFinish(false);
    navigate(`/seances/${id}`);
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">VOTRE TEMPS À CHEVAL</p>
          <h1>
            {session ? "Dans votre séance." : "Prêts pour votre séance ?"}
          </h1>
          <p>
            {session
              ? `${session.horseName} · ${exercise.title}`
              : "Choisissez votre partenaire et une intention pour aujourd’hui."}
          </p>
        </div>
        <Badge tone="green">
          <Smartphone size={14} />
          Mode téléphone
        </Badge>
      </div>
      <div className="live-layout">
        <section className="live-panel">
          <div className="live-panel-header">
            <span className="live-label">
              <span />
              GUIDE DE SÉANCE
            </span>
            <button
              className="icon-button"
              aria-label="Comprendre le mode téléphone"
              onClick={() => setInfo(true)}
            >
              <CircleHelp size={20} />
            </button>
          </div>
          {session ? (
            <>
              <div className="live-clock">
                <span>
                  {session.status === "paused"
                    ? "EN PAUSE"
                    : plannedDone
                      ? "TEMPS PRÉVU ÉCOULÉ"
                      : "TEMPS DE PRATIQUE"}
                </span>
                <strong>{durationLabel(time)}</strong>
                <p>
                  {exercise.duration} minutes proposées · adaptez à votre duo
                </p>
              </div>
              <div className="live-progress">
                <span
                  style={{ width: `${Math.min(100, (time / planned) * 100)}%` }}
                />
              </div>
              <div className="live-step">
                <p>
                  ÉTAPE {stepIndex + 1} / {exercise.steps.length}
                </p>
                <h2>{step.title}</h2>
                <p className="instruction">{step.instruction}</p>
                <button className="voice-repeat" disabled={conversationActive || voice.status === "loading"} onClick={speak}>
                  <Volume2 size={19} />
                  {voice.status === "loading" ? "Préparation de la voix…" : voice.status === "playing" ? "Réécouter avec ALI" : "Écouter avec ALI"}
                </button>
                <p className="voice-caption">
                  {conversationActive ? "Terminez votre conversation ALI avant de lire une consigne." : "Voix ALI · lecture à votre demande"}
                </p>
              </div>
              {voice.error && (
                <p role="status" className="voice-error">
                  {voice.error}
                </p>
              )}
              <div className="live-controls">
                <Button
                  variant="secondary"
                  onClick={() => {
                    voice.stop();
                    dispatch({
                      type:
                        session.status === "active"
                          ? "session/pause"
                          : "session/resume",
                      now: Date.now(),
                    });
                    setNow(Date.now());
                  }}
                >
                  {session.status === "active" ? (
                    <Pause size={22} />
                  ) : (
                    <Play size={22} />
                  )}{" "}
                  {session.status === "active" ? "Pause" : "Reprendre"}
                </Button>
                <Button
                  variant="coral"
                  onClick={() => {
                    voice.stop();
                    dispatch({ type: "session/pause", now: Date.now() });
                    setNow(Date.now());
                    setFinish(true);
                  }}
                >
                  <Square size={19} />
                  Terminer
                </Button>
              </div>
              <button
                className="mute-control"
                onClick={() => voice.stop()}
              >
                <VolumeX size={18} />
                Couper la lecture vocale
              </button>
            </>
          ) : (
            <>
              <div className="live-ready-icon">
                <AudioLines size={45} strokeWidth={1.3} />
              </div>
              <h2>
                Du temps pour
                <br />
                vous connecter.
              </h2>
              <p className="live-lead">
                Un parcours clair, à suivre à votre rythme.
                <br />
                Vous décidez quand écouter, faire une pause ou arrêter.
              </p>
              <div className="ready-summary">
                <Clock3 size={19} />
                <span>{exercise.duration} min</span>
                <span className="divider" />
                <span>{exercise.steps.length} étapes guidées</span>
              </div>
              <Button
                variant="coral"
                disabled={!ready || !data.selectedHorseId}
                onClick={start}
              >
                <Play size={20} />
                Commencer la séance
              </Button>
              {(!ready || !data.selectedHorseId) && (
                <p className="live-start-reason" role="status">
                  {!data.selectedHorseId
                    ? "Ajoutez ou sélectionnez un cheval dans « Préparer votre duo »."
                    : "Cochez la confirmation de préparation pour démarrer."}
                </p>
              )}
              <p className="live-footnote">
                Chronomètre sur cet appareil. Le bilan est synchronisé avec votre compte connecté.
                <br />
                Aucune mesure de casque ou d’allure n’est simulée.
              </p>
            </>
          )}
        </section>
        <aside className="live-config card">
          {session ? (
            <>
              <p className="eyebrow">L’INTENTION DU JOUR</p>
              <h2>{exercise.title}</h2>
              <p>{exercise.goal}</p>
              <div className="step-list">
                {exercise.steps.map((s, i) => (
                  <div
                    key={s.title}
                    className={i === stepIndex ? "current" : ""}
                  >
                    <span>{i < stepIndex ? <Check size={16} /> : i + 1}</span>
                    <div>
                      <strong>{s.title}</strong>
                      <small>{Math.round(s.seconds / 60)} min</small>
                    </div>
                  </div>
                ))}
              </div>
              <p className="small muted">
                L’étape affichée suit le temps écoulé. Cela ne prouve pas que
                l’exercice a été réalisé.
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow">AVANT DE MONTER</p>
              <h2>Préparer votre duo</h2>
              <label>
                Votre cheval
                <select
                  value={data.selectedHorseId}
                  onChange={(e) =>
                    dispatch({ type: "horse/select", id: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Sélectionner un cheval
                  </option>
                  {data.horses.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </label>
              <Button variant="ghost" onClick={() => setAdd(true)}>
                + Ajouter un cheval
              </Button>
              <label>
                L’exercice du jour
                <select
                  value={exerciseId}
                  onChange={(e) => setExerciseId(e.target.value)}
                >
                  {exercises.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} · {e.duration} min
                    </option>
                  ))}
                </select>
              </label>
              <Link to={`/coaching/${exerciseId}`} className="text-link">
                Lire le déroulé
                <ArrowRight size={15} />
              </Link>
              <div className="check-ready">
                <label>
                  <input
                    type="checkbox"
                    checked={ready}
                    onChange={(e) => setReady(e.target.checked)}
                  />
                  <span>
                    Je suis dans un espace adapté, avec un équipement vérifié.
                    Cet exercice correspond au niveau de notre couple.
                  </span>
                </label>
              </div>
            </>
          )}
          <div className="equipment-state">
            <BluetoothOff size={22} />
            <div>
              <strong>Casque non connecté</strong>
              <p>Les données de capteurs ne sont pas disponibles.</p>
            </div>
          </div>
          <div className="safety-inline">
            <ShieldCheck size={20} />
            <p>
              En cas de gêne ou de difficulté, interrompez la séance et demandez
              conseil à un professionnel.
            </p>
          </div>
        </aside>
      </div>
      {add && <HorseForm onClose={() => setAdd(false)} />}
      {info && (
        <Dialog title="Le mode téléphone" onClose={() => setInfo(false)}>
          <p>
            Cette version permet de suivre un parcours, de chronométrer votre
            pratique et de rédiger un bilan local. La lecture des consignes
            utilise la voix de votre appareil.
          </p>
          <p>
            Elle n’écoute pas vos réponses et ne mesure pas les allures ou la
            symétrie. Le casque et la conversation vocale ALI seront intégrés et
            testés séparément.
          </p>
          <p>
            Un navigateur peut suspendre l’application en arrière-plan. Gardez
            l’écran disponible pour ce parcours.
          </p>
          <Button onClick={() => setInfo(false)}>Compris</Button>
        </Dialog>
      )}
      {finish && (
        <Dialog title="Votre retour de séance" onClose={() => setFinish(false)}>
          <form className="form-stack" onSubmit={finishSession}>
            <p>
              Décrivez votre expérience. Votre retour ne sera pas présenté comme
              une compétence acquise.
            </p>
            <label>
              Comment s’est passée la pratique ?
              <select name="outcome" required>
                <option value="">Choisir votre ressenti</option>
                <option value="comfortable">À l’aise avec cet exercice</option>
                <option value="repeat">À reprendre tranquillement</option>
                <option value="stop">Séance interrompue / difficulté</option>
              </select>
            </label>
            <label>
              Une observation à retenir
              <textarea
                name="notes"
                rows={4}
                maxLength={2000}
                placeholder="Ce qui a été plus facile, une difficulté, une question pour votre enseignant…"
              />
            </label>
            <Button type="submit">Enregistrer et terminer</Button>
          </form>
        </Dialog>
      )}
    </>
  );
}
