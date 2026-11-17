import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
const VoiceContext = createContext(false);
/** Authentication stays inside the existing service; it never gates navigation. */
export function LegacySessionProvider({ children }: { children: ReactNode }) {
  const [voice, setVoice] = useState(false);
  useEffect(() => {
    function receive(event: MessageEvent) {
      const frame = document.getElementById(
        "newride-engine",
      ) as HTMLIFrameElement | null;
      if (
        event.origin !== location.origin ||
        event.source !== frame?.contentWindow ||
        event.data?.type !== "newridebis-ready"
      )
        return;
      setVoice(event.data.voiceActive === true);
    }
    addEventListener("message", receive);
    return () => removeEventListener("message", receive);
  }, []);
  return <VoiceContext value={voice}>{children}</VoiceContext>;
}
export const useVoiceActive = () => useContext(VoiceContext);
