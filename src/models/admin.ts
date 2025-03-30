import { Schema, model, models } from "mongoose";

export interface AdminType {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  position: string;
  code?: string;
}

const adminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  position: { type: String, required: true },
});

const adminModel = models.admin ?? model("admin", adminSchema);

export default adminModel;
