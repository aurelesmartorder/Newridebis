import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  AudioLines,
  Compass,
  MapPin,
  Play,
  Plus,
  Radio,
  UsersRound,
  ChartNoAxesCombined,
} from "lucide-react";
import { useStore } from "../app/Store";
import { durationLabel } from "../lib/model";
const shortcuts = [
  { to: "/live", Icon: Radio, title: "Live", subtitle: "Votre séance" },
  {
    to: "/performances",
    Icon: ChartNoAxesCombined,
    title: "Perfs",
    subtitle: "Votre historique",
  },
  { to: "/carte", Icon: MapPin, title: "Carte", subtitle: "Vos tracés" },
  {
    to: "/discover",
    Icon: Compass,
    title: "Discover",
    subtitle: "La communauté",
  },
  {
    to: "/coaching",
    Icon: AudioLines,
    title: "Coach ALI",
    subtitle: "Voix & leçons",
  },
  { to: "/pro", Icon: UsersRound, title: "Pro", subtitle: "Votre entourage" },
];
export function Dashboard() {
  const { data } = useStore();
  const horse = data.horses.find((h) => h.id === data.selectedHorseId);
  const recent = data.sessions.find((s) => s.status === "finished");
  return (
    <div className="ride-home">
      <header className="ride-home-intro">
        <div>
          <span className="ride-kicker">VOTRE QUOTIDIEN ÉQUESTRE</span>
          <h1>
            {data.riderName
              ? `Bonjour, ${data.riderName}.`
              : "Le bon endroit pour se retrouver."}
          </h1>
        </div>
        <Link
          to="/live"
          className="ride-small-action"
          aria-label="Nouvelle séance"
        >
          <Plus size={18} />
          <span>Nouvelle séance</span>
        </Link>
      </header>
      <div className="ride-cover-grid">
        <section className="ride-cover">
          <img
            src="/photos/portrait.webp"
            alt="Portrait rapproché d’un cheval gris à l’entrée d’une écurie"
            fetchPriority="high"
          />
          <div className="ride-cover-shade" />
          <span className="ride-cover-edition">
            NEWRIDE / L’ÉQUITATION EN CONNEXION
          </span>
          <div className="ride-cover-copy">
            <span className="ride-kicker light">
              <span />
              LE DUO AVANT LA PERFORMANCE
            </span>
            <h2>
              JUSTE VOUS.
              <br />
              VOTRE
              <br />
              <em>CHEVAL.</em>
            </h2>
            <p>
              Écoutez. Ressentez. Avancez ensemble.
              <br />
              Votre prochaine séance commence ici.
            </p>
            <Link to="/live" className="ride-cover-cta">
              C’est parti
              <ArrowUpRight size={22} />
            </Link>
          </div>
          <div className="ride-cover-bottom">
            <span>01 / EN SELLE</span>
            <span>LA CONNEXION CHANGE TOUT.</span>
          </div>
        </section>
        <aside className="ride-side">
          <Link className="ride-ali-card" to="/ali/conversation">
            <div className="ride-ali-head">
              <span className="ride-audio-icon">
                <AudioLines size={24} />
              </span>
              <span>
                ALI
                <br />
                <small>VOTRE COACH VOCAL</small>
              </span>
              <ArrowUpRight size={21} />
            </div>
            <h2>
              UNE QUESTION.
              <br />
              UNE CONVERSATION.
              <br />
              <em>UN DÉCLIC.</em>
            </h2>
            <p>
              Parlez de votre pratique, posez vos questions et approfondissez
              avec ALI.
            </p>
            <div className="ride-ali-bottom">
              <span>Parler avec ALI</span>
              <span>
                <Play size={17} fill="currentColor" />
              </span>
            </div>
          </Link>
          <Link className="ride-partner-card" to="/ecurie">
            <div className="ride-partner-photo">
              <img src="/photos/trail.webp" alt="" loading="lazy" />
            </div>
            <div>
              <span className="ride-kicker">VOTRE PARTENAIRE</span>
              <h3>{horse?.name || "Chaque duo a son histoire."}</h3>
              <p>
                {horse
                  ? "Ouvrir votre écurie V2"
                  : "Ajouter votre premier cheval"}
              </p>
            </div>
            <ArrowUpRight size={19} />
          </Link>
        </aside>
      </div>
      <nav
        className="ride-action-strip"
        aria-label="Tous les espaces NewRidebis"
      >
        {shortcuts.map(({ to, Icon, title, subtitle }) => (
          <Link key={to} to={to}>
            <Icon size={23} strokeWidth={1.5} />
            <div>
              <strong>{title}</strong>
              <small>{subtitle}</small>
            </div>
            <ArrowUpRight size={15} />
          </Link>
        ))}
      </nav>
      <section className="ride-explore">
        <div className="ride-section-heading">
          <div>
            <span className="ride-kicker">
              À CHAQUE ENVIE, UNE FAÇON D’AVANCER
            </span>
            <h2>
              FAITES DE LA PLACE
              <br />À VOTRE <em>ÉQUITATION.</em>
            </h2>
          </div>
          <Link to="/lecons">
            Toutes les leçons
            <ArrowRight size={18} />
          </Link>
        </div>
        <div className="ride-story-grid">
          <Link className="ride-story" to="/lecons">
            <img
              src="/equestrian-arena.webp"
              alt="Cavalier à cheval dans une carrière au soleil"
              loading="lazy"
            />
            <span className="ride-story-index">01 — APPRENDRE</span>
            <div>
              <span>50 SUJETS · 8 CATÉGORIES</span>
              <h3>
                LE BON DÉCLIC,
                <br />
                AU BON MOMENT.
              </h3>
              <p>
                Position, confiance, contact, obstacle…
                <br />
                Explorez les questions de cavaliers.
              </p>
              <span className="ride-round-arrow">
                <ArrowUpRight size={23} />
              </span>
            </div>
          </Link>
          <Link className="ride-story" to="/discover?rubrique=routes">
            <img
              src="/photos/trail.webp"
              alt="Cavalier casqué et cheval sur un sentier forestier"
              loading="lazy"
            />
            <span className="ride-story-index">02 — EXPLORER</span>
            <div>
              <span>CARTE & BALADES</span>
              <h3>
                CHANGEZ
                <br />
                DE PERSPECTIVE.
              </h3>
              <p>
                Retrouvez les tracés, les balades
                <br />
                et l’exploration de NewRidebis.
              </p>
              <span className="ride-round-arrow">
                <ArrowUpRight size={23} />
              </span>
            </div>
          </Link>
          <Link className="ride-story" to="/discover?rubrique=social">
            <img
              src="/photos/landscape.webp"
              alt="Deux personnes avec leurs chevaux devant des montagnes"
              loading="lazy"
            />
            <span className="ride-story-index">03 — PARTAGER</span>
            <div>
              <span>LA COMMUNAUTÉ NEWRIDE</span>
              <h3>
                L’ÉQUITATION
                <br />
                SE VIT AUSSI À PLUSIEURS.
              </h3>
              <p>
                Vos photos, vos moments,
                <br />
                les cavaliers qui vous entourent.
              </p>
              <span className="ride-round-arrow">
                <ArrowUpRight size={23} />
              </span>
            </div>
          </Link>
        </div>
      </section>
      <div className="ride-journal-row">
        <div className="ride-journal-number">
          NR<span>RIDE NOTES</span>
        </div>
        <div>
          <span className="ride-kicker">VOTRE CARNET LOCAL V2</span>
          <h2>{recent ? recent.title : "La prochaine page est à vous."}</h2>
          <p>
            {recent
              ? `${recent.horseName} · ${durationLabel(recent.elapsedMs)} · Retour déclaré`
              : "Gardez une observation, un ressenti, une question à partager avec votre enseignant."}
          </p>
        </div>
        <Link to={recent ? `/seances/${recent.id}` : "/seance-guidee"}>
          {recent ? "Voir le bilan" : "Essayer un parcours guidé"}
          <ArrowRight size={18} />
        </Link>
      </div>
      <p className="ride-photo-note">
        Photographies d’illustration · Varvara Stesina, Valentin Zickner, Chinh
        Le Duc et YASU SHOTS / Unsplash. Les personnes photographiées ne sont
        pas présentées comme des utilisateurs ou partenaires NewRide.
      </p>
    </div>
  );
}
