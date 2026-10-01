"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api, message } from "@/lib/client-api";
import type { Tutor } from "@/lib/types";
import { Field, Notice } from "./shared";
export function AdminTutors() {
  const [profiles, setProfiles] = useState<Tutor[]>([]),
    [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await api<{
        profiles: Tutor[];
        counts: { pending: number; approved: number; rejected: number };
      }>("admin/teachers");
      setProfiles(d.profiles);
      setCounts(d.counts);
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  async function verify(e: FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const status = d.get("status");
    if (!window.confirm(`Mark this tutor as ${status}?`)) return;
    setBusy(true);
    setError("");
    try {
      await api("admin/teacher/status", {
        id,
        status,
        comment: d.get("comment"),
      });
      setText("Verification decision saved.");
      await load();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Tutor verification</h2>
        <Button variant="outline" onClick={load} disabled={loading}>
          Refresh verification list
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Object.entries(counts).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <p className="capitalize">{key}</p>
              <p className="text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Notice error={error} text={text} />
      {loading ? (
        <p role="status">Loading tutors…</p>
      ) : !profiles.length ? (
        <p>No tutor registrations yet.</p>
      ) : (
        profiles.map((t) => (
          <details className="rounded-lg border p-4" key={t._id}>
            <summary className="cursor-pointer font-semibold">
              {t.name} · {t.status}
            </summary>
            <div className="mt-4 grid gap-3">
              <p className="whitespace-pre-wrap">{t.bio}</p>
              <p>Qualifications: {t.qualifications.join(", ")}</p>
              <p>
                Subjects: {t.subjects.join(", ")} · {t.yoe} years of experience
              </p>
              <p>
                {t.availability.join(" / ")} · PKR {t.hourlyRate} / hour
              </p>
              {t.status === "pending" ? (
                <form
                  onSubmit={(e) => verify(e, t._id)}
                  className="grid max-w-xl gap-3"
                >
                  <Field label="Verification comment (optional)">
                    <textarea
                      className="field"
                      name="comment"
                      maxLength={500}
                    />
                  </Field>
                  <Field label="Decision">
                    <select className="field" name="status">
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  </Field>
                  <Button disabled={busy}>
                    {busy ? "Saving…" : "Save verification decision"}
                  </Button>
                </form>
              ) : (
                <p>Comment: {t.verificationComment || "No comment."}</p>
              )}
            </div>
          </details>
        ))
      )}
    </section>
  );
}
