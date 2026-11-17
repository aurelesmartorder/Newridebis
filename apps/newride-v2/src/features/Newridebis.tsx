import { useEffect, useRef, useState } from "react";
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
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    function reset(event: MessageEvent) {
      if (
        event.origin === location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === "newride-v2-session-reset"
      )
        setGeneration((g) => g + 1);
    }
    addEventListener("message", reset);
    return () => removeEventListener("message", reset);
  }, []);
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
      key={generation}
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
