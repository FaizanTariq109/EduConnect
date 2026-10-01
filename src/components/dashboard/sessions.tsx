"use client";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { api, message } from "@/lib/client-api";
import type { SessionItem } from "@/lib/types";
import { Field, Notice, TimeFields, timeData } from "./shared";
export function Sessions({
  role,
  revision = 0,
}: {
  role: "student" | "teacher";
  revision?: number;
}) {
  const [rows, setRows] = useState<SessionItem[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [text, setText] = useState(""),
    [busy, setBusy] = useState(false);
  const [action, setAction] = useState<{
    kind: string;
    row: SessionItem;
  } | null>(null);
  async function load() {
    setLoading(true);
    setError("");
    try {
      setRows(
        (await api<{ sessions: SessionItem[] }>("sessions/getAll")).sessions,
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load();
  }, [revision]);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!action) return;
    setBusy(true);
    setError("");
    const { kind, row } = action;
    try {
      const d = new FormData(e.currentTarget);
      await api(kind === "review" ? "review" : "sessions/" + kind, {
        sessionID: row._id,
        ...(kind === "reschedule"
          ? timeData(d)
          : kind === "review"
            ? { rating: Number(d.get("rating")), review: d.get("review") }
            : {}),
      });
      setAction(null);
      setText(
        kind === "review" ? "Verified review published." : "Session updated.",
      );
      await load();
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  const completed = rows.filter((r) => r.status === "completed");
  const upcoming = rows.filter(
    (r) =>
      ["pending", "accepted"].includes(r.status) &&
      new Date(r.dateTime) > new Date(),
  );
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Your sessions</h2>
        <Button variant="outline" onClick={load} disabled={loading}>
          Refresh sessions
        </Button>
      </div>
      {role === "teacher" && (
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Completed sessions", completed.length],
            ["Upcoming requests / sessions", upcoming.length],
            [
              "Estimated completed value (PKR)",
              completed.reduce((sum, s) => sum + s.price, 0).toLocaleString(),
            ],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold">{value}</p>
              </CardContent>
            </Card>
          ))}
          <p className="text-sm text-muted-foreground sm:col-span-3">
            Based on your most recent 200 sessions. Estimated value uses booking
            prices; this demo does not process or track payments.
          </p>
        </div>
      )}
      {!action && <Notice error={error} text={text} />}
      {loading ? (
        <p role="status">Loading sessions…</p>
      ) : !rows.length ? (
        <p>
          No sessions yet.{" "}
          {role === "student"
            ? "Find a tutor to request your first session."
            : "New student requests will appear here."}
        </p>
      ) : (
        rows.map((r) => (
          <Card key={r._id}>
            <CardContent className="flex flex-col justify-between gap-4 pt-6 md:flex-row">
              <div className="grid gap-1">
                <h3 className="font-semibold">
                  {r.subject} with{" "}
                  {role === "student" ? r.teacherId?.name : r.studentId?.name}
                </h3>
                <p className="text-sm">
                  {new Date(r.dateTime).toLocaleString()} · {r.duration} minutes
                  · {r.mode}
                </p>
                <p className="text-sm">
                  {r.status} · PKR {r.price.toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {(role === "teacher" && r.status === "pending"
                  ? ["accept", "reject"]
                  : role === "teacher" && r.status === "accepted"
                    ? ["complete"]
                    : []
                ).map((kind) => (
                  <Button
                    key={kind}
                    onClick={() => {
                      setError("");
                      setAction({ kind, row: r });
                    }}
                  >
                    {kind === "complete"
                      ? "Mark completed"
                      : kind === "accept"
                        ? "Accept"
                        : "Reject"}
                  </Button>
                ))}
                {["pending", "accepted"].includes(r.status) && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setError("");
                        setAction({ kind: "cancel", row: r });
                      }}
                    >
                      Cancel session
                    </Button>
                    {role === "student" &&
                      new Date(r.dateTime) > new Date() && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setError("");
                            setAction({ kind: "reschedule", row: r });
                          }}
                        >
                          Reschedule
                        </Button>
                      )}
                  </>
                )}
                {role === "student" &&
                  r.status === "completed" &&
                  (r.reviewed ? (
                    <span className="text-sm">Review submitted</span>
                  ) : (
                    <Button
                      onClick={() => {
                        setError("");
                        setAction({ kind: "review", row: r });
                      }}
                    >
                      Write review
                    </Button>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <Dialog
        open={!!action}
        onOpenChange={(open) => {
          if (!open && !busy) {
            setAction(null);
            setError("");
          }
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {action?.kind === "review"
                ? "Review completed session"
                : action?.kind === "reschedule"
                  ? "Reschedule session"
                  : "Confirm session change"}
            </DialogTitle>
            <DialogDescription>
              {action?.kind === "reschedule"
                ? "The new time needs tutor acceptance."
                : action?.kind === "review"
                  ? "Your review will be public and linked to this completed session."
                  : `Confirm ${action?.kind ?? ""} for this session. Completion is a tutor declaration; no attendance or payment is verified.`}
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4" onSubmit={submit}>
            {action?.kind === "reschedule" && <TimeFields />}
            {action?.kind === "review" && (
              <>
                <Field label="Rating">
                  <select className="field" name="rating" defaultValue="5">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} stars
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Your review">
                  <textarea
                    className="field"
                    name="review"
                    required
                    minLength={5}
                    maxLength={1500}
                  />
                </Field>
              </>
            )}
            <Notice error={error} />
            <Button disabled={busy}>{busy ? "Saving…" : "Confirm"}</Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => {
                setAction(null);
                setError("");
              }}
            >
              Go back
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
