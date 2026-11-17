import test from "node:test";
import assert from "node:assert/strict";
import { validSocialPayload } from "../src/lib/social.ts";
const uuid = "11111111-1111-4111-8111-111111111111";
test("les interactions refusent les identifiants et contenus malformés", () => {
  assert.equal(validSocialPayload("publish", "   "), false);
  assert.equal(validSocialPayload("publish", "x".repeat(4001)), false);
  assert.equal(validSocialPayload("publish", "Observation de test"), true);
  assert.equal(validSocialPayload("comment", "Bonjour", uuid), true);
  assert.equal(validSocialPayload("comment", "Bonjour", "foreign-id"), false);
  assert.equal(validSocialPayload("like", "", uuid), true);
  assert.equal(validSocialPayload("friend-request", "a"), false);
  assert.equal(validSocialPayload("friend-request", "newride.testeur.b"), true);
});
