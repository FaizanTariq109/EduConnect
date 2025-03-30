"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BookOpen, GraduationCap, UserCog } from "lucide-react";

export default function SignupPage() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const handleContinue = () => {
    if (userRole) {
      router.push(`/signup/${userRole}`);
    }
  };

  return (
    <div className="mx-auto container flex items-center justify-center min-h-[calc(100vh-4rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            Create an account
          </CardTitle>
          <CardDescription>
            Choose your role to get started with EduConnect Pakistan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={userRole || ""}
            onValueChange={setUserRole}
            className="grid gap-4"
          >
            <div className="flex items-start space-x-4 rounded-md border p-4">
              <RadioGroupItem value="student" id="student" className="mt-1" />
              <div className="flex flex-1 flex-col">
                <Label
                  htmlFor="student"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <GraduationCap className="h-5 w-5" />
                  Student
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Find tutors, book sessions, and track your learning progress
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 rounded-md border p-4">
              <RadioGroupItem value="teacher" id="teacher" className="mt-1" />
              <div className="flex flex-1 flex-col">
                <Label
                  htmlFor="teacher"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <BookOpen className="h-5 w-5" />
                  Teacher/Tutor
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your profile, manage sessions, and track earnings
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4 rounded-md border p-4">
              <RadioGroupItem value="admin" id="admin" className="mt-1" />
              <div className="flex flex-1 flex-col">
                <Label
                  htmlFor="admin"
                  className="flex items-center gap-2 text-base font-medium"
                >
                  <UserCog className="h-5 w-5" />
                  Administrator
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Verify tutors, manage platform, and view analytics
                </p>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            onClick={handleContinue}
            className="w-full"
            disabled={!userRole}
          >
            Continue
          </Button>
          <div className="text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
