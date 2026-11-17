import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { distance } from "../../lib/guestRide";
import { Header, Trace } from "./shared";
import type { WorkspaceModel } from "./model";
export function MapPage({ model }: { model: WorkspaceModel }) {
  const { gps, selected, setSelected } = model;
  return (
    <>
      <Header
        number="EXPLORER / VOS TRACÉS"
        title="PRENEZ UN AUTRE CHEMIN."
        description="Les parcours enregistrés avec le GPS de votre téléphone, conservés sur cet appareil."
      />
      <div className="studio-map-layout">
        <aside className="studio-panel">
          <span className="ride-kicker">VOS SORTIES</span>
          {gps.rides.length ? (
            <>
              <label htmlFor="ride-choice">Choisir un parcours</label>
              <select
                id="ride-choice"
                value={selected || gps.rides[0].id}
                onChange={(e) => setSelected(e.target.value)}
              >
                {gps.rides.map((r) => (
                  <option value={r.id} key={r.id}>
                    {new Date(r.startedAt).toLocaleString("fr-FR")} ·{" "}
                    {(r.distance / 1000).toFixed(2)} km
                  </option>
                ))}
              </select>
              <button
                className="studio-text-link"
                onClick={() => {
                  const ride =
                    gps.rides.find((r) => r.id === selected) || gps.rides[0];
                  const blob = new Blob([JSON.stringify(ride, null, 2)], {
                    type: "application/json",
                  });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = "newride-trace-" + ride.id + ".json";
                  link.click();
                  URL.revokeObjectURL(link.href);
                }}
              >
                Exporter ce parcours <ArrowUpRight size={18} />
              </button>
            </>
          ) : (
            <p>Aucun parcours enregistré pour le moment.</p>
          )}
          <Link className="studio-dark" to="/live">
            Préparer une sortie <ArrowRight size={17} />
          </Link>
        </aside>
        <div className="studio-map">
          <span>TRACÉ GPS / SANS FOND DE CARTE</span>
          <Trace
            points={
              (gps.rides.find((r) => r.id === selected) || gps.rides[0])
                ?.points || []
            }
          />
          <small>
            Les positions reflètent la précision du téléphone. Ce tracé ne
            définit pas un chemin praticable ou autorisé.
          </small>
        </div>
      </div>
    </>
  );
}
