import { useState, type FormEvent } from "react";
import { Compass, MapPin, Search, ShieldCheck, UsersRound } from "lucide-react";
import { Badge, Button, EmptyState } from "../components/ui";
export function Experts() {
  const [specialty, setSpecialty] = useState("Enseignant d’équitation");
  const [location, setLocation] = useState("");
  const [searched, setSearched] = useState(false);
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSearched(true);
  }
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${specialty} ${location}`)}`;
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">BIEN ENTOURÉS POUR ALLER PLUS LOIN</p>
          <h1>
            Les bons experts<span className="greeting-dot">.</span>
          </h1>
          <p>Un regard professionnel pour accompagner votre duo.</p>
        </div>
      </div>
      <section className="expert-hero">
        <div className="expert-hero-text">
          <Badge tone="green">À VOS CÔTÉS</Badge>
          <h2>
            Chaque duo mérite
            <br />
            un accompagnement adapté.
          </h2>
          <p>
            Enseignement, soins, bien-être : trouvez le bon interlocuteur pour
            votre cheval.
          </p>
        </div>
        <div className="expert-orbit" aria-hidden="true">
          <div>
            <UsersRound size={42} strokeWidth={1.2} />
          </div>
          <span />
          <span />
          <span />
        </div>
      </section>
      <form className="card expert-search" onSubmit={search}>
        <label>
          <span>
            <Search size={17} />
            Quel professionnel ?
          </span>
          <select
            value={specialty}
            onChange={(e) => {
              setSpecialty(e.target.value);
              setSearched(false);
            }}
          >
            {[
              "Enseignant d’équitation",
              "Vétérinaire équin",
              "Ostéopathe équin",
              "Maréchal-ferrant",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          <span>
            <MapPin size={17} />
            Où chercher ?
          </span>
          <input
            required
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setSearched(false);
            }}
            maxLength={100}
            placeholder="Ville ou code postal"
          />
        </label>
        <Button type="submit">
          <Search size={18} />
          Rechercher
        </Button>
      </form>
      <section className="card expert-empty">
        <EmptyState
          icon={Compass}
          title={
            searched
              ? `Votre recherche à ${location}`
              : "Un réseau qui se construit"
          }
          action={
            searched ? (
              <a
                href={mapUrl}
                className="button button-secondary"
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir cette recherche sur la carte
                <MapPin size={17} />
              </a>
            ) : undefined
          }
        >
          {searched
            ? `Aucun profil ${specialty.toLowerCase()} avec réservation n’est publié dans cette V2. Vous pouvez poursuivre votre recherche sur Google Maps.`
            : "Aucun professionnel ni créneau n’est encore publié dans cette V2. L’annuaire sera enrichi avec des professionnels et leurs disponibilités."}
        </EmptyState>
      </section>
      <div className="editorial-note">
        <ShieldCheck size={24} />
        <div>
          <h3>La confiance se vérifie</h3>
          <p>
            Les résultats d’une recherche externe ne sont pas vérifiés par
            NewRide. Contrôlez les qualifications et contactez le professionnel
            pour confirmer sa disponibilité. La réservation intégrée fera
            l’objet d’un module distinct.
          </p>
        </div>
      </div>
    </>
  );
}
