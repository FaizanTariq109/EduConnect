import { Schema, model, models } from "mongoose";
import { TeacherType } from "@/models/teacher";
import { StudentType } from "@/models/student";

// This is the schema that holds information about the session
export interface SessionType {
  _id?: string;
  // The two ppls within the session
  teacherId: string | TeacherType;
  studentId: string | StudentType;
  // The date and time of the session
  dateTime: string;
  duration: number;
  // The status of the session
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  subject: string;
}

const sessionSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: "teacher" },
  studentId: { type: Schema.Types.ObjectId, ref: "student" },
  dateTime: Date,
  duration: Number,
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
  },
  subject: String,
});

const sessionModel =
  models.session || model<SessionType>("session", sessionSchema);

export default sessionModel;
