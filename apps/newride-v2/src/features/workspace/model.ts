import { useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useStore } from "../../app/Store";
import { useEngine, useRideRecorder } from "./shared";
export function useWorkspaceModel() {
  const { pathname } = useLocation();
  const [params, setParams] = useSearchParams();
  const { state, notice, setNotice } = useEngine();
  const gps = useRideRecorder();
  const { data } = useStore();
  const [draft, setDraft] = useState("");
  const [drafts, setDrafts] = useState<
    { id: string; text: string; at: string }[]
  >(() => {
    try {
      return JSON.parse(localStorage.getItem("newride.v2.drafts") || "[]");
    } catch {
      return [];
    }
  });
  const [question, setQuestion] = useState("");
  const [selected, setSelected] = useState<string>("");
  const [contact, setContact] = useState("");
  const [contacts, setContacts] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("newride.v2.contacts") || "[]");
    } catch {
      return [];
    }
  });
  const section = params.get("section") || (pathname === "/ali/conversation" ? "voice" : "live");
  const community = params.get("rubrique") || "social";
  const lesson = params.get("lecon");
  const localSessions = data.sessions.filter((s) => s.status === "finished");
  function saveDraft() {
    if (!draft.trim()) return;
    const next = [
      {
        id: crypto.randomUUID(),
        text: draft.trim(),
        at: new Date().toISOString(),
      },
      ...drafts,
    ];
    try {
      localStorage.setItem("newride.v2.drafts", JSON.stringify(next));
      setDrafts(next);
      setDraft("");
      setNotice("Brouillon conservé sur cet appareil. Il n’a pas été publié.");
    } catch {
      setNotice("Impossible d’enregistrer : le stockage local est plein.");
    }
  }
  const alias = pathname === "/ali" || pathname === "/ali/conversation";
  return {
    pathname,
    params,
    setParams,
    state,
    notice,
    setNotice,
    gps,
    data,
    draft,
    setDraft,
    drafts,
    setDrafts,
    question,
    setQuestion,
    selected,
    setSelected,
    contact,
    setContact,
    contacts,
    setContacts,
    section,
    community,
    lesson,
    localSessions,
    saveDraft,
    alias,
  };
}
export type WorkspaceModel = ReturnType<typeof useWorkspaceModel>;
