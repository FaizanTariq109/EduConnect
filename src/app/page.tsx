import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-1">
        <section className="mx-auto w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="mx-auto container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter  sm:text-5xl xl:text-6xl/none">
                    EduConnect Pakistan
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connecting students with qualified tutors for personalized
                    learning experiences.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/login">
                    <Button className="w-full">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full" variant="outline">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-80 md:h-96 lg:h-full rounded-lg overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-primary/60 opacity-90 rounded-lg"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-bold">Join Our Platform</h2>
                      <p className="max-w-[80%] mx-auto">
                        Find the perfect tutor or become one today
                      </p>
                      <Link href="/signup">
                        <Button variant="secondary" className="mt-4">
                          Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="mx-auto container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Platform Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Discover what EduConnect Pakistan has to offer for students
                  and tutors.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M17 6.1H3"></path>
                    <path d="M21 12.1H3"></path>
                    <path d="M15.1 18H3"></path>
                  </svg>
                </div>
                <div className="space-y-2 flex flex-col items-center justify-center">
                  <h3 className="text-xl text-center font-bold">Find Tutors</h3>
                  <p className="text-muted-foreground text-center">
                    Search and filter tutors based on subject, location, price,
                    and availability.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <rect
                      width="18"
                      height="18"
                      x="3"
                      y="4"
                      rx="2"
                      ry="2"
                    ></rect>
                    <line x1="16" x2="16" y1="2" y2="6"></line>
                    <line x1="8" x2="8" y1="2" y2="6"></line>
                    <line x1="3" x2="21" y1="10" y2="10"></line>
                    <path d="M8 14h.01"></path>
                    <path d="M12 14h.01"></path>
                    <path d="M16 14h.01"></path>
                    <path d="M8 18h.01"></path>
                    <path d="M12 18h.01"></path>
                    <path d="M16 18h.01"></path>
                  </svg>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-center">
                    Book Sessions
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Schedule and manage tutoring sessions with your preferred
                    tutors.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5Z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <div className="space-y-2 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-center">
                    Track Progress
                  </h3>
                  <p className="text-muted-foreground text-center">
                    Monitor your learning journey and manage your educational
                    goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-background border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} EduConnect Pakistan. All
                rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
