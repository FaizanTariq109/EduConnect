"use client";
import { useState } from "react";
import Link from "next/link";
import { api, message } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function Login() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const f = new FormData(e.currentTarget);
              try {
                const result = await api<{ user: { role: string } }>(
                  "login",
                  Object.fromEntries(f),
                );
                window.location.assign("/dashboard/" + result.user.role);
              } catch (err) {
                setError(message(err));
                setBusy(false);
              }
            }}
          >
            <label className="block">
              Role
              <select name="type" className="field" defaultValue="student">
                <option value="student">Student</option>
                <option value="teacher">Tutor</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="block">
              Email
              <Input
                name="email"
                type="email"
                autoComplete="username"
                required
              />
            </label>
            <label className="block">
              Password
              <Input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                maxLength={72}
              />
            </label>
            {error && (
              <p role="alert" className="text-red-500">
                {error}
              </p>
            )}
            <Button disabled={busy} className="w-full">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-sm">
            New here?{" "}
            <Link href="/signup" className="underline">
              Create a student or tutor account
            </Link>
            .
          </p>
        </CardContent>
      </Card>
      <details className="mt-6 rounded-lg border p-4">
        <summary className="cursor-pointer font-medium">
          Try the synthetic demo accounts
        </summary>
        <p className="mt-3 text-sm">
          Shared demonstration accounts. Changes are visible to other visitors.
          Do not enter personal or sensitive information.
        </p>
        <ul className="my-3 text-sm space-y-1">
          <li>Student: student@educonnect.example</li>
          <li>Tutor: tutor@educonnect.example</li>
          <li>Admin: admin@educonnect.example</li>
        </ul>
        <p className="text-sm">
          Password for each: <code>EduConnect-Demo-2026!</code>
        </p>
      </details>
    </main>
  );
}
