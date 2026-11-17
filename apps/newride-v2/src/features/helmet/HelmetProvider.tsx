import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  batteryPercent,
  bluetoothError,
  getBluetooth,
  type BleDevice,
  type LinkPhase,
} from "./bluetooth";
function useHelmetConnection() {
  const [phase, setPhase] = useState<LinkPhase>("idle");
  const [name, setName] = useState("");
  const [battery, setBattery] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [readAt, setReadAt] = useState<string | null>(null);
  const [audioConfirmed, setAudioConfirmed] = useState(false);
  const device = useRef<BleDevice | null>(null);
  const attempt = useRef(0);
  const cleanup = useRef<(() => void) | null>(null);
  const mounted = useRef(true);
  const busy = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      attempt.current++;
      cleanup.current?.();
      device.current?.gatt?.disconnect();
    };
  }, []);
  function disconnect() {
    attempt.current++;
    busy.current = false;
    cleanup.current?.();
    cleanup.current = null;
    device.current?.gatt?.disconnect();
    device.current = null;
    setBattery(null);
    setReadAt(null);
    setAudioConfirmed(false);
    setPhase("disconnected");
    setMessage(
      "Le module est déconnecté. Aucune donnée de capteur n’est reçue.",
    );
  }
  async function connect(other = false) {
    if (busy.current || device.current?.gatt?.connected) return;
    const api = getBluetooth();
    if (!api) {
      setPhase("unsupported");
      setMessage(
        "La recherche de capteurs Bluetooth n’est pas proposée par ce navigateur. Vous pouvez préparer l’audio dans les réglages de votre téléphone. Pour la recherche BLE, utilisez un navigateur compatible, par exemple Chrome sur Android ou ordinateur.",
      );
      return;
    }
    busy.current = true;
    const id = ++attempt.current;
    setPhase("choosing");
    setMessage(
      "Choisissez votre module dans la fenêtre Bluetooth du navigateur.",
    );
    setBattery(null);
    setReadAt(null);
    setAudioConfirmed(false);
    let selected: BleDevice | undefined;
    try {
      selected = await api.requestDevice(
        other
          ? { acceptAllDevices: true, optionalServices: ["battery_service"] }
          : {
              filters: [
                { namePrefix: "NewRide" },
                { namePrefix: "Newride" },
                { namePrefix: "NEWRIDE" },
              ],
              optionalServices: ["battery_service"],
            },
      );
      if (id !== attempt.current || !mounted.current) return;
      if (!selected.gatt) throw new Error("Module sans service GATT");
      device.current = selected;
      setName(selected.name || "Module Bluetooth sans nom");
      setPhase("connecting");
      setMessage("Connexion au module sélectionné…");
      const onDisconnect = () => {
        if (!mounted.current || device.current !== selected) return;
        attempt.current++;
        busy.current = false;
        setPhase("disconnected");
        setBattery(null);
        setReadAt(null);
        setAudioConfirmed(false);
        setMessage(
          "Le module s’est déconnecté. Rapprochez-vous et relancez la connexion.",
        );
      };
      selected.addEventListener("gattserverdisconnected", onDisconnect);
      cleanup.current = () =>
        selected?.removeEventListener("gattserverdisconnected", onDisconnect);
      const server = await selected.gatt.connect();
      if (id !== attempt.current || !mounted.current) {
        server.disconnect();
        return;
      }
      if (!server.connected) throw new Error("Connexion non établie");
      setPhase("connected");
      busy.current = false;
      setMessage(
        "Liaison Bluetooth établie. Les fonctions du casque restent à vérifier séparément.",
      );
      try {
        const service = await server.getPrimaryService("battery_service");
        const characteristic = await service.getCharacteristic("battery_level");
        const value = await characteristic.readValue();
        if (id === attempt.current && mounted.current && server.connected) {
          setBattery(batteryPercent(value));
          setReadAt(new Date().toISOString());
        }
      } catch {
        if (id === attempt.current && mounted.current)
          setMessage(
            "Liaison établie. Le module ne fournit pas de niveau de batterie accessible à cette application.",
          );
      }
    } catch (error) {
      if (id !== attempt.current || !mounted.current) return;
      cleanup.current?.();
      cleanup.current = null;
      device.current?.gatt?.disconnect();
      device.current = null;
      const result = bluetoothError(error);
      setPhase(result.phase);
      setMessage(result.message);
    } finally {
      if (id === attempt.current) busy.current = false;
    }
  }
  return {
    phase,
    name,
    battery,
    message,
    readAt,
    audioConfirmed,
    setAudioConfirmed,
    connect,
    disconnect,
  };
}
const Context = createContext<ReturnType<typeof useHelmetConnection> | null>(
  null,
);
export function HelmetProvider({ children }: { children: ReactNode }) {
  const value = useHelmetConnection();
  return <Context value={value}>{children}</Context>;
}
export function useHelmet() {
  const value = useContext(Context);
  if (!value) throw Error("HelmetProvider absent");
  return value;
}
