import type { Model } from "mongoose";
import bcrypt from "bcryptjs";
import { Student, Teacher, Admin, ensureIndexes } from "../src/server/models";
export const demoPassword = "EduConnect-Demo-2026!";
export async function seedDemo() {
  await ensureIndexes();
  const password = await bcrypt.hash(demoPassword, 12);
  type SeedAccount = {
    model: Model<{ email: string; demo: boolean }>;
    email: string;
    data: Record<string, unknown>;
  };
  const accounts = [
    {
      model: Student,
      email: "student@educonnect.example",
      data: {
        name: "Demo Student",
        subjects: ["Mathematics"],
        educationLevel: "undergraduate",
        institution: "Synthetic Demo University",
      },
    },
    {
      model: Teacher,
      email: "tutor@educonnect.example",
      data: {
        name: "Demo Tutor",
        qualifications: ["Demo MSc Mathematics"],
        bio: "Synthetic tutor profile for exploring the EduConnect booking and review journey.",
        subjects: ["Mathematics", "Physics"],
        yoe: 3,
        hourlyRate: 1000,
        availability: ["online", "in-person"],
        status: "approved",
      },
    },
    {
      model: Teacher,
      email: "pending@educonnect.example",
      data: {
        name: "Demo Computer Science Tutor",
        qualifications: ["Demo BSc Computer Science"],
        bio: "Synthetic computer science tutor profile for exploring the EduConnect verification and booking journey.",
        subjects: ["Computer Science"],
        yoe: 1,
        hourlyRate: 800,
        availability: ["online"],
        status: "pending",
      },
    },
    {
      model: Admin,
      email: "admin@educonnect.example",
      data: { name: "Demo Admin", position: "Synthetic demo administrator" },
    },
  ];
  for (const entry of accounts) {
    const { email, data } = entry;
    const model = entry.model as unknown as SeedAccount["model"];
    const existing = await model.findOne({ email });
    if (existing && !existing.demo)
      throw new Error(
        "Refusing to alter an account not marked as synthetic demo data.",
      );
    await model.updateOne(
      { email },
      {
        $setOnInsert: { ...data, email, password, demo: true, tokenVersion: 0 },
      },
      { upsert: true, runValidators: true },
    );
  }
}
