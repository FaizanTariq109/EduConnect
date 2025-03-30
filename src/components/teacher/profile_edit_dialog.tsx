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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { TeacherType } from "@/models/teacher";

import axios from "axios";

export function ProfileEdit({ teacher }: { teacher: TeacherType | undefined }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  if (!teacher) {
    return <div>Teacher not found</div>;
  }
  const [formData, setFormData] = useState({
    _id: teacher._id!,
    name: teacher.name,
    email: teacher.email ?? "",
    password: "",
    confirmPassword: "",
    qualification: teacher.qualifications.join(" "),
    hourlyRate: teacher.hourlyRate,
    experience: teacher.yoe.toString(),
    bio: teacher.bio,
    subjects: teacher.subjects,
    availability: teacher.availability,
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    // Dealing with availability
    if (name === "availability") {
      if (value === "both") {
        return setFormData((prev) => ({
          ...prev,
          availability: ["online", "in-person"],
        }));
      } else if (value === "online") {
        return setFormData((prev) => ({ ...prev, availability: ["online"] }));
      } else {
        return setFormData((prev) => ({
          ...prev,
          availability: ["in-person"],
        }));
      }
    }
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
        "Subject selection required. Please select at least one subject you can teach.",
      );
      return;
    }

    if (formData.hourlyRate < 500 || formData.hourlyRate > 5000) {
      toast.error("Hourly rate must be between 500 and 5000 PKR.");
      return;
    }

    setIsLoading(true);

    try {
      // Here you would normally make an API call to register the teacher
      // For now, we'll simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const teacherObject: TeacherType = {
        _id: formData._id,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        qualifications: formData.qualification.split(" ").map((q) => q.trim()),
        yoe: Number(formData.experience),
        hourlyRate: formData.hourlyRate,
        bio: formData.bio,
        subjects: formData.subjects,
        availability: formData.availability,
        status: "pending",
      };
      const resp = await axios.post("/api/edit/teacher", teacherObject, {
        validateStatus: (status) => status < 500,
      });
      //console.log(resp)
      if (resp.status !== 200) {
        toast.error("Edit failed:" + resp.data.message);
        throw new Error(resp.data.message);
      }
      toast.success("Edit successful! Your account has been edited.");
      // Redirect to login page after successful registration
      router.push("/login");
    } catch (error: any) {
      //console.log(error)
      toast.error("Edit failed." + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
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
              <h3 className="text-lg font-medium">Professional Information</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="qualification">Highest Qualification</Label>
                  <Input
                    id="qualification"
                    name="qualification"
                    placeholder="e.g., MSc Mathematics"
                    value={formData.qualification}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    placeholder="e.g., 5 years"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (PKR)</Label>
                <Input
                  id="hourlyRate"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  required
                  onChange={handleChange}
                  min={500}
                  max={5000}
                />
                <Slider
                  id="hourlyRate"
                  name="hourlyRate"
                  min={500}
                  max={5000}
                  defaultValue={[formData.hourlyRate]}
                  value={[formData.hourlyRate]}
                  onValueChange={(e) =>
                    setFormData((prev) => ({ ...prev, hourlyRate: e[0] }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell students about yourself, your teaching style, and experience"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Subjects You Can Teach</Label>
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

              <div className="space-y-2">
                <Label htmlFor="teachingMode">Preferred Teaching Mode</Label>
                <Select
                  value={
                    formData.availability.length === 1
                      ? formData.availability[0]
                      : "both"
                  }
                  onValueChange={(value) =>
                    handleSelectChange("availability", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teaching mode" />
                  </SelectTrigger>
                  <SelectContent defaultValue={formData.availability}>
                    <SelectItem value="online">Online Only</SelectItem>
                    <SelectItem value="in-person">In-Person Only</SelectItem>
                    <SelectItem value="both">
                      Both Online and In-Person
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Editing Account..." : "Edit Account"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
