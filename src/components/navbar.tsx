"use client";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export default function Navbar() {
  const { isAuth, setIsAuth } = useAuth(); // Get authentication state
  const [loading, setLoading] = useState(false);

  const logout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        setIsAuth(false, "", ""); // Update context
        window.location.href = "/";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="w-full border-b bg-background">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <span className="text-lg hidden sm:block font-semibold">
            EduConnect
          </span>
        </Link>
        <nav className="ml-auto flex gap-2 sm:gap-6">
          <Link
            href="/about"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            Contact
          </Link>
        </nav>
        <div className="ml-2 flex items-center gap-2">
          {isAuth.auth ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={logout}
              disabled={loading}
            >
              {loading ? "Logging out..." : "Logout"}
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
