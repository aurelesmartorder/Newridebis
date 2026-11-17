import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { distance } from "../../lib/guestRide";
import { Header, Empty, clock } from "./shared";
import type { WorkspaceModel } from "./model";
export function PerformancePage({ model }: { model: WorkspaceModel }) {
  const { gps, localSessions } = model;
  return (
    <>
      <Header
        number="PERFORMANCES / VOTRE CARNET"
        title="LA PROGRESSION SE CONSTRUIT."
        description="Vos séances, votre ressenti et votre régularité, au fil du temps."
      />
      <div className="studio-metrics wide">
        <div>
          <strong>{localSessions.length}</strong>
          <span>Séances guidées sur cet appareil</span>
        </div>
        <div>
          <strong>
            {Math.round(
              localSessions.reduce((sum, s) => sum + s.elapsedMs, 0) / 60000,
            )}
            <small> min</small>
          </strong>
          <span>Temps de pratique enregistré</span>
        </div>
        <div>
          <strong>{gps.rides.length}</strong>
          <span>Sorties GPS conservées</span>
        </div>
      </div>
      {!localSessions.length && !gps.rides.length ? (
        <Empty
          title="VOTRE PROCHAINE SÉANCE COMPTE."
          text="Vos séances terminées apparaîtront ici, avec leur durée et votre ressenti."
          link="/live"
          label="Préparer une première séance"
        />
      ) : (
        <div className="studio-session-list">
          {localSessions.map((s) => (
            <Link key={s.id} to={"/seances/" + s.id}>
              <div>
                <span>SÉANCE GUIDÉE</span>
                <h2>{s.title}</h2>
                <p>{s.horseName}</p>
              </div>
              <strong>{clock(Math.floor(s.elapsedMs / 1000))}</strong>
              <ArrowUpRight />
            </Link>
          ))}
          {gps.rides.map((r) => (
            <article key={r.id}>
              <div>
                <span>SORTIE GPS / TÉLÉPHONE</span>
                <h2>{new Date(r.startedAt).toLocaleDateString("fr-FR")}</h2>
              </div>
              <strong>{(r.distance / 1000).toFixed(2)} km</strong>
              <Link to="/carte">
                Voir le tracé <ArrowUpRight size={18} />
              </Link>
            </article>
          ))}
        </div>
      )}
      <Link className="studio-text-link" to="/exercices">
        Trouver votre prochaine intention <ArrowRight size={18} />
      </Link>
    </>
  );
}
