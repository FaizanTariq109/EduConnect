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
import { toast } from "sonner";
import { AdminType } from "@/models/admin";
import axios from "axios";

export default function AdminSignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    position: "",
    adminCode: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    // Validate admin code (in a real app, this would be checked on the server)
    if (formData.adminCode !== "ADMIN123") {
      toast.error(
        "Invalid admin code. The admin code you entered is not valid.",
      );
      return;
    }

    setIsLoading(true);

    try {
      // Here you would normally make an API call to register the admin
      // For now, we'll simulate a successful registration
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const adminData: AdminType = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        position: formData.position,
        code: formData.adminCode,
      };
      const resp = await axios.post("/api/admin/signup", adminData, {
        validateStatus: (status) => status < 500,
      });
      if (resp.status !== 200) {
        toast.error("Registration failed. Please try again.");
        throw new Error(resp.data.message);
      }
      toast.success(
        "Registration successful! Your admin account has been created. You can now login.",
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
          <CardTitle>Administrator Registration</CardTitle>
          <CardDescription>
            Create your administrator account to manage the EduConnect Pakistan
            platform
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
              <h3 className="text-lg font-medium">
                Administrative Information
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="e.g., Platform Manager"
                    value={formData.position}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminCode">Admin Code</Label>
                  <Input
                    id="adminCode"
                    name="adminCode"
                    type="password"
                    placeholder="Enter admin verification code"
                    value={formData.adminCode}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 my-6">
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
