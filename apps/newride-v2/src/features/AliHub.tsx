import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  ChevronRight,
  Search,
  Video,
  CalendarDays,
  Brain,
  MessageCircle,
} from "lucide-react";
import categories from "../content/lessons.json";
import { Badge, SectionHeading } from "../components/ui";
const displayTitles: Record<string, string> = {
  "Le geste que 9 selles sur 10 ratent":
    "Seller et sangler : les points à vérifier",
  "Le point d'eau : le facteur de risque numéro un":
    "Aborder un passage d’eau en cross",
  "Le repère qui distingue un cavalier confirmé au saut":
    "Les repères du cavalier à l’obstacle",
  "Ton cheval de CSO est-il plus à risque de boiterie ? Ce qu'une étude sur 73 chevaux révèle":
    "CSO : comprendre les études sur la locomotion",
  "Un bilan de 5 minutes sans monter, qui en dit long sur ta progression":
    "Préparer un bilan hors cheval",
};
function label(topic: string) {
  return (
    displayTitles[topic] ||
    topic
      .replace(/ce que prouve la science/gi, "repères et limites des études")
      .replace(/le vrai secret/gi, "le rôle")
      .replace(
        /les vraies causes, dans l’ordre de fréquence/gi,
        "les causes possibles",
      )
      .replace(/ce qui prédit vraiment/gi, "les facteurs associés à")
      .replace(/ce qui marche vraiment/gi, "des pistes à adapter")
      .replace(
        /ce que la science dit vraiment/gi,
        "ce que les études explorent",
      )
  );
}
export function AliHub() {
  const cards = [
    [
      "/ali/conversation",
      AudioLines,
      "Parler avec ALI",
      "Conversation vocale interactive : poser une question, interrompre et approfondir.",
    ],
    [
      "/lecons",
      BookOpen,
      "Leçons & questions",
      "Les 50 sujets du catalogue NewRidebis, classés par discipline.",
    ],
    [
      "/ali",
      CalendarDays,
      "Programme & séance",
      "Retrouver la préparation, le programme et les commandes du coach.",
    ],
    [
      "/ali",
      Brain,
      "Mémoire & progression",
      "Notes, historique et observations du coaching NewRidebis.",
    ],
    [
      "/ali",
      Video,
      "Analyse vidéo",
      "Accéder à l’analyse de séquences disponible dans NewRidebis.",
    ],
    [
      "/exercices",
      MessageCircle,
      "Exercices guidés V2",
      "Trois parcours chronométrés locaux, distincts de la conversation vocale.",
    ],
  ] as const;
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">VOTRE COACHING, À VOTRE RYTHME</p>
          <h1>Retrouvez votre coach ALI.</h1>
          <p>
            Conversation, leçons, questions et suivi : choisissez votre façon de
            progresser.
          </p>
        </div>
      </div>
      <Link className="ali-hero-action" to="/ali/conversation">
        <span className="ali-hero-icon">
          <AudioLines size={36} />
        </span>
        <div>
          <Badge>COACH VOCAL INTERACTIF</Badge>
          <h2>Une question ? Parlons-en.</h2>
          <p>
            Ouvrez la conversation ALI. Votre compte NewRidebis est nécessaire
            pour activer la voix.
          </p>
        </div>
        <ArrowRight size={24} />
      </Link>
      <div className="ali-feature-grid">
        {cards.map(([to, Icon, title, description]) => (
          <Link className="card ali-feature" to={to} key={title}>
            <Icon size={25} />
            <h2>{title}</h2>
            <p>{description}</p>
            <span>
              Ouvrir
              <ChevronRight size={17} />
            </span>
          </Link>
        ))}
      </div>
      <Link className="ali-about-link" to="/ali/a-propos">
        En savoir plus sur ALI <ArrowRight size={18} />
      </Link>
      <div className="editorial-note">
        <BookOpen size={23} />
        <p>
          Les fonctions de NewRidebis sont reprises dans un espace de
          compatibilité. La présence d’une fonction ne vaut pas validation du
          coaching ou des mesures : les essais voix et capteurs restent
          distincts.
        </p>
      </div>
    </>
  );
}
export function Lessons() {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState("all");
  const normalized = query.trim().toLocaleLowerCase("fr");
  const list = categories
    .map((cat) => ({
      ...cat,
      topics: cat.topics.filter((topic) =>
        label(topic).toLocaleLowerCase("fr").includes(normalized),
      ),
    }))
    .filter(
      (cat) =>
        (discipline === "all" || cat.discipline === discipline) &&
        cat.topics.length,
    );
  return (
    <>
      <div className="page-intro">
        <div>
          <p className="eyebrow">APPRENDRE AVEC ALI</p>
          <h1>Leçons & questions de cavaliers.</h1>
          <p>
            Retrouvez les 50 sujets de NewRidebis. Ouvrez une leçon, puis lancez
            sa conversation vocale.
          </p>
        </div>
        <Badge tone="green">50 sujets · 8 catégories</Badge>
      </div>
      <label className="search-field">
        <Search size={19} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Position, contact, confiance, obstacle…"
          aria-label="Rechercher une leçon"
        />
      </label>
      <div className="filter-tabs lesson-filters">
        {[
          ["all", "Tous"],
          ["general", "Général"],
          ["dressage", "Dressage"],
          ["cso", "CSO"],
          ["balade", "Balade"],
          ["cce", "CCE"],
        ].map(([id, title]) => (
          <button
            key={id}
            aria-pressed={discipline === id}
            className={discipline === id ? "selected" : ""}
            onClick={() => setDiscipline(id)}
          >
            {title}
          </button>
        ))}
      </div>
      <div className="lesson-category-grid">
        {list.map((cat) => (
          <section className="card lesson-category" key={cat.name}>
            <SectionHeading
              title={cat.name
                .replace(" — ce que dit la science", "")
                .replace(" — ce que révèle le corpus", "")}
            />
            {cat.topics.map((topic) => (
              <Link
                key={topic}
                to={`/ali?section=lessons&lecon=${encodeURIComponent(topic)}`}
              >
                <span className="lesson-play">
                  <AudioLines size={17} />
                </span>
                <span>{label(topic)}</span>
                <ChevronRight size={17} />
              </Link>
            ))}
          </section>
        ))}
      </div>
      {!list.length && (
        <div className="card empty-state">
          <h2>Aucune leçon dans cette sélection</h2>
          <p>Essayez un autre mot ou une autre discipline.</p>
        </div>
      )}
      <p className="compat-note">
        Ces thèmes sont ceux du catalogue existant, pas un classement
        statistique des questions les plus fréquentes. Les formulations
        scientifiques héritées sont à revoir avant validation pédagogique.
      </p>
    </>
  );
}

export function AboutAli() {
  return (
    <article className="ali-about">
      <Link to="/coaching" className="text-link">
        ← Retour à ALI
      </Link>
      <p className="ride-kicker">EN SAVOIR PLUS</p>
      <h1>
        UN REGARD EN PLUS.
        <br />
        LE VÔTRE, TOUJOURS.
      </h1>
      <p className="ali-about-lead">
        ALI est né d’une envie : prolonger la réflexion du cavalier entre deux
        cours, avec un espace pour poser ses questions et préparer sa pratique.
      </p>
      <div className="ali-about-grid">
        <section>
          <span>01 / L’INTENTION</span>
          <h2>Comprendre avant de répéter.</h2>
          <p>
            Hannah et Aurèle portent l’idée d’un accompagnement plus accessible,
            attentif au couple cavalier–cheval. ALI signifie Adaptive Learning
            Intelligence. L’ambition est d’aider à observer, à formuler une
            difficulté et à explorer des pistes adaptées.
          </p>
        </section>
        <section>
          <span>02 / L’ACCOMPAGNEMENT</span>
          <h2>Une conversation, des repères.</h2>
          <p>
            Questions de pratique, préparation, leçons et observations :
            choisissez un sujet, précisez votre contexte et gardez un regard
            critique sur les réponses. Un échange ne prouve ni une exécution
            réussie ni une compétence acquise.
          </p>
        </section>
        <section>
          <span>03 / LES SOURCES</span>
          <h2>Des références à examiner.</h2>
          <p>
            La documentation rassemblée comprend des corpus équestres et des
            références scientifiques. Leur inventaire et leur sélection ne
            prouvent pas leur utilisation dans chaque réponse d’ALI. La
            traçabilité des réponses et la validation pédagogique restent à
            vérifier.
          </p>
          <Link to="/sources">
            Consulter les sources et leurs limites <ArrowRight size={16} />
          </Link>
        </section>
        <section>
          <span>04 / LA JUSTE PLACE</span>
          <h2>Votre enseignant reste essentiel.</h2>
          <p>
            ALI ne remplace pas une observation sur place, un enseignant
            qualifié ou un vétérinaire. Une conversation vocale ne mesure pas la
            locomotion. Aucun capteur de casque ne doit être présenté comme
            validé sans essais matériels. En cas de douleur, de gêne ou de
            doute, interrompez la pratique et demandez un avis adapté.
          </p>
        </section>
      </div>
      <Link className="button button-primary" to="/ali/conversation">
        Ouvrir la conversation <ArrowRight size={18} />
      </Link>
    </article>
  );
}
