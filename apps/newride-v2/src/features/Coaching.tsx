import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronRight,
  Clock3,
  Search,
  ShieldCheck,
} from "lucide-react";
import { exercises, scientificSources } from "../content/exercises";
import { ExerciseCard } from "../components/ExerciseCard";
import { ArenaDiagram } from "../components/ArenaDiagram";
import { Badge, Button, SectionHeading } from "../components/ui";
import { useStore } from "../app/Store";
export function Coaching() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tous");
  const { data } = useStore();
  const list = exercises.filter(
    (e) =>
      (filter === "Tous" ||
        (filter === "Favoris" && data.favorites.includes(e.id)) ||
        e.discipline === filter) &&
      `${e.title} ${e.subtitle}`
        .toLocaleLowerCase("fr")
        .includes(query.toLocaleLowerCase("fr")),
  );
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">LE BON EXERCICE, AU BON MOMENT</p>
          <h1>
            Votre coaching<span className="greeting-dot">.</span>
          </h1>
          <p>Préparer. Pratiquer. Observer. Recommencer.</p>
        </div>
        <Badge tone="green">Cavalier + cheval</Badge>
      </div>
      <div className="coaching-banner">
        <div>
          <Badge>LES FONDAMENTAUX</Badge>
          <h2>
            Progresser commence
            <br />
            par une intention simple.
          </h2>
          <p>
            Un petit catalogue pour explorer la régularité, les transitions et
            la direction au pas.
          </p>
        </div>
        <ArenaDiagram />
      </div>
      <div className="library-toolbar">
        <label className="search-field">
          <Search size={19} />
          <input
            aria-label="Rechercher un exercice"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Quel objectif aujourd’hui ?"
          />
        </label>
        <div className="filter-tabs" aria-label="Filtrer les exercices">
          {["Tous", "Fondamentaux", "Dressage", "Favoris"].map((f) => (
            <button
              key={f}
              className={filter === f ? "selected" : ""}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "Favoris" && <Bookmark size={14} />} {f}
            </button>
          ))}
        </div>
      </div>
      <div className="exercise-grid library-grid">
        {list.map((e) => (
          <ExerciseCard key={e.id} exercise={e} />
        ))}
      </div>
      {list.length === 0 && (
        <div className="card empty-state">
          <h3>Aucun exercice dans cette sélection</h3>
          <p>Essayez un autre objectif ou explorez tous les fondamentaux.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setQuery("");
              setFilter("Tous");
            }}
          >
            Voir tous les exercices
          </Button>
        </div>
      )}
      <div className="editorial-note">
        <ShieldCheck size={22} />
        <div>
          <h3>Une pratique adaptée à votre duo</h3>
          <p>
            Ces parcours guidés ne remplacent pas l’observation d’un enseignant.
            Adaptez la séance à votre niveau, à votre cheval et aux conditions
            du jour.
          </p>
          <Link to="/sources" className="text-link">
            Consulter les références
            <ChevronRight size={15} />
          </Link>
        </div>
      </div>
    </>
  );
}
export function ExerciseDetail() {
  const { id } = useParams();
  const exercise = exercises.find((e) => e.id === id);
  const { data, dispatch } = useStore();
  if (!exercise)
    return (
      <div className="card empty-state">
        <h1>Exercice introuvable</h1>
        <Link to="/coaching" className="button button-primary">
          Explorer les exercices
        </Link>
      </div>
    );
  const favorite = data.favorites.includes(exercise.id);
  return (
    <>
      <Link to="/exercices" className="back-link">
        <ArrowLeft size={17} />
        Bibliothèque d’exercices
      </Link>
      <div className="detail-header">
        <div>
          <p className="eyebrow">{exercise.discipline}</p>
          <h1>{exercise.title}</h1>
          <p>{exercise.subtitle}</p>
        </div>
        <Button
          variant="secondary"
          aria-pressed={favorite}
          onClick={() => dispatch({ type: "favorite/toggle", id: exercise.id })}
        >
          <Bookmark size={18} fill={favorite ? "currentColor" : "none"} />
          {favorite ? "Enregistré" : "Enregistrer"}
        </Button>
      </div>
      <div className="detail-grid">
        <div>
          <div className="detail-art">
            <ArenaDiagram variant={exercise.diagram} />
            <div className="detail-art-meta">
              <Badge tone="green">{exercise.level}</Badge>
              <span>
                <Clock3 size={16} />
                {exercise.duration} minutes
              </span>
            </div>
          </div>
          <section className="card detail-body">
            <h2>L’intention de la séance</h2>
            <p>{exercise.goal}</p>
            <h3>Avant de commencer</h3>
            <p>{exercise.prerequisite}</p>
            <h3>Ce que vous allez observer</h3>
            <p>{exercise.observation}</p>
            <div className="safety-note">
              <ShieldCheck size={22} />
              <p>{exercise.stop}</p>
            </div>
            <details>
              <summary>Références & limites</summary>
              <p>
                Parcours éditorial proposé, à faire relire par un enseignant
                avant validation pédagogique. Les durées sont des repères
                adaptables, pas un protocole scientifique validé.
              </p>
              <ul>
                {exercise.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <Link to="/sources">Voir les sources</Link>
            </details>
          </section>
        </div>
        <aside className="card step-plan">
          <p className="eyebrow">VOTRE DÉROULÉ</p>
          <h2>{exercise.steps.length} temps pour pratiquer</h2>
          <ol>
            {exercise.steps.map((step, i) => (
              <li key={step.title}>
                <span>{(i + 1).toString().padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>
                    {Math.round(step.seconds / 60)} min ·{" "}
                    {i === 0
                      ? "Préparation"
                      : i === exercise.steps.length - 1
                        ? "Retour au calme"
                        : "Pratique"}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <Link
            className="button button-primary"
            to={`/seance-guidee?exercice=${exercise.id}`}
          >
            Préparer cette séance
            <ArrowRight size={18} />
          </Link>
          <p className="small muted">
            Vous gardez la main : pause, répétition ou arrêt à tout moment.
          </p>
        </aside>
      </div>
    </>
  );
}
export function Sources() {
  return (
    <>
      <Link to="/exercices" className="back-link">
        <ArrowLeft size={17} />
        Coaching
      </Link>
      <div className="page-intro">
        <div>
          <p className="eyebrow">LA TRANSPARENCE AU CŒUR D’ALI</p>
          <h1>Nos repères scientifiques.</h1>
          <p>Des références pour éclairer la conception, avec leurs limites.</p>
        </div>
      </div>
      <div className="card source-list">
        {scientificSources.map((s) => (
          <article key={s.url}>
            <p className="eyebrow">{s.publisher}</p>
            <h2>{s.title}</h2>
            <p>{s.detail}</p>
            <a
              href={s.url}
              target="_blank"
              rel="noreferrer"
              className="text-link"
            >
              Consulter la publication
              <ChevronRight size={16} />
            </a>
          </article>
        ))}
      </div>
      <div className="editorial-note">
        <Check size={24} />
        <p>
          Aucun résultat scientifique présenté ici ne certifie les performances
          de NewRide. Les synthèses ne constituent ni un diagnostic ni une
          prescription. Le corpus étendu de travail comporte des fiches en
          attente de revue ; elles ne sont pas toutes utilisées dans ces
          parcours.
        </p>
      </div>
    </>
  );
}
