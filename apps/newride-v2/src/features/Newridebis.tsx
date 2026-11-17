import { useEffect, useRef } from "react";
export type OriginalTab =
  | "live"
  | "perf"
  | "map"
  | "discover"
  | "coach"
  | "pro";
/** Existing engine only. No legacy UI or authentication overlay is exposed. */
export function Newridebis({
  tab,
  visible = true,
}: {
  tab: OriginalTab;
  visible?: boolean;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  function route() {
    frame.current?.contentWindow?.postMessage(
      { type: "newride-v2-route", tab: "coach" },
      location.origin,
    );
  }
  useEffect(() => {
    if (visible) route();
  }, [tab, visible]);
  return (
    <iframe
      hidden
      id="newride-engine"
      ref={frame}
      title="Services NewRide"
      src="/newridebis/index.html"
      allow="microphone; camera; geolocation; autoplay"
      onLoad={route}
    />
  );
}
