import { Schema, model, models } from "mongoose";

//### Tutors Schema
//names
//qualifications
//bio
//subjects
//hourlyRate
//availability
//teachingPref

//TODO: Split schema into credentials and profile
export interface TeacherType {
  _id?: string;
  name: string;
  email?: string;
  password?: string;
  qualifications: string[];
  bio: string;
  yoe: number;
  subjects: string[];
  hourlyRate: number;
  averageRating?: number;
  availability: ("online" | "in-person" | "both")[];
  status: "approved" | "pending" | "rejected";
}

const teacherSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  qualifications: [{ type: String, required: true }],
  bio: { type: String, required: true },
  yoe: { type: Number, required: true },
  subjects: [{ type: String, required: true }],
  hourlyRate: { type: Number, required: true },
  averageRating: { type: Number, default: 0 },
  availability: [
    { type: String, enum: ["online", "in-person"], required: true },
  ],
  status: {
    type: String,
    enum: ["approved", "pending", "rejected"],
    default: "pending",
  },
});

const teacherModel = models.teacher ?? model("teacher", teacherSchema);

export default teacherModel;
