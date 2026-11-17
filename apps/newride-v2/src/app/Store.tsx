import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  initialData,
  parseStoredData,
  reducer,
  type Action,
  type AppData,
} from "../lib/model";
const key = "newride.v2.local.v1";
const StoreContext = createContext<{
  data: AppData;
  dispatch: Dispatch<Action>;
  storageError: string | null;
} | null>(null);
export function StoreProvider({ children }: { children: ReactNode }) {
  const [loaded] = useState(() => {
    try {
      return { data: parseStoredData(localStorage.getItem(key)), error: null };
    } catch {
      return {
        data: initialData,
        error:
          "La sauvegarde locale ne peut pas être lue. Les données précédentes ont été conservées ; exportez-les depuis les réglages avant de réinitialiser.",
      };
    }
  });
  const [data, reduce] = useReducer(reducer, loaded.data);
  const [canWrite, setCanWrite] = useState(!loaded.error);
  const dispatch: Dispatch<Action> = (action) => {
    if (action.type === "reset") setCanWrite(true);
    reduce(action);
  };
  const [storageError, setStorageError] = useState<string | null>(loaded.error);
  useEffect(() => {
    // Preserve unreadable bytes until explicit reset, rather than silently destroying them.
    if (!canWrite) return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
      setStorageError(null);
    } catch {
      setStorageError(
        "L’enregistrement sur cet appareil est indisponible. Exportez vos données avant de quitter.",
      );
    }
  }, [data, canWrite]);
  return (
    <StoreContext value={{ data, dispatch, storageError }}>
      {children}
    </StoreContext>
  );
}
export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("StoreProvider absent");
  return value;
}
export function exportLocalData(data: AppData, raw = false) {
  const blob = new Blob(
    [raw ? localStorage.getItem(key) || "{}" : JSON.stringify(data, null, 2)],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `newride-${new Date().toISOString().slice(0, 10)}${raw ? "-brut" : ""}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
