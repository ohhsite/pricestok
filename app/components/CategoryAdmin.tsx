"use client";
import { useState } from "react";
import type { Category } from "../lib/categories";

export default function CategoryAdmin({ categories, reload }: {
  categories: Category[];
  reload: () => Promise<boolean>;
}) {
  const [id, setId] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const selected = categories.find((c) => c.id === id);
  return (
    <section className="form-card">
      <h2>Kategorie i podkategorie</h2>
      <button className="button" onClick={() => { setId(""); setMessage(""); }}>Dodaj kategorię</button>
      <ul className="category-admin-list">
        {[...categories.filter((c) => !c.parent)].flatMap((parent) =>
          [parent, ...categories.filter((c) => c.parent === parent.id)]
        ).map((c) => (
          <li key={c.id}>
            <strong>{c.parent ? "↳ " : ""}{c.name}</strong>
            <button className="table-action" onClick={() => { setId(c.id); setMessage(""); }}>Edytuj</button>
            <button className="table-action" disabled={busy} onClick={async () => {
              if (!confirm("Usunąć kategorię „" + c.name + "”?")) return;
              setBusy(true);
              try {
                const response = await fetch("/api/admin/categories", {
                  method: "POST", headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: c.id, action: "delete" }),
                });
                if (!response.ok) throw new Error((await response.json()).error);
                if (await reload()) {
                  if (id === c.id) setId("");
                  setMessage("Kategoria została usunięta.");
                }
              } catch (error) {
                setMessage((error as Error).message);
              } finally {
                setBusy(false);
              }
            }}>Usuń</button>
          </li>
        ))}
      </ul>
      <form key={id} onSubmit={async (event) => {
        event.preventDefault();
        const fields = Object.fromEntries(new FormData(event.currentTarget));
        setBusy(true);
        setMessage("");
        try {
          const response = await fetch("/api/admin/categories", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...fields, editing: id }),
          });
          if (!response.ok) throw new Error((await response.json()).error);
          if (await reload()) {
            setId(String(fields.id));
            setMessage("Zapisano kategorię.");
          }
        } catch (error) {
          setMessage((error as Error).message);
        } finally {
          setBusy(false);
        }
      }}>
        <div className="form-grid">
          <label className="field">Nazwa
            <input name="name" defaultValue={selected?.name} required maxLength={80} />
          </label>
          <label className="field">Adres URL, np. fryzjer
            <input name="id" defaultValue={id} readOnly={!!id} required pattern="[a-z0-9]+(-[a-z0-9]+)*" maxLength={80} />
          </label>
          <label className="field">Kategoria nadrzędna
            <select name="parent" defaultValue={selected?.parent || ""}>
              <option value="">Brak · kategoria główna</option>
              {categories.filter((c) => !c.parent && c.id !== id).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="field">Meta title
            <input name="title" defaultValue={selected?.title} maxLength={120} />
          </label>
          <label className="field full">Meta description
            <input name="description" defaultValue={selected?.description} maxLength={320} />
          </label>
          <label className="field full">Treść widoczna na stronie kategorii
            <textarea name="content" defaultValue={selected?.content} maxLength={10000} rows={8} />
          </label>
        </div>
        <button className="button" disabled={busy}>Zapisz kategorię</button>
        {message && <p role="status">{message}</p>}
      </form>
    </section>
  );
}
