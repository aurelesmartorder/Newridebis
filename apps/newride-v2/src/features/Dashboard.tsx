import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Bluetooth,
  CalendarDays,
  ChevronRight,
  Clock3,
  Flower2,
  ChessKnight as Footprints,
  Plus,
  Sparkles,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useStore } from "../app/Store";
import { exercises } from "../content/exercises";
import { ArenaDiagram } from "../components/ArenaDiagram";
import { ExerciseCard } from "../components/ExerciseCard";
import { Badge, Button, SectionHeading, TextLink } from "../components/ui";
import { HorseForm } from "./HorseForm";
import { durationLabel } from "../lib/model";
export function Dashboard() {
  const { data } = useStore();
  const [add, setAdd] = useState(false);
  const horse = data.horses.find((h) => h.id === data.selectedHorseId);
  const finished = data.sessions.filter((s) => s.status === "finished");
  const total = finished.reduce((sum, s) => sum + s.elapsedMs, 0);
  const recent = finished[0];
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">LE PLAISIR DE PROGRESSER, ENSEMBLE</p>
          <h1>
            Bonjour{data.riderName ? ` ${data.riderName}` : ""}
            <span className="greeting-dot">.</span>
          </h1>
          <p>Un peu plus de connexion. Une belle séance à la fois.</p>
        </div>
        <Link to="/live" className="button button-primary desktop-cta">
          <Plus size={18} />
          Nouvelle séance
        </Link>
      </div>
      <div className="dashboard-grid">
        <div className="main-column">
          <section className="hero-card">
            <img
              src="/equestrian-arena.webp"
              alt="Cavalier et cheval dans une carrière ensoleillée"
              fetchPriority="high"
            />
            <div className="hero-shade" />
            <div className="hero-content">
              <span className="hero-eyebrow">
                <span /> VOTRE PROCHAINE SÉANCE
              </span>
              <h2>
                À l’écoute de
                <br />
                votre cheval.
              </h2>
              <p>
                Un objectif clair. Des consignes simples.
                <br />
                Du temps pour ressentir.
              </p>
              <Link
                className="button button-light"
                to="/coaching/rythme-au-pas"
              >
                Préparer ma séance
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <span className="hero-caption">LE COUPLE AU CŒUR DU COACHING</span>
          </section>
          <div className="summary-grid">
            <div className="summary-card">
              <span className="metric-icon">
                <CalendarDays size={19} />
              </span>
              <span className="metric-value">
                {finished.length.toString().padStart(2, "0")}
                <small>séances</small>
              </span>
              <p>Dans votre carnet</p>
            </div>
            <div className="summary-card">
              <span className="metric-icon">
                <Timer size={19} />
              </span>
              <span className="metric-value">
                {Math.floor(total / 60000)}
                <small>min</small>
              </span>
              <p>Temps de pratique déclaré</p>
            </div>
            <Link className="summary-card summary-link" to="/ecurie">
              <span className="metric-icon">
                <Footprints size={19} />
              </span>
              <span className="metric-value">
                {data.horses.length.toString().padStart(2, "0")}
                <small>{data.horses.length > 1 ? "chevaux" : "cheval"}</small>
              </span>
              <p>
                Dans votre écurie <ArrowUpRight size={14} />
              </p>
            </Link>
          </div>
          <section>
            <SectionHeading title="Un objectif, un exercice" eyebrow="COACHING">
              <TextLink to="/coaching">Tout explorer</TextLink>
            </SectionHeading>
            <div className="exercise-grid">
              {exercises.slice(0, 2).map((e) => (
                <ExerciseCard key={e.id} exercise={e} />
              ))}
            </div>
          </section>
          <section className="journal-section">
            <SectionHeading
              title="Votre carnet de séances"
              eyebrow="LE FIL DE VOTRE PRATIQUE"
            >
              <TextLink to="/ecurie?tab=historique">Voir le carnet</TextLink>
            </SectionHeading>
            {recent ? (
              <Link to={`/seances/${recent.id}`} className="journal-row">
                <span className="journal-date">
                  <strong>{new Date(recent.startedAt).getDate()}</strong>
                  {new Date(recent.startedAt).toLocaleDateString("fr-FR", {
                    month: "short",
                  })}
                </span>
                <div>
                  <h3>{recent.title}</h3>
                  <p>
                    {recent.horseName} · {durationLabel(recent.elapsedMs)} ·
                    Retour du cavalier
                  </p>
                </div>
                <ChevronRight size={20} />
              </Link>
            ) : (
              <div className="journal-empty">
                <span className="journal-line">
                  <TrendingUp size={24} />
                </span>
                <div>
                  <h3>Votre histoire commence ici</h3>
                  <p>Votre première séance apparaîtra dans ce carnet.</p>
                </div>
                <Link
                  to="/live"
                  className="icon-link"
                  aria-label="Préparer ma première séance"
                >
                  <ArrowRight size={20} />
                </Link>
              </div>
            )}
          </section>
        </div>
        <aside className="side-column">
          <section className="card horse-widget">
            <div className="widget-title">
              <h2>Votre partenaire</h2>
              <Link
                to="/ecurie"
                className="icon-link"
                aria-label="Voir mon écurie"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="horse-avatar">
              <Footprints size={34} strokeWidth={1.3} />
            </div>
            <h3>{horse?.name || "Un duo à construire"}</h3>
            <p>{horse?.breed || "Le début d’une belle connexion"}</p>
            {horse ? (
              <Badge tone="green">Cheval sélectionné</Badge>
            ) : (
              <Button variant="secondary" onClick={() => setAdd(true)}>
                <Plus size={17} />
                Ajouter mon cheval
              </Button>
            )}
          </section>
          <section className="ali-widget">
            <div className="ali-mark">
              <AudioLines size={22} />
              <span>
                ALI <small>VOTRE GUIDE</small>
              </span>
              <Sparkles size={16} />
            </div>
            <h3>
              Moins de consignes.
              <br />
              Plus de sensations.
            </h3>
            <p>
              Préparez un exercice, pratiquez à votre rythme et prenez le temps
              d’observer.
            </p>
            <Link to="/coaching" className="text-link">
              Découvrir le coaching
              <ArrowRight size={17} />
            </Link>
            <div className="ali-arena">
              <ArenaDiagram />
            </div>
          </section>
          <Link to="/live" className="helmet-widget">
            <span className="helmet-icon">
              <Bluetooth size={22} />
            </span>
            <div>
              <h3>Votre équipement</h3>
              <p>Aucun casque connecté</p>
            </div>
            <ChevronRight size={18} />
          </Link>
          <div className="gentle-note">
            <Flower2 size={23} strokeWidth={1.4} />
            <p>
              La progression se construit
              <br />
              dans le respect de votre cheval.
            </p>
          </div>
        </aside>
      </div>
      {add && <HorseForm onClose={() => setAdd(false)} />}
    </>
  );
}
