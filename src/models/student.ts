import { Schema, model, models } from "mongoose";

export interface StudentType {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  subjects: string[];
  educationLevel: "school" | "undergraduate" | "postgraduate";
  institution: string;
}

const stdSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  subjects: [{ type: String, required: true }],
  educationLevel: {
    type: String,
    enum: ["school", "undergraduate", "postgraduate"],
    required: true,
  },
  institution: { type: String, required: true },
});

const stdModel = models.student ?? model("student", stdSchema);

export default stdModel;
