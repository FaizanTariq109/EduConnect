import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export default function Signup() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-3">Join EduConnect</h1>
      <p className="text-muted-foreground mb-8">
        A tutoring-platform demonstration. Use synthetic details, not personal
        information.
      </p>
      <div className="grid sm:grid-cols-2 gap-6">
        {[
          [
            "student",
            "Learn with a tutor",
            "Find a tutor, request a session and share a verified review.",
          ],
          [
            "teacher",
            "Become a tutor",
            "Build your profile and manage session requests after admin approval.",
          ],
        ].map(([role, title, detail]) => (
          <Card key={role}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-5">{detail}</p>
              <Button asChild>
                <Link href={"/signup/" + role}>
                  Continue as {role === "teacher" ? "tutor" : role}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
