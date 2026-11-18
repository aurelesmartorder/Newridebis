import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { parentForPath, tabForPath, tabRoots, type TabId } from "./navigation";
const Context = createContext<{
  activeTab: TabId;
  destination: (tab: TabId) => string;
}>({ activeTab: "today", destination: (tab) => tabRoots[tab] });
export function NavigationState({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabForPath(location.pathname);
  const last = useRef<Partial<Record<TabId, string>>>({});
  const positions = useRef(new Map<string, number>());
  const bootstrapped = useRef(false);
  useLayoutEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    const parent = parentForPath(location.pathname);
    if (
      window.history.state?.idx === 0 &&
      parent !== location.pathname &&
      location.pathname !== "/" &&
      location.pathname !== "/connexion"
    ) {
      const target = location.pathname + location.search;
      navigate(parent, { replace: true });
      navigate(target, { replace: false });
    }
  }, []);
  useLayoutEffect(() => {
    const key = location.pathname + location.search;
    window.scrollTo({
      top: positions.current.get(key) || 0,
      behavior: "instant",
    });
    return () => {
      positions.current.set(key, window.scrollY);
    };
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (location.pathname !== "/connexion")
      last.current[activeTab] = location.pathname + location.search;
  }, [location.pathname, location.search, activeTab]);
  return (
    <Context
      value={{
        activeTab,
        destination: (tab) =>
          activeTab === tab
            ? tabRoots[tab]
            : last.current[tab] || tabRoots[tab],
      }}
    >
      {children}
    </Context>
  );
}
export const useTabNavigation = () => useContext(Context);
