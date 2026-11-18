export const tabs = ["today", "ali", "helmet", "community", "stable"] as const;
export type TabId = (typeof tabs)[number];
export const tabRoots: Record<TabId, string> = {
  today: "/",
  community: "/discover",
  helmet: "/casque",
  ali: "/coaching",
  stable: "/ecurie",
};
export function tabForPath(path: string): TabId {
  if (/^\/(discover)/.test(path)) return "community";
  if (/^\/casque(\/|$)/.test(path)) return "helmet";
  if (/^\/(live|seance-guidee|coaching|ali|lecons|exercices|sources|connexion)(\/|$)/.test(path)) return "ali";
  if (/^\/carte(\/|$)/.test(path)) return "community";
  if (/^\/(ecurie|performances|seances|experts|pro|acces-test)(\/|$)/.test(path)) return "stable";
  return "today";
}
const knownPath =
  /^\/(?:$|live$|casque$|performances$|carte$|discover$|coaching(?:\/[^/]+)?$|ali(?:\/(?:conversation|a-propos))?$|lecons$|exercices$|seance-guidee$|seances\/[^/]+$|acces-test$|ecurie$|experts$|pro$|sources$)/;
export function safeReturnTo(input: string | null): string {
  if (
    !input ||
    !input.startsWith("/") ||
    input.startsWith("//") ||
    input.includes("\\")
  )
    return "/coaching";
  try {
    const url = new URL(input, "https://newride.invalid");
    if (
      url.origin !== "https://newride.invalid" ||
      !knownPath.test(url.pathname)
    )
      return "/coaching";
    return url.pathname + url.search;
  } catch {
    return "/coaching";
  }
}
export function parentForPath(path: string): string {
  if (path.startsWith("/coaching/")) return "/exercices";
  if (path.startsWith("/seances/")) return "/performances";
  if (path === "/lecons" || path.startsWith("/ali")) return "/coaching";
  if (path === "/exercices" || path === "/sources") return "/coaching";
  if (
    path === "/casque" ||
    path === "/performances" ||
    path === "/carte" ||
    path === "/seance-guidee"
  )
    return "/live";
  if (path === "/acces-test" || path === "/pro" || path === "/experts")
    return "/ecurie";
  return "/";
}
