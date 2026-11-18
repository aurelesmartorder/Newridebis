import test from "node:test";
import assert from "node:assert/strict";
import { buildAliPlan } from "../src/lib/aliCoach.ts";
import { initialData, reducer, type Session } from "../src/lib/model.ts";
function dataWith(...sessions: Session[]) {
  return { ...initialData, horses: [{ id: "h1", name: "Sirocco", breed: "", birthYear: null }], selectedHorseId: "h1", sessions };
}
function session(id: string, outcome: Session["outcome"], finishedAt: number, exerciseId = "rythme-au-pas"): Session {
  return { id, horseId: "h1", horseName: "Sirocco", exerciseId, title: "Trouver votre rythme", startedAt: finishedAt - 600000, finishedAt, elapsedMs: 600000, runningSince: null, status: "finished", outcome, evidenceSource: "rider_report" };
}
test("ALI propose un point de départ sans inventer le niveau du duo", () => {
  const plan = buildAliPlan(dataWith());
  assert.equal(plan.stage, "start");
  assert.match(plan.evidenceLabel, /Pas encore de bilan/);
  assert.ok(plan.exercise);
});
test("un bilan difficile fait privilégier la sécurité et bloque la hausse de difficulté", () => {
  const plan = buildAliPlan(dataWith(session("s1", "stop", 1000)));
  assert.equal(plan.stage, "safety_pause");
  assert.match(plan.safetyNotice, /sécurité prime/);
  assert.match(plan.nextStep, /Ne pas augmenter/);
});
test("trois séances favorables restent des déclarations, jamais une compétence certifiée", () => {
  const plan = buildAliPlan(dataWith(session("s3", "comfortable", 3000), session("s2", "comfortable", 2000), session("s1", "comfortable", 1000)));
  assert.equal(plan.stage, "reported_progress");
  assert.equal(plan.evidence.length, 3);
  assert.match(plan.evidenceLabel, /pas une compétence certifiée/);
});
test("un retour ‘à reprendre’ conduit vers une variation plus simple", () => {
  const plan = buildAliPlan(dataWith(session("s1", "repeat", 1000)));
  assert.equal(plan.stage, "repeat");
  assert.ok(plan.nextStep.length > 0);
});
test("un résultat répété sur la même séance n’est pas fabriqué par le moteur", () => {
  const data = dataWith(session("same", "comfortable", 1000), session("same", "comfortable", 1000));
  const plan = buildAliPlan(data);
  assert.equal(new Set(plan.evidence.map((item) => item.sessionId)).size, 1);
  assert.equal(plan.evidence.length, 1);
  assert.match(plan.evidenceLabel, /insuffisant pour conclure/);
});
