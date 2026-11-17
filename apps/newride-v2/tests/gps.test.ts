import test from "node:test";
import assert from "node:assert/strict";
import {
  acceptPoint,
  distance,
  metres,
  readRides,
  type GpsPoint,
} from "../src/lib/guestRide.ts";
const start: GpsPoint = { lat: 45, lng: 4, at: 1000, accuracy: 4 };
test("le GPS rejette les points imprécis, invalides et les sauts incohérents", () => {
  const points = [start];
  for (const p of [
    { ...start, at: 0 },
    { ...start, lat: 91, at: 2000 },
    { ...start, accuracy: 100, at: 2000 },
    { ...start, lng: 5, at: 2000 },
    { ...start, at: NaN },
  ])
    assert.equal(acceptPoint(points, p), points);
  const next = acceptPoint(points, { ...start, lat: 45.0001, at: 11000 });
  assert.equal(next.length, 2);
  assert.equal(points.length, 1);
  assert.ok(distance(next) > 11 && distance(next) < 12);
});
test("aucune distance GPS ne se déduit d’un point unique et les fichiers invalides ne bloquent pas le carnet", () => {
  assert.equal(distance([start]), 0);
  assert.equal(metres(start, start), 0);
  assert.deepEqual(readRides("{bad"), []);
  assert.deepEqual(readRides("{}"), []);
  assert.deepEqual(readRides("[{}]"), []);
});
