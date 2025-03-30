import { Schema, model, models } from "mongoose";
import { TeacherType } from "./teacher";
import { StudentType } from "./student";

export interface ReviewType {
  _id?: string;
  teacherId: string | TeacherType;
  studentId: string | StudentType;
  rating: number;
  review: string;
}

export const reviewSchema = new Schema({
  teacherId: { type: Schema.Types.ObjectId, ref: "teacher" },
  studentId: { type: Schema.Types.ObjectId, ref: "student" },
  rating: { type: Number, min: 1, max: 5 },
  review: String,
});

const reviewModel = models.review || model<ReviewType>("review", reviewSchema);

export default reviewModel;
