"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api, message } from "@/lib/client-api";
import type { Tutor, ReviewItem } from "@/lib/types";
import { Field, Notice, TimeFields, timeData } from "./shared";
export function TutorBrowser({ onBooked }: { onBooked: () => void }) {
  const [tutors, setTutors] = useState<Tutor[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [query, setQuery] = useState(""),
    [mode, setMode] = useState(""),
    [min, setMin] = useState(""),
    [max, setMax] = useState(""),
    [rating, setRating] = useState("0");
  const [selected, setSelected] = useState<Tutor | null>(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setTutors((await api<{ profiles: Tutor[] }>("teachers/getAll")).profiles);
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, []);
  const shown = tutors.filter(
    (t) =>
      (t.name + " " + t.subjects.join(" "))
        .toLowerCase()
        .includes(query.trim().toLowerCase()) &&
      (!mode || t.availability.includes(mode)) &&
      (!min || t.hourlyRate >= Number(min)) &&
      (!max || t.hourlyRate <= Number(max)) &&
      t.averageRating >= Number(rating),
  );
  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Find a tutor</h2>
        <Button variant="outline" onClick={load} disabled={loading}>
          Refresh tutors
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Name or subject">
          <input
            className="field"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tutors"
          />
        </Field>
        <Field label="Teaching mode">
          <select
            className="field"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="">Any mode</option>
            <option value="online">Online</option>
            <option value="in-person">In person</option>
          </select>
        </Field>
        <Field label="Minimum PKR / hour">
          <input
            className="field"
            type="number"
            min="0"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </Field>
        <Field label="Maximum PKR / hour">
          <input
            className="field"
            type="number"
            min="0"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </Field>
        <Field label="Minimum rating">
          <select
            className="field"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="0">Any rating</option>
            {[3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+ stars
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Notice error={error} />
      {loading ? (
        <p role="status">Loading tutors…</p>
      ) : !shown.length ? (
        <p>No approved tutors match these filters.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shown.map((t) => (
            <Card key={t._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm"
                  >
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  {t.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                <p className="text-sm">
                  Approved tutor · {t.yoe} years of experience
                </p>
                <p>{t.subjects.join(" · ")}</p>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {t.bio}
                </p>
                <p className="text-sm">
                  {t.availability.join(" / ")} · PKR{" "}
                  {t.hourlyRate.toLocaleString()} / hour
                </p>
                <p className="text-sm">
                  {t.reviewCount
                    ? `${t.averageRating.toFixed(1)} / 5 (${t.reviewCount} verified reviews)`
                    : "No reviews yet"}
                </p>
                <Button onClick={() => setSelected(t)}>
                  View profile & book
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
          {selected && (
            <TutorDetail
              tutor={selected}
              onBooked={() => {
                setSelected(null);
                onBooked();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
function TutorDetail({
  tutor: t,
  onBooked,
}: {
  tutor: Tutor;
  onBooked: () => void;
}) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]),
    [reviewsError, setReviewsError] = useState(""),
    [loaded, setLoaded] = useState(false),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    api<{ reviews: ReviewItem[] }>("reviews/list?teacherId=" + t._id)
      .then((d) => {
        if (active) setReviews(d.reviews);
      })
      .catch((e) => {
        if (active) setReviewsError(message(e));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [t._id]);
  async function book(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = new FormData(e.currentTarget);
      await api("sessions/book", {
        teacherId: t._id,
        ...timeData(d),
        subject: d.get("subject"),
        mode: d.get("mode"),
      });
      onBooked();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <DialogHeader>
        <DialogTitle>{t.name}</DialogTitle>
        <DialogDescription>
          Approved tutor · PKR {t.hourlyRate.toLocaleString()} / hour
        </DialogDescription>
      </DialogHeader>
      <p className="whitespace-pre-wrap">{t.bio}</p>
      <p className="text-sm">
        Qualifications: {t.qualifications.join(", ")} · Experience: {t.yoe}{" "}
        years
      </p>
      <details className="rounded border p-3">
        <summary className="cursor-pointer">
          Verified reviews ({t.reviewCount})
        </summary>
        <Notice error={reviewsError} />
        {!loaded ? (
          <p>Loading reviews…</p>
        ) : reviews.length ? (
          reviews.map((r) => (
            <article className="mt-3 border-t pt-3" key={r._id}>
              <p className="text-sm font-semibold">
                {r.studentId?.name ?? "Student"} · {r.rating} / 5
              </p>
              <p className="whitespace-pre-wrap text-sm">{r.review}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </article>
          ))
        ) : (
          <p className="mt-3 text-sm">No verified reviews yet.</p>
        )}
      </details>
      <form onSubmit={book} className="grid gap-4 border-t pt-4">
        <h3 className="font-semibold">Request a session</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Subject">
            <select className="field" name="subject">
              {t.subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Teaching mode">
            <select className="field" name="mode">
              {t.availability.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <TimeFields />
        <p className="text-sm text-muted-foreground">
          Estimated price: PKR {t.hourlyRate / 2}–{t.hourlyRate * 2} for 30–120
          minutes. No payments are collected. Your tutor must accept the
          request.
        </p>
        <Notice error={error} />
        <Button disabled={busy}>
          {busy ? "Requesting…" : "Request booking"}
        </Button>
      </form>
    </>
  );
}
