"use client";
import Link from "next/link";
import { useState } from "react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { api, message } from "@/lib/client-api";
import { toast } from "sonner";
export default function Navbar() {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  async function logout() {
    setBusy(true);
    try {
      await api("logout", {});
      window.location.assign("/login");
    } catch (e) {
      toast.error(message(e));
      setBusy(false);
    }
  }
  return (
    <header className="border-b">
      <nav className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookOpen size={22} />
          EduConnect
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/about">About</Link>
          {loading ? (
            <span>Loading…</span>
          ) : user ? (
            <>
              <Link href={"/dashboard/" + user.role}>Dashboard</Link>
              <Button
                size="sm"
                variant="outline"
                onClick={logout}
                disabled={busy}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Button asChild size="sm">
                <Link href="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
