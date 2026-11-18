import { useState, type FormEvent } from "react";
import { useStore } from "../app/Store";
import { Button, Dialog } from "../components/ui";
export function HorseForm({ onClose }: { onClose: () => void }) {
  const { dispatch } = useStore();
  const [error, setError] = useState("");
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const year = String(f.get("year") || "");
    const birthYear = year ? Number(year) : null;
    if (
      !name ||
      name.length > 80 ||
      (birthYear !== null &&
        (!Number.isInteger(birthYear) ||
          birthYear < 1970 ||
          birthYear > new Date().getFullYear()))
    ) {
      setError("Vérifiez le nom et l’année de naissance.");
      return;
    }
    dispatch({
      type: "horse/add",
      horse: {
        id: crypto.randomUUID(),
        name,
        breed: String(f.get("breed") || "")
          .trim()
          .slice(0, 80),
        birthYear,
      },
    });
    onClose();
  }
  return (
    <Dialog title="Ajouter un cheval" onClose={onClose}>
      <form onSubmit={submit} className="form-stack">
        <p className="muted">
          Créez la fiche du cheval avec lequel vous souhaitez préparer vos
          séances.
        </p>
        <label>
          Nom du cheval
          <input
            name="name"
            required
            maxLength={80}
            autoComplete="off"
            placeholder="Ex. Givenchy"
          />
        </label>
        <div className="form-row">
          <label>
            Race <span className="optional">facultatif</span>
            <input
              name="breed"
              maxLength={80}
              placeholder="Ex. Selle français"
            />
          </label>
          <label>
            Année de naissance
            <input
              name="year"
              type="number"
              min="1970"
              max={new Date().getFullYear()}
              placeholder="Ex. 2015"
            />
          </label>
        </div>
        <p className="small muted">
          Cette première version enregistre la fiche sur cet appareil
          uniquement. N’y saisissez pas de document médical confidentiel.
        </p>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <div className="horse-form-actions"><Button type="submit">Créer la fiche</Button></div>
      </form>
    </Dialog>
  );
}
