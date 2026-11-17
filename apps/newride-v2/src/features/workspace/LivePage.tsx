import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Radio, Square } from "lucide-react";

import { distance } from "../../lib/guestRide";
import { Header, clock, Trace } from "./shared";
import type { WorkspaceModel } from "./model";
export function LivePage({ model }: { model: WorkspaceModel }) {
  const { state, gps, section } = model;
  return (
    <>
      <Header
        number="LIVE / VOTRE SÉANCE"
        title="EN SELLE. ENSEMBLE."
        description="Choisissez votre partenaire, une intention, et prenez le temps de pratiquer."
      />
      <nav className="studio-segments" aria-label="Espaces Live">
        <Link to="/live" aria-current="page">
          Ma séance
        </Link>
        <Link to="/casque">
          Je connecte mon casque <ArrowRight size={15} />
        </Link>
        <Link to="/performances">Performances</Link>
        <Link to="/carte">Carte</Link>
      </nav>
      <div className="studio-live-hero">
        <img src="/photos/trail.webp" alt="Cavalier et cheval en forêt" />
        <div>
          <span className="ride-kicker">VOTRE PROCHAINE SÉANCE</span>
          <h2>
            MOINS DE BRUIT.
            <br />
            PLUS DE SENSATIONS.
          </h2>
          <p>
            Un déroulé guidé, un chronomètre et votre retour de séance.
            Accessible sans compte.
          </p>
          <Link className="studio-primary" to="/seance-guidee">
            Préparer ma séance <ArrowRight size={18} />
          </Link>
        </div>
      </div>
      <div className="studio-two">
        <section className="studio-panel">
          <span className="ride-kicker">SORTIE / GPS DU TÉLÉPHONE</span>
          <h2>Votre parcours, réellement.</h2>
          <p>
            Le tracé utilise la localisation de votre téléphone. Aucune allure,
            symétrie ou donnée de casque n’en est déduite.
          </p>
          <div className="studio-metrics">
            <div>
              <strong>{clock(gps.seconds)}</strong>
              <span>Durée écoulée</span>
            </div>
            <div>
              <strong>
                {(distance(gps.points) / 1000).toFixed(2)}
                <small> km</small>
              </strong>
              <span>Distance GPS estimée</span>
            </div>
          </div>
          <button
            className="studio-dark"
            onClick={gps.started ? gps.stop : gps.start}
          >
            {gps.started ? <Square size={17} /> : <MapPin size={18} />}{" "}
            {gps.started ? "Terminer et conserver" : "Démarrer le GPS"}
          </button>
          {gps.error && <p role="status">{gps.error}</p>}
          <small>
            Enregistrement local. Gardez l’application ouverte ; aucun suivi en
            arrière-plan n’est garanti.
          </small>
          <Trace points={gps.points} />
        </section>
        <section className="studio-panel studio-hardware">
          <Radio size={28} strokeWidth={1.2} />
          <span className="ride-kicker">LE CASQUE CONNECTÉ</span>
          <h2>Le duo reste au centre.</h2>
          <p>
            Aucun casque n’est connecté. Batterie, symétrie, allures et alertes
            de chute ne sont pas disponibles sans appareil et protocole validés.
          </p>
          <span className="hardware-state">Capteurs non connectés</span>
          <Link className="studio-text-link" to="/casque">
            Je connecte mon casque <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </>
  );
}
