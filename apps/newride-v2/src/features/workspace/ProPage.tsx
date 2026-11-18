import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Plus, Users } from "lucide-react";

import { Header } from "./shared";
import type { WorkspaceModel } from "./model";
export function ProPage({ model }: { model: WorkspaceModel }) {
  const { setNotice, contact, setContact, contacts, setContacts, section } =
    model;
  return (
    <>
      <Header
        number="VOTRE ENTOURAGE / PROFESSIONNELS"
        title="BIEN ENTOURÉS. PLUS LOIN."
        description="Votre enseignant, les professionnels de santé et les personnes qui accompagnent votre duo."
      />
      <div className="studio-two">
        <section className="studio-panel">
          <Users size={28} strokeWidth={1.2} />
          <h2>Votre carnet de contacts.</h2>
          <p>
            Un nom ou des coordonnées à garder sur cet appareil. Aucun message
            ni rendez-vous n’est envoyé.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!contact.trim()) return;
              const next = [...contacts, contact.trim()];
              try {
                localStorage.setItem(
                  "newride.v2.contacts",
                  JSON.stringify(next),
                );
                setContacts(next);
                setContact("");
              } catch {
                setNotice("Le contact n’a pas pu être conservé.");
              }
            }}
          >
            <label htmlFor="pro-contact">Nom et coordonnées</label>
            <input
              id="pro-contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={500}
              placeholder="Votre enseignant, votre vétérinaire…"
            />
            <button className="studio-dark" disabled={!contact.trim()}>
              <Plus size={18} />
              Ajouter au carnet
            </button>
          </form>
          {contacts.map((item, i) => (
            <p className="contact-entry" key={i}>
              {item}
            </p>
          ))}
        </section>
        <section className="studio-panel studio-learn">
          <span className="ride-kicker">LE BON PROFESSIONNEL</span>
          <h2>La confiance se vérifie.</h2>
          <p>
            Recherchez un enseignant, un vétérinaire, un ostéopathe ou un
            maréchal. Les disponibilités et les réservations sont à confirmer
            directement avec le professionnel.
          </p>
          <Link className="studio-dark" to="/experts">
            Rechercher <ArrowUpRight size={18} />
          </Link>
          <Link className="studio-text-link" to="/performances">
            Préparer votre bilan de séances <ArrowRight size={18} />
          </Link>
        </section>
      </div>
    </>
  );
}
