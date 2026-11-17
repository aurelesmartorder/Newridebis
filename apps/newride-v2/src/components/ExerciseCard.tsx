import { ArrowUpRight, Bookmark, Clock3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useStore } from "../app/Store";
import type { Exercise } from "../content/exercises";
import { ArenaDiagram } from "./ArenaDiagram";
export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const { data, dispatch } = useStore();
  const favorite = data.favorites.includes(exercise.id);
  return (
    <article className="exercise-card">
      <Link className="exercise-art" to={`/coaching/${exercise.id}`}>
        <ArenaDiagram variant={exercise.diagram} compact />
        <span className="art-label">{exercise.discipline}</span>
      </Link>
      <div className="exercise-copy">
        <div className="exercise-meta">
          <span>{exercise.level}</span>
          <button
            className="icon-button bookmark"
            aria-label={`${favorite ? "Retirer" : "Ajouter"} ${exercise.title} ${favorite ? "des" : "aux"} favoris`}
            aria-pressed={favorite}
            onClick={() =>
              dispatch({ type: "favorite/toggle", id: exercise.id })
            }
          >
            <Bookmark size={19} fill={favorite ? "currentColor" : "none"} />
          </button>
        </div>
        <Link to={`/coaching/${exercise.id}`} className="exercise-title">
          {exercise.title}
        </Link>
        <p>{exercise.subtitle}</p>
        <div className="exercise-bottom">
          <span>
            <Clock3 size={14} />
            {exercise.duration} min
          </span>
          <Link
            className="icon-link"
            aria-label={`Voir l’exercice ${exercise.title}`}
            to={`/coaching/${exercise.id}`}
          >
            <ArrowUpRight size={19} />
          </Link>
        </div>
      </div>
    </article>
  );
}
