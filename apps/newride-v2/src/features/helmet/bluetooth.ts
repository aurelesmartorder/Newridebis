export type BleCharacteristic = { readValue: () => Promise<DataView> };
export type BleService = {
  getCharacteristic: (id: string) => Promise<BleCharacteristic>;
};
export type BleServer = {
  connected: boolean;
  connect: () => Promise<BleServer>;
  disconnect: () => void;
  getPrimaryService: (id: string) => Promise<BleService>;
};
export type BleDevice = {
  id: string;
  name?: string;
  gatt?: BleServer;
  addEventListener: (type: string, callback: () => void) => void;
  removeEventListener: (type: string, callback: () => void) => void;
};
export type BleAdapter = {
  requestDevice: (options: {
    filters?: { namePrefix: string }[];
    acceptAllDevices?: boolean;
    optionalServices: string[];
  }) => Promise<BleDevice>;
};
export type LinkPhase =
  | "idle"
  | "choosing"
  | "connecting"
  | "connected"
  | "disconnected"
  | "cancelled"
  | "error"
  | "unsupported";
export function getBluetooth(): BleAdapter | undefined {
  return (navigator as Navigator & { bluetooth?: BleAdapter }).bluetooth;
}
export function batteryPercent(value: DataView): number | null {
  if (!value.byteLength) return null;
  const n = value.getUint8(0);
  return n <= 100 ? n : null;
}
export function bluetoothError(error: unknown): {
  phase: LinkPhase;
  message: string;
} {
  const name = error instanceof Error ? error.name : "";
  if (name === "NotFoundError")
    return {
      phase: "cancelled",
      message:
        "Recherche annulée ou aucun module sélectionné. Vous pouvez réessayer.",
    };
  if (name === "SecurityError" || name === "NotAllowedError")
    return {
      phase: "error",
      message:
        "L’accès Bluetooth n’a pas été autorisé. Vérifiez les permissions de ce site et réessayez.",
    };
  if (name === "NetworkError")
    return {
      phase: "error",
      message:
        "Le module n’a pas pu être joint. Rapprochez-le du téléphone et vérifiez son mode d’appairage.",
    };
  return {
    phase: "error",
    message:
      "La connexion n’a pas abouti. Vérifiez que le module est allumé, disponible et à proximité.",
  };
}
export function moduleStatus(phase: LinkPhase) {
  return phase === "connected"
    ? "Liaison Bluetooth établie"
    : phase === "choosing"
      ? "Sélection du module"
      : phase === "connecting"
        ? "Connexion au module"
        : phase === "disconnected"
          ? "Connexion interrompue"
          : "Casque non connecté";
}
