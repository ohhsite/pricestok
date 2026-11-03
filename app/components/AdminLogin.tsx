"use client";
import { useState } from "react";
export default function AdminLogin() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="form-card"
      style={{ maxWidth: 450 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        try {
          const values = Object.fromEntries(new FormData(e.currentTarget));
          const r = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const j = await r.json();
          if (!r.ok) throw new Error(j.error);
          location.reload();
        } catch (e: any) {
          setMessage(e.message);
          setBusy(false);
        }
      }}
    >
      <div className="form-grid">
        <label className="field full">
          E-mail administratora
          <input name="email" type="email" autoComplete="username" required />
        </label>
        <label className="field full">
          Hasło
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
      </div>
      {message && (
        <div className="message error" role="alert">
          {message}
        </div>
      )}
      <button className="button" disabled={busy}>
        {busy ? "Logowanie…" : "Zaloguj się"}
      </button>
      <p className="form-note">
        Konto administratora utwórz w Supabase Auth. Instrukcja znajduje się w
        README.
      </p>
    </form>
  );
}
