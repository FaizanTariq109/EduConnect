"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { api, message } from "@/lib/client-api";
import type { Tutor } from "@/lib/types";
import { Field, Notice } from "./shared";
export function TutorProfile() {
  const [profile, setProfile] = useState<Tutor | null>(null),
    [error, setError] = useState(""),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ profile: Tutor }>("me")
      .then((d) => setProfile(d.profile))
      .catch((e) => setError(message(e)));
  }, []);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setText("");
    const d = new FormData(e.currentTarget),
      list = (key: string) =>
        String(d.get(key))
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    try {
      const result = await api<{ profile: Tutor }>("edit/teacher", {
        name: d.get("name"),
        bio: d.get("bio"),
        qualifications: list("qualifications"),
        subjects: list("subjects"),
        yoe: Number(d.get("yoe")),
        hourlyRate: Number(d.get("hourlyRate")),
        availability: d.getAll("availability"),
      });
      setProfile(result.profile);
      setText("Profile saved. Booking price snapshots are unchanged.");
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="grid gap-4">
      <h2 className="text-2xl font-semibold">Tutor profile</h2>
      <Notice error={error} text={text} />
      {profile ? (
        <>
          <p>
            Verification: <strong>{profile.status}</strong>
            {profile.verificationComment && ` — ${profile.verificationComment}`}
          </p>
          <form onSubmit={save} className="grid max-w-2xl gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <input
                className="field"
                name="name"
                defaultValue={profile.name}
                required
                maxLength={80}
              />
            </Field>
            <Field label="Qualifications (comma-separated)">
              <input
                className="field"
                name="qualifications"
                defaultValue={profile.qualifications.join(", ")}
                required
              />
            </Field>
            <Field label="Subjects (comma-separated)">
              <input
                className="field"
                name="subjects"
                defaultValue={profile.subjects.join(", ")}
                required
              />
            </Field>
            <Field label="Years of experience">
              <input
                className="field"
                name="yoe"
                type="number"
                min="0"
                max="60"
                defaultValue={profile.yoe}
                required
              />
            </Field>
            <Field label="Hourly rate (PKR)">
              <input
                className="field"
                name="hourlyRate"
                type="number"
                min="100"
                max="20000"
                defaultValue={profile.hourlyRate}
                required
              />
            </Field>
            <fieldset className="grid gap-2">
              <legend className="text-sm">Teaching modes</legend>
              {["online", "in-person"].map((mode) => (
                <label key={mode} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    name="availability"
                    value={mode}
                    defaultChecked={profile.availability.includes(mode)}
                  />
                  {mode}
                </label>
              ))}
            </fieldset>
            <div className="sm:col-span-2">
              <Field label="Bio">
                <textarea
                  className="field min-h-28"
                  name="bio"
                  minLength={20}
                  maxLength={1500}
                  defaultValue={profile.bio}
                  required
                />
              </Field>
            </div>
            <Button disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button>
          </form>
        </>
      ) : (
        !error && <p>Loading profile…</p>
      )}
    </section>
  );
}
