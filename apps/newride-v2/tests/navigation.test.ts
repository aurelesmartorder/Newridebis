import test from "node:test";
import assert from "node:assert/strict";
import {
  safeReturnTo,
  parentForPath,
  tabForPath,
} from "../src/app/navigation.ts";
test("la redirection de connexion refuse les destinations externes et les boucles", () => {
  for (const target of [
    "https://evil.test",
    "//evil.test",
    "/\\evil.test",
    "/connexion?retour=/connexion",
    "/inconnu",
  ])
    assert.equal(safeReturnTo(target), "/coaching");
  assert.equal(
    safeReturnTo("/ali/conversation?section=voice"),
    "/ali/conversation?section=voice",
  );
  assert.equal(safeReturnTo("/ali/a-propos"), "/ali/a-propos");
});
test("les sous-parcours reviennent au bon espace et conservent un parent déterministe", () => {
  assert.equal(tabForPath("/ali/conversation"), "ali");
  assert.equal(tabForPath("/performances"), "stable");
  assert.equal(tabForPath("/casque"), "helmet");
  assert.equal(tabForPath("/live"), "ali");
  assert.equal(tabForPath("/carte"), "community");
  assert.equal(tabForPath("/pro"), "stable");
  assert.equal(tabForPath("/discover"), "community");
  assert.equal(parentForPath("/coaching/rythme-au-pas"), "/exercices");
  assert.equal(parentForPath("/seances/abc"), "/performances");
  assert.equal(parentForPath("/ali/conversation"), "/coaching");
});
