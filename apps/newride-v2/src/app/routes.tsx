import { Activity, lazy, Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Link,
  Route,
  Routes,
  useLocation,
  type Location,
} from "react-router-dom";
import { Dashboard } from "../features/Dashboard";
import { AliHub, Lessons, AboutAli } from "../features/AliHub";
import { HelmetPage } from "../features/helmet/HelmetPage";
import { Workspace } from "../features/Workspace";
import { tabForPath, type TabId } from "./navigation";
import { Skeleton } from "../components/ui";
const Library = lazy(() =>
  import("../features/Coaching").then((m) => ({ default: m.Coaching })),
);
const Exercise = lazy(() =>
  import("../features/Coaching").then((m) => ({ default: m.ExerciseDetail })),
);
const Sources = lazy(() =>
  import("../features/Coaching").then((m) => ({ default: m.Sources })),
);
const Guided = lazy(() =>
  import("../features/Live").then((m) => ({ default: m.Live })),
);
const Stable = lazy(() =>
  import("../features/Stable").then((m) => ({ default: m.Stable })),
);
const Session = lazy(() =>
  import("../features/Stable").then((m) => ({ default: m.SessionDetail })),
);
const Experts = lazy(() =>
  import("../features/Experts").then((m) => ({ default: m.Experts })),
);
function RouteStack({ location }: { location: Location }) {
  return (
    <Suspense fallback={<Skeleton rows={3} />}>
      <Routes location={location}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/coaching" element={<AliHub />} />
        <Route path="/lecons" element={<Lessons />} />
        <Route path="/exercices" element={<Library />} />
        <Route path="/coaching/:id" element={<Exercise />} />
        <Route path="/seance-guidee" element={<Guided />} />
        <Route path="/ecurie" element={<Stable />} />
        <Route path="/seances/:id" element={<Session />} />
        <Route path="/casque" element={<HelmetPage />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/sources" element={<Sources />} />
        <Route
          path="/connexion"
          element={<Navigate to="/coaching" replace />}
        />
        <Route path="/ali/a-propos" element={<AboutAli />} />
        {[
          "/live",
          "/performances",
          "/carte",
          "/discover",
          "/ali",
          "/ali/conversation",
          "/pro",
        ].map((path) => (
          <Route key={path} path={path} element={<Workspace />} />
        ))}
        <Route
          path="*"
          element={
            <div className="card empty-state">
              <h1>Retrouvons le bon chemin.</h1>
              <p>Cette page n’existe pas.</p>
              <Link className="button button-primary" to="/">
                Revenir à l’accueil
              </Link>
            </div>
          }
        />
      </Routes>
    </Suspense>
  );
}
export function RetainedScreens() {
  const location = useLocation();
  const active = tabForPath(location.pathname);
  const [visited, setVisited] = useState<Partial<Record<TabId, Location>>>(
    () => ({ [active]: location }),
  );
  useEffect(() => {
    setVisited((previous) => ({ ...previous, [active]: location }));
  }, [location, active]);
  const screens = { ...visited, [active]: location };
  return (
    <>
      {Object.entries(screens).map(([id, screen]) => (
        <Activity key={id} mode={active === id ? "visible" : "hidden"}>
          <RouteStack location={screen!} />
        </Activity>
      ))}
    </>
  );
}
