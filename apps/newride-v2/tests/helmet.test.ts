import test from "node:test";
import assert from "node:assert/strict";
import {
  batteryPercent,
  bluetoothError,
  moduleStatus,
} from "../src/features/helmet/bluetooth.ts";
test("la batterie provient d’un octet valide et reste absente si la valeur manque", () => {
  assert.equal(batteryPercent(new DataView(Uint8Array.of(72).buffer)), 72);
  assert.equal(batteryPercent(new DataView(Uint8Array.of(0).buffer)), 0);
  assert.equal(batteryPercent(new DataView(Uint8Array.of(255).buffer)), null);
  assert.equal(batteryPercent(new DataView(new ArrayBuffer(0))), null);
});
test("annulation, refus et échec réseau ne deviennent jamais une connexion réussie", () => {
  for (const name of [
    "NotFoundError",
    "NotAllowedError",
    "SecurityError",
    "NetworkError",
    "UnknownError",
  ]) {
    const error = new Error("");
    error.name = name;
    assert.notEqual(bluetoothError(error).phase, "connected");
  }
  const cancel = new Error("");
  cancel.name = "NotFoundError";
  assert.equal(bluetoothError(cancel).phase, "cancelled");
  assert.equal(moduleStatus("disconnected"), "Connexion interrompue");
  assert.notEqual(moduleStatus("choosing"), "Liaison Bluetooth établie");
});
