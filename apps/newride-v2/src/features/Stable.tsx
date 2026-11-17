import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Clock3,
  Download,
  ChessKnight as Footprints,
  Plus,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useStore, exportLocalData } from "../app/Store";
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  SectionHeading,
} from "../components/ui";
import { HorseForm } from "./HorseForm";
import { durationLabel } from "../lib/model";
export function Stable() {
  const { data, dispatch, storageError } = useStore();
  const [params, setParams] = useSearchParams();
  const [add, setAdd] = useState(false);
  const [reset, setReset] = useState(false);
  const [saved, setSaved] = useState(false);
  const tab = params.get("tab") || "chevaux";
  const tabs = [
    ["chevaux", "Mes chevaux"],
    ["historique", "Mes séances"],
    ["cavalier", "Cavalier & réglages"],
  ];
  function profile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    dispatch({
      type: "profile/update",
      name: String(new FormData(e.currentTarget).get("name") || ""),
    });
    setSaved(true);
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">VOTRE POINT D’ATTACHE</p>
          <h1>
            À l’écurie<span className="greeting-dot">.</span>
          </h1>
          <p>Vos partenaires, votre pratique, vos repères.</p>
        </div>
        <Button onClick={() => setAdd(true)}>
          <Plus size={18} />
          Ajouter un cheval
        </Button>
      </div>
      <div className="page-tabs" aria-label="Sections de l’écurie">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            className={tab === id ? "selected" : ""}
            onClick={() => setParams({ tab: id })}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "chevaux" && (
        <>
          {data.horses.length ? (
            <div className="horse-grid">
              {data.horses.map((h) => (
                <article className="card horse-detail-card" key={h.id}>
                  <div className="horse-detail-top">
                    <span className="horse-avatar">
                      <Footprints size={36} strokeWidth={1.2} />
                    </span>
                    {data.selectedHorseId === h.id && (
                      <Badge tone="green">
                        <Check size={14} />
                        Sélectionné
                      </Badge>
                    )}
                  </div>
                  <h2>{h.name}</h2>
                  <p>
                    {h.breed || "Race non renseignée"}
                    {h.birthYear ? ` · né en ${h.birthYear}` : ""}
                  </p>
                  <div className="horse-stats">
                    <span>
                      <strong>
                        {
                          data.sessions.filter(
                            (s) =>
                              s.horseId === h.id && s.status === "finished",
                          ).length
                        }
                      </strong>{" "}
                      séances dans le carnet
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => dispatch({ type: "horse/select", id: h.id })}
                    disabled={h.id === data.selectedHorseId}
                  >
                    {h.id === data.selectedHorseId
                      ? "Partenaire actuel"
                      : "Choisir ce partenaire"}
                  </Button>
                </article>
              ))}
            </div>
          ) : (
            <section className="card">
              <EmptyState
                icon={Footprints}
                title="Une place pour votre cheval"
                action={
                  <Button onClick={() => setAdd(true)}>
                    <Plus size={18} />
                    Ajouter mon premier cheval
                  </Button>
                }
              >
                Commencez par son nom. Vous pourrez ensuite lui associer vos
                séances et vos observations.
              </EmptyState>
            </section>
          )}
          <div className="editorial-note">
            <ShieldCheck size={23} />
            <div>
              <h3>Chaque cheval a son histoire</h3>
              <p>
                Le carnet de soins et le partage avec les professionnels seront
                ajoutés dans un prochain module. Cette version ne stocke pas de
                documents médicaux.
              </p>
            </div>
          </div>
        </>
      )}
      {tab === "historique" && (
        <>
          <SectionHeading title="Votre historique" />
          <div className="card session-list">
            {data.sessions.length ? (
              data.sessions.map((s) => (
                <Link
                  key={s.id}
                  to={s.status === "finished" ? `/seances/${s.id}` : "/live"}
                  className="journal-row"
                >
                  <span className="journal-date">
                    <strong>{new Date(s.startedAt).getDate()}</strong>
                    {new Date(s.startedAt).toLocaleDateString("fr-FR", {
                      month: "short",
                    })}
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>
                      {s.horseName} ·{" "}
                      {s.status === "finished"
                        ? durationLabel(s.elapsedMs)
                        : "À reprendre"}
                    </p>
                  </div>
                  <Badge tone={s.status === "finished" ? "neutral" : "orange"}>
                    {s.status === "finished" ? "Terminée" : "En cours"}
                  </Badge>
                  <ArrowUpRight size={18} />
                </Link>
              ))
            ) : (
              <EmptyState
                icon={Clock3}
                title="Votre première séance vous attend"
                action={
                  <Link className="button button-primary" to="/live">
                    Préparer une séance
                  </Link>
                }
              >
                Vos séances terminées et vos observations apparaîtront ici.
              </EmptyState>
            )}
          </div>
        </>
      )}
      {tab === "cavalier" && (
        <div className="settings-grid">
          <section className="card settings-card">
            <h2>Votre espace cavalier</h2>
            <form className="form-stack" onSubmit={profile}>
              <label>
                Prénom ou pseudonyme
                <input
                  name="name"
                  defaultValue={data.riderName}
                  maxLength={60}
                  placeholder="Comment vous appeler ?"
                />
              </label>
              <Button type="submit">Enregistrer</Button>
              {saved && (
                <p className="success-text" role="status">
                  <Check size={17} />
                  Profil enregistré sur cet appareil
                </p>
              )}
            </form>
          </section>
          <section className="card settings-card">
            <h2>Vos données vous appartiennent</h2>
            <p>
              Les données de cette V2 sont conservées dans ce navigateur. Elles
              ne sont pas encore synchronisées avec Supabase. Pensez à les
              exporter avant de changer d’appareil.
            </p>
            <div className="form-stack">
              <Button variant="secondary" onClick={() => exportLocalData(data)}>
                <Download size={17} />
                Exporter mon carnet JSON
              </Button>
              {storageError && (
                <Button
                  variant="secondary"
                  onClick={() => exportLocalData(data, true)}
                >
                  Exporter la sauvegarde brute
                </Button>
              )}
              <Button variant="ghost" onClick={() => setReset(true)}>
                <Trash2 size={17} />
                Effacer les données de cette V2
              </Button>
            </div>
          </section>
        </div>
      )}
      {!tabs.some(([id]) => id === tab) && (
        <Link to="/ecurie" className="button button-primary">
          Revenir à mon écurie
        </Link>
      )}
      {add && <HorseForm onClose={() => setAdd(false)} />}
      {reset && (
        <Dialog
          title="Effacer les données locales ?"
          onClose={() => setReset(false)}
        >
          <p>
            Les fiches chevaux et séances de cette V2 seront supprimées de ce
            navigateur. L’application NewRide actuelle n’est pas concernée.
            Exportez d’abord votre carnet si vous souhaitez le conserver.
          </p>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={() => setReset(false)}>
              Conserver
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                dispatch({ type: "reset" });
                setReset(false);
              }}
            >
              Effacer cette V2
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
export function SessionDetail() {
  const { id } = useParams();
  const { data } = useStore();
  const session = data.sessions.find((s) => s.id === id);
  if (!session)
    return (
      <section className="card empty-state">
        <h1>Séance introuvable</h1>
        <p>Elle n’est pas enregistrée sur cet appareil.</p>
        <Link className="button button-primary" to="/ecurie?tab=historique">
          Voir le carnet
        </Link>
      </section>
    );
  const labels = {
    comfortable: "À l’aise avec cet exercice",
    repeat: "À reprendre tranquillement",
    stop: "Interrompue / difficulté",
  };
  return (
    <>
      <Link className="back-link" to="/ecurie?tab=historique">
        <ArrowLeft size={17} />
        Votre carnet
      </Link>
      <div className="page-intro">
        <div>
          <p className="eyebrow">BILAN DE SÉANCE</p>
          <h1>{session.title}</h1>
          <p>
            {session.horseName} ·{" "}
            {new Date(session.startedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge>
          {session.status === "finished"
            ? "Séance terminée"
            : "Séance en cours"}
        </Badge>
      </div>
      <div className="card report-card">
        <div className="report-metric">
          <Clock3 size={23} />
          <strong>{durationLabel(session.elapsedMs)}</strong>
          <span>Temps de pratique enregistré</span>
        </div>
        <hr />
        <h2>Votre retour</h2>
        <Badge tone="green">Déclaration du cavalier</Badge>
        <h3>
          {session.outcome ? labels[session.outcome] : "Pas encore de bilan"}
        </h3>
        <p className="session-notes">
          {session.notes || "Aucune observation ajoutée."}
        </p>
        <div className="safety-note">
          <ShieldCheck size={22} />
          <p>
            Ce bilan conserve votre ressenti. Il ne valide ni une compétence
            acquise ni un résultat biomécanique.
          </p>
        </div>
        <Link to="/live" className="button button-primary">
          Préparer une autre séance
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </>
  );
}
