"use client";
import { useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { api, message } from "@/lib/client-api";
export function Notice({ error, text }: { error?: string; text?: string }) {
  return (
    <>
      {error && (
        <p
          role="alert"
          className="rounded border border-destructive p-3 text-sm"
        >
          {error}
        </p>
      )}
      {text && (
        <p role="status" className="rounded border p-3 text-sm">
          {text}
        </p>
      )}
    </>
  );
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      {label}
      {children}
    </label>
  );
}
export function TimeFields() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label="Start time (your local timezone)">
        <input
          className="field"
          name="dateTime"
          type="datetime-local"
          step="900"
          required
        />
      </Field>
      <Field label="Duration">
        <select className="field" name="duration" defaultValue="60">
          {[30, 60, 90, 120].map((n) => (
            <option key={n} value={n}>
              {n} minutes
            </option>
          ))}
        </select>
      </Field>
      <p className="text-sm text-muted-foreground sm:col-span-2">
        Use a 15-minute start time, at least 5 minutes ahead and within 180
        days. Availability is checked when you submit.
      </p>
    </div>
  );
}
export function timeData(data: FormData) {
  return {
    dateTime: new Date(String(data.get("dateTime"))).toISOString(),
    duration: Number(data.get("duration")),
  };
}
export function PasswordForm({ demo }: { demo: boolean }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("account/password", {
        currentPassword: d.get("current"),
        newPassword: d.get("new"),
      });
      window.location.assign("/login");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  if (demo)
    return (
      <p className="text-sm text-muted-foreground">
        Shared demo account passwords are locked. Use synthetic information
        only.
      </p>
    );
  return (
    <details className="rounded-lg border p-4">
      <summary className="cursor-pointer font-medium">Change password</summary>
      <form className="mt-4 grid max-w-md gap-3" onSubmit={submit}>
        <Field label="Current password">
          <input
            className="field"
            name="current"
            type="password"
            autoComplete="current-password"
            required
            maxLength={72}
          />
        </Field>
        <Field label="New password (10–72 characters)">
          <input
            className="field"
            name="new"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            maxLength={72}
          />
        </Field>
        <Notice error={error} />
        <Button disabled={busy}>
          {busy ? "Saving…" : "Change password and sign out"}
        </Button>
      </form>
    </details>
  );
}
