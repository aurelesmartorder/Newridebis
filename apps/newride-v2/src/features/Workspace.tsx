import { X } from "lucide-react";
import { useWorkspaceModel } from "./workspace/model";
import { AliPage } from "./workspace/AliPage";
import { LivePage } from "./workspace/LivePage";
import { PerformancePage } from "./workspace/PerformancePage";
import { MapPage } from "./workspace/MapPage";
import { CommunityPage } from "./workspace/CommunityPage";
import { ProPage } from "./workspace/ProPage";
export { GpsProvider, useRideRecorder } from "./workspace/shared";
export function Workspace() {
  const model = useWorkspaceModel();
  const { pathname, alias, section, notice, setNotice } = model;
  return (
    <div className="studio-workspace">
      {notice && !(alias && section === "voice") && (
        <div className="studio-notice" role="status">
          <p>{notice}</p>
          <button aria-label="Fermer le message" onClick={() => setNotice("")}>
            <X size={18} />
          </button>
        </div>
      )}
      {alias && <AliPage model={model} />}
      {pathname === "/live" && <LivePage model={model} />}
      {pathname === "/performances" && <PerformancePage model={model} />}
      {pathname === "/carte" && <MapPage model={model} />}
      {pathname === "/discover" && <CommunityPage model={model} />}
      {pathname === "/pro" && <ProPage model={model} />}
    </div>
  );
}
