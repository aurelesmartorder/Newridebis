import test from "node:test";
import assert from "node:assert/strict";
import {
  initialData,
  reducer,
  elapsed,
  parseStoredData,
  durationLabel,
  type Session,
} from "../src/lib/model.ts";
const horse = {
  id: "horse-1",
  name: "Cheval de recette",
  breed: "",
  birthYear: null,
};
const ready = () => reducer(initialData, { type: "horse/add", horse });
const session: Session = {
  id: "session-1",
  horseId: horse.id,
  horseName: horse.name,
  exerciseId: "rythme-au-pas",
  title: "Recette",
  startedAt: 1000,
  elapsedMs: 0,
  runningSince: 1000,
  status: "active",
};
test("une seule séance en cours et un cheval connu sont exigés", () => {
  assert.equal(
    reducer(initialData, { type: "session/start", session }).sessions.length,
    0,
  );
  const first = reducer(ready(), { type: "session/start", session });
  assert.equal(
    reducer(first, {
      type: "session/start",
      session: { ...session, id: "other" },
    }).sessions.length,
    1,
  );
});
test("pause et reprise excluent la pause du temps de pratique", () => {
  let state = reducer(ready(), { type: "session/start", session });
  state = reducer(state, { type: "session/pause", now: 11000 });
  assert.equal(elapsed(state.sessions[0], 41000), 10000);
  state = reducer(state, { type: "session/resume", now: 41000 });
  assert.equal(elapsed(state.sessions[0], 46000), 15000);
  state = reducer(state, {
    type: "session/finish",
    now: 46000,
    notes: " Observation ",
    outcome: "repeat",
  });
  assert.equal(state.sessions[0].elapsedMs, 15000);
  assert.equal(state.sessions[0].notes, "Observation");
  assert.equal(state.sessions[0].evidenceSource, "rider_report");
  assert.equal(state.sessions[0].status, "finished");
  assert.equal(elapsed(state.sessions[0], 90000), 15000);
});
test("un bilan terminé est immuable via les commandes de séance", () => {
  let state = reducer(reducer(ready(), { type: "session/start", session }), {
    type: "session/finish",
    now: 2000,
    notes: "Initial",
    outcome: "repeat",
  });
  const original = state.sessions[0];
  state = reducer(state, { type: "session/resume", now: 5000 });
  state = reducer(state, {
    type: "session/finish",
    now: 9000,
    notes: "Remplacement",
    outcome: "comfortable",
  });
  assert.deepEqual(state.sessions[0], original);
});
test("les données locales restent lisibles après sérialisation et les formats invalides sont rejetés", () => {
  const state = ready();
  assert.deepEqual(parseStoredData(JSON.stringify(state)), state);
  assert.throws(() => parseStoredData("{bad"));
  assert.throws(() =>
    parseStoredData(JSON.stringify({ ...state, horses: [{}] })),
  );
  assert.throws(() =>
    parseStoredData(
      JSON.stringify({ ...state, sessions: [{ ...session, elapsedMs: -3 }] }),
    ),
  );
  assert.deepEqual(parseStoredData(null), initialData);
});
test("le favori est réversible et ne modifie pas les autres collections", () => {
  const state = ready();
  const favorite = reducer(state, {
    type: "favorite/toggle",
    id: "rythme-au-pas",
  });
  assert.deepEqual(
    reducer(favorite, { type: "favorite/toggle", id: "rythme-au-pas" }),
    state,
  );
  assert.equal(durationLabel(61500), "01:01");
  assert.equal(durationLabel(-20), "00:00");
});
test("les durées des étapes correspondent au parcours annoncé", async () => {
  const { exercises } = await import("../src/content/exercises.ts");
  for (const e of exercises)
    assert.equal(
      e.steps.reduce((sum, s) => sum + s.seconds, 0),
      e.duration * 60,
    );
});
