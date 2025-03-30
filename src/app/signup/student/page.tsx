"use client";

import type React from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { StudentType } from "@/models/student";
import axios from "axios";

export default function StudentSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    educationLevel: "school" as "school" | "undergraduate" | "postgraduate",
    institution: "",
    subjects: [] as string[],
  });

  const subjects = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "Urdu",
    "History",
    "Geography",
    "Economics",
    "Accounting",
    "Business Studies",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => {
      const subjects = [...prev.subjects];
      if (subjects.includes(subject)) {
        return { ...prev, subjects: subjects.filter((s) => s !== subject) };
      } else {
        return { ...prev, subjects: [...subjects, subject] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error(
        "Passwords do not match. Please make sure your passwords match.",
      );
      return;
    }

    if (formData.subjects.length === 0) {
      toast.error(
        "Subject selection required. Please select at least one subject you're interested in.",
      );
      return;
    }

    setIsLoading(true);

    try {
      // Here you would normally make an API call to register the student
      // For now, we'll simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const studentData: StudentType = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        educationLevel: formData.educationLevel,
        institution: formData.institution,
        subjects: formData.subjects,
      };

      const resp = await axios.post("/api/students/signup", studentData, {
        validateStatus: (status) => status < 500,
      });

      if (resp.status !== 200) {
        toast.error("Registration failed:" + resp.data.message);
        throw new Error(resp.data.message);
      }

      toast.success(
        "Registration successful! Your account has been created. You can now login.",
      );
      // Redirect to login page after successful registration
      router.push("/login");
    } catch (error) {
      toast.error(
        "Registration failed. There was an error creating your account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto container py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
          <CardDescription>
            Create your student account to find tutors and book sessions on
            EduConnect Pakistan
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Educational Information</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="educationLevel">Education Level</Label>
                  <Select
                    value={formData.educationLevel}
                    onValueChange={(value) =>
                      handleSelectChange("educationLevel", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="undergraduate">
                        Undergraduate
                      </SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    name="institution"
                    placeholder="Enter your school/college/university"
                    value={formData.institution}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Subjects You're Interested In</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {subjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={`subject-${subject}`}
                        checked={formData.subjects.includes(subject)}
                        onCheckedChange={() => handleSubjectToggle(subject)}
                      />
                      <Label htmlFor={`subject-${subject}`} className="text-sm">
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Create Account"}
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
        </form>
      </Card>
    </div>
  );
}
