"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { User } from "@/lib/types";
import { TutorBrowser } from "./tutors";
import { Sessions } from "./sessions";
import { TutorProfile } from "./profile";
import { AdminTutors } from "./admin";
import { PasswordForm, Notice } from "./shared";
export function Dashboard({ user }: { user: User }) {
  const [tab, setTab] = useState(
      user.role === "student" ? "tutors" : "sessions",
    ),
    [revision, setRevision] = useState(0),
    [text, setText] = useState("");
  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8">
      <header>
        <p className="mb-2 text-sm text-muted-foreground">
          EduConnect · {user.role === "teacher" ? "Tutor" : user.role} dashboard
        </p>
        <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Synthetic portfolio demo. Do not enter private information or arrange
          real paid lessons.
        </p>
      </header>
      <Notice text={text} />
      {user.role === "admin" ? (
        <AdminTutors />
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            {user.role === "student" ? (
              <TabsTrigger value="tutors">Find tutors</TabsTrigger>
            ) : (
              <TabsTrigger value="profile">My profile</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="sessions">
            <Sessions role={user.role} revision={revision} />
          </TabsContent>
          {user.role === "student" ? (
            <TabsContent value="tutors">
              <TutorBrowser
                onBooked={() => {
                  setRevision((n) => n + 1);
                  setText("Booking requested. Your tutor can now accept it.");
                  setTab("sessions");
                }}
              />
            </TabsContent>
          ) : (
            <TabsContent value="profile">
              <TutorProfile />
            </TabsContent>
          )}
        </Tabs>
      )}
      <PasswordForm demo={user.demo} />
    </main>
  );
}
