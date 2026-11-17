export type GpsPoint = {
  lat: number;
  lng: number;
  at: number;
  accuracy: number;
};
export type GpsRide = {
  id: string;
  startedAt: number;
  endedAt: number;
  points: GpsPoint[];
  distance: number;
};
export function metres(a: GpsPoint, b: GpsPoint) {
  const rad = Math.PI / 180;
  const x = (b.lat - a.lat) * rad,
    y = (b.lng - a.lng) * rad;
  const v =
    Math.sin(x / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(y / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(v), Math.sqrt(Math.max(0, 1 - v)));
}
export function acceptPoint(points: GpsPoint[], point: GpsPoint) {
  if (
    !Number.isFinite(point.at) ||
    !Number.isFinite(point.lat) ||
    !Number.isFinite(point.lng) ||
    Math.abs(point.lat) > 90 ||
    Math.abs(point.lng) > 180 ||
    !Number.isFinite(point.accuracy) ||
    point.accuracy > 50 ||
    point.accuracy < 0
  )
    return points;
  const last = points.at(-1);
  if (
    last &&
    (point.at <= last.at ||
      metres(last, point) / ((point.at - last.at) / 1000) > 25)
  )
    return points;
  return [...points, point];
}
export function distance(points: GpsPoint[]) {
  return points.reduce(
    (total, p, i) => (i ? total + metres(points[i - 1], p) : 0),
    0,
  );
}
export function readRides(raw: string | null): GpsRide[] {
  try {
    const value = JSON.parse(raw || "[]");
    return Array.isArray(value)
      ? value.filter(
          (r) =>
            typeof r.id === "string" &&
            Number.isFinite(r.startedAt) &&
            Number.isFinite(r.endedAt) &&
            Array.isArray(r.points) &&
            r.points.every(
              (p: GpsPoint) =>
                p &&
                Number.isFinite(p.lat) &&
                Number.isFinite(p.lng) &&
                Math.abs(p.lat) <= 90 &&
                Math.abs(p.lng) <= 180 &&
                Number.isFinite(p.at) &&
                Number.isFinite(p.accuracy),
            ) &&
            Number.isFinite(r.distance),
        )
      : [];
  } catch {
    return [];
  }
}
