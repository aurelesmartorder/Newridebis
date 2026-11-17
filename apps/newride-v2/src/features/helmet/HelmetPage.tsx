import { EmergencyContact } from "../../components/EmergencyContact";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Battery,
  Bluetooth,
  Check,
  CheckCircle2,
  ChevronDown,
  Headphones,
  Mic,
  Phone,
  Radio,
  ShieldCheck,
  Volume2,
  X,
} from "lucide-react";
import { useHelmet } from "./HelmetProvider";
import { moduleStatus } from "./bluetooth";
import { Dialog } from "../../components/ui";
export function HelmetPage() {
  const helmet = useHelmet();
  const [guide, setGuide] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [audioMessage, setAudioMessage] = useState("");
  const [playing, setPlaying] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);
  const connected = helmet.phase === "connected";
  const busy = helmet.phase === "choosing" || helmet.phase === "connecting";
  useEffect(
    () => () => {
      audio.current?.pause();
      if(audio.current) audio.current.src = "";
    },
    [],
  );
  async function testSound() {
    if (playing) return;
    setAudioMessage("");
    try {
      audio.current?.pause();
      const player = new Audio('/audio/helmet-check.wav');
      audio.current = player;
      player.volume = 0.7;
      player.muted = false;
      player.setAttribute('playsinline', '');
      player.onended = () => { setPlaying(false); setAudioMessage('Test terminé. Avez-vous entendu les trois notes dans le casque ?'); };
      player.onerror = () => { setPlaying(false); setAudioMessage('Lecture impossible. Vérifiez la sortie audio et le volume du téléphone, puis réessayez.'); };
      setPlaying(true);
      // play is invoked synchronously in the click gesture, without awaiting an audio context.
      const playback = player.play();
      setAudioMessage('Écoutez les trois notes et vérifiez leur sortie : casque ou téléphone.');
      await playback;
    } catch {
      setAudioMessage(
        "Le son n’a pas pu être lu. Vérifiez le volume et la sortie audio de votre appareil.",
      );
      setPlaying(false);
    }
  }
  return (
    <div className="helmet-page">
      <div className="helmet-topline">
        <Link to="/live">Live & séances</Link>
        <span>/</span>
        <span>Mon casque</span>
        <span className={"helmet-status " + (connected ? "is-connected" : "")}>
          <i />
          {moduleStatus(helmet.phase)}
        </span>
      </div>
      <section className="helmet-hero">
        <img
          src="/photos/helmet-user.webp"
          alt="Casque équestre noir avec module latéral, posé dans une écurie — visuel fourni"
        />
        <div className="helmet-hero-shade" />
        <div className="helmet-hero-copy">
          <p className="ride-kicker">NEWRIDE / LA CONNEXION COMMENCE ICI</p>
          <h1>
            VOTRE CASQUE.
            <br />
            UNE NOUVELLE
            <br />
            <em>CONNEXION.</em>
          </h1>
          <p>
            La voix à portée d’oreille.
            <br />
            Votre duo, au centre de tout.
          </p>
          <a href="#pairing" className="helmet-hero-cta">
            Je connecte mon casque <Bluetooth size={19} />
          </a>
        </div>
        <div className="helmet-hero-foot">
          <span>01 / PRÉPARER. CONNECTER. VÉRIFIER.</span>
          <span>À L’ARRÊT, AVANT DE MONTER.</span>
        </div>
      </section>
      <div className="helmet-intro">
        <div>
          <p className="ride-kicker">PRÊT POUR VOTRE PROCHAINE SÉANCE ?</p>
          <h2>
            Tout commence
            <br />
            par une bonne connexion.
          </h2>
        </div>
        <p>
          Connectez le module de votre casque, vérifiez la sortie audio et
          découvrez les fonctions disponibles. Chaque connexion a son rôle : le
          Bluetooth des capteurs et l’audio du téléphone se préparent
          séparément.
        </p>
      </div>
      <section id="pairing" className="helmet-pairing">
        <div className="helmet-pairing-heading">
          <span className="helmet-step-index">01</span>
          <div>
            <p className="ride-kicker">LE MODULE DU CASQUE</p>
            <h2>
              {connected ? "La liaison est établie." : "Trouvons votre module."}
            </h2>
            <p>
              Allumez le casque, activez son mode d’appairage et gardez-le près
              de votre téléphone.
            </p>
          </div>
          <Bluetooth size={30} strokeWidth={1.3} />
        </div>
        <div className="helmet-pairing-body">
          <div
            className={"helmet-search-orbit " + (busy ? "is-searching" : "")}
            aria-hidden="true"
          >
            <span />
            <span />
            <span />
            <Bluetooth size={32} strokeWidth={1.2} />
          </div>
          <div className="helmet-device">
            <span className="ride-kicker">
              {connected ? "MODULE SÉLECTIONNÉ" : "RECHERCHE BLUETOOTH"}
            </span>
            <h3>
              {connected
                ? helmet.name
                : busy
                  ? "Un instant, on se connecte…"
                  : "Votre casque vous attend."}
            </h3>
            <p role="status">
              {helmet.message ||
                "La recherche s’ouvre uniquement à votre demande. Aucun appareil ne se connecte automatiquement."}
            </p>
            {connected ? (
              <div className="helmet-device-actions">
                <span className="helmet-link-tag">
                  <Check size={14} />
                  Bluetooth relié
                </span>
                <button onClick={helmet.disconnect}>Déconnecter</button>
              </div>
            ) : (
              <>
                <button
                  className="helmet-connect-button"
                  onClick={() => void helmet.connect()}
                  disabled={busy}
                >
                  <Bluetooth size={18} />
                  {busy ? "Recherche en cours…" : "Rechercher mon module"}
                </button>
                {busy && (
                  <button
                    className="helmet-text-button"
                    onClick={helmet.disconnect}
                  >
                    Annuler
                  </button>
                )}
                <button
                  className="helmet-text-button"
                  disabled={busy}
                  onClick={() => void helmet.connect(true)}
                >
                  Mon module porte un autre nom <ArrowUpRight size={15} />
                </button>
              </>
            )}
          </div>
          <div className="helmet-battery">
            <Battery size={27} strokeWidth={1.3} />
            <strong>
              {helmet.battery === null ? "—" : helmet.battery + "%"}
            </strong>
            <span>
              {helmet.battery === null
                ? "Batterie non reçue"
                : "Batterie lue sur le module"}
            </span>
            {helmet.readAt && helmet.battery !== null && (
              <small>
                Lecture à{" "}
                {new Date(helmet.readAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </small>
            )}
          </div>
        </div>
        <p className="helmet-pairing-note">
          Sélectionner un appareil établit une liaison Bluetooth ; cela ne
          confirme pas qu’il s’agit d’un casque NewRide compatible. Les services
          de capteurs propres au prototype restent à intégrer avec son
          protocole.
        </p>
      </section>
      <section className="helmet-audio">
        <div className="helmet-audio-copy">
          <span className="helmet-step-index">02</span>
          <p className="ride-kicker">LA VOIX DANS VOTRE CASQUE</p>
          <h2>
            Entendre.
            <br />
            Échanger.
            <br />
            <em>Rester présent.</em>
          </h2>
          <p>
            Le son du coaching et des appels passe par la sortie audio de votre
            téléphone. Jumelez l’audio du casque dans ses réglages Bluetooth,
            puis faites un essai.
          </p>
          <button className="helmet-text-button" onClick={() => setGuide(true)}>
            Comment préparer l’audio <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="helmet-audio-test">
          <Headphones size={35} strokeWidth={1.1} />
          <span className="ride-kicker">UN ESSAI AVANT DE PARTIR</span>
          <h3>Vous nous entendez ?</h3>
          <p>
            Trois notes pour vérifier la sortie audio choisie par votre
            appareil. Ce test n’active pas ALI ni le microphone.
          </p>
          <button
            className="studio-dark"
            onClick={() => void testSound()}
            disabled={playing}
          >
            <Volume2 size={18} />
            {playing ? "Lecture du test…" : "Écouter le test audio"}
          </button>
          {audioMessage && (
            <p role="status" className="helmet-audio-message">
              {audioMessage}
            </p>
          )}
          <label className="helmet-audio-confirm">
            <input
              type="checkbox"
              checked={helmet.audioConfirmed}
              onChange={(e) => helmet.setAudioConfirmed(e.target.checked)}
            />
            <span>J’ai entendu le son dans mon casque.</span>
          </label>
          {helmet.audioConfirmed && (
            <div className="helmet-audio-ready">
              <CheckCircle2 size={19} />
              <div>
                <strong>Sortie audio confirmée par vous.</strong>
                <p>
                  Vous pouvez ouvrir le coaching et vérifier la disponibilité
                  d’ALI. Aucun capteur n’est validé par ce test.
                </p>
                <Link to="/ali/conversation">
                  Ouvrir le coaching <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      <div className="helmet-features-heading">
        <p className="ride-kicker">UN CASQUE, PLUSIEURS CONNEXIONS</p>
        <h2>
          Chaque fonction
          <br />à sa juste place.
        </h2>
      </div>
      <div className="helmet-capabilities">
        <article>
          <Mic size={25} strokeWidth={1.25} />
          <span className="helmet-feature-number">01 / COACHING VOCAL</span>
          <h3>
            Une voix pour
            <br />
            vous accompagner.
          </h3>
          <p>
            ALI utilise le micro et la sortie audio du téléphone. L’activation
            du service vocal se vérifie dans l’espace coaching.
          </p>
          <Link to="/ali/conversation">
            Ouvrir ALI <ArrowUpRight size={16} />
          </Link>
          <span className="helmet-feature-state">Service vocal à vérifier</span>
        </article>
        <article>
          <Phone size={25} strokeWidth={1.25} />
          <span className="helmet-feature-number">02 / APPELS</span>
          <h3>
            Vos échanges,
            <br />à portée d’oreille.
          </h3>
          <p>
            Un casque audio compatible peut servir aux appels du téléphone après
            jumelage système. L’application ne gère pas les appels entrants.
          </p>
          <button onClick={() => setGuide(true)}>
            Préparer l’audio <ArrowUpRight size={16} />
          </button>
          <span className="helmet-feature-state">
            Selon le matériel et le téléphone
          </span>
        </article>
        <article>
          <Radio size={25} strokeWidth={1.25} />
          <span className="helmet-feature-number">03 / CAPTEURS EMBARQUÉS</span>
          <h3>
            Des données,
            <br />
            quand elles existent.
          </h3>
          <p>
            Le niveau de batterie peut être lu si le module l’expose. Mouvements
            et impacts demandent le protocole du prototype et des essais réels.
          </p>
          <a href="#pairing">
            Vérifier la liaison <ArrowUpRight size={16} />
          </a>
          <span className="helmet-feature-state">Télémétrie non validée</span>
        </article>
      </div>
      <section className="helmet-safety">
        <ShieldCheck size={30} strokeWidth={1.2} />
        <div>
          <p className="ride-kicker">03 / PRÉPARER SA SÉCURITÉ</p>
          <h2>
            Le bon réflexe,
            <br />
            au bon moment.
          </h2>
          <p>
            Un accès manuel au téléphone reste essentiel. Aucune chute n’est
            détectée et aucun appel d’urgence n’est envoyé automatiquement par
            cette version.
          </p>
          <div>
            <Link className="helmet-text-button" to="/pro">
              Préparer mes contacts <ArrowRight size={16} />
            </Link>
            <button
              className="helmet-emergency-button"
              onClick={() => setEmergency(true)}
            >
              Accéder au numéro d’urgence <Phone size={16} />
            </button>
          </div>
        </div>
      </section>
      <p className="helmet-visual-caption">
        Visuel fourni par vous, utilisé comme illustration du parcours. Il ne
        constitue pas une preuve des caractéristiques ou de la certification du
        prototype.
      </p>
      {guide && (
        <Dialog
          title="Préparer l’audio du casque"
          onClose={() => setGuide(false)}
        >
          <ol className="helmet-guide">
            <li>
              <b>À l’arrêt, allumez le casque.</b>
              <p>
                Activez le mode d’appairage audio indiqué dans sa notice. Il
                peut être distinct du mode capteurs BLE.
              </p>
            </li>
            <li>
              <b>Ouvrez les réglages Bluetooth du téléphone.</b>
              <p>
                Sélectionnez la partie audio du casque et vérifiez les
                autorisations pour les appels et le son multimédia, si ces
                options existent.
              </p>
            </li>
            <li>
              <b>Revenez faire le test audio.</b>
              <p>
                À volume modéré, vérifiez que le son sort du casque. Le
                navigateur ne peut pas confirmer lui-même cette sortie.
              </p>
            </li>
            <li>
              <b>Préparez ensuite le coaching.</b>
              <p>
                Le microphone et le service vocal doivent être autorisés et
                disponibles. Gardez votre attention sur le cheval et votre
                environnement.
              </p>
            </li>
          </ol>
          <button className="studio-dark" onClick={() => setGuide(false)}>
            Revenir au test <ArrowRight size={17} />
          </button>
        </Dialog>
      )}
      {emergency && (
        <Dialog
          title="En cas d’urgence réelle"
          onClose={() => setEmergency(false)}
        >
          <div className="helmet-emergency-dialog">
            <Phone size={28} />
            <h3>112 · Numéro d’urgence européen</h3>
            <p>
              Le lien ci-dessous demande à votre appareil d’ouvrir le téléphone.
              Aucun appel n’est passé automatiquement par NewRide. N’utilisez
              pas ce numéro pour un essai.
            </p>
            <a className="helmet-emergency-button" href="tel:112">
              Ouvrir le téléphone au 112 <ArrowUpRight size={17} />
            </a>
            <a
              href="https://www.service-public.gouv.fr/particuliers/vosdroits/F33954"
              target="_blank"
              rel="noreferrer"
            >
              Consulter les numéros officiels
            </a>
          </div>
        </Dialog>
      )}
      <EmergencyContact />
    </div>
  );
}
