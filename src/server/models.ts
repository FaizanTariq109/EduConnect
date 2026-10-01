import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
const account = {
  name: { type: String, required: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  demo: { type: Boolean, default: false },
  tokenVersion: { type: Number, default: 0 },
};
const studentSchema = new Schema(
  {
    ...account,
    subjects: [String],
    educationLevel: {
      type: String,
      enum: ["school", "undergraduate", "postgraduate"],
      required: true,
    },
    institution: { type: String, required: true },
  },
  { timestamps: true },
);
const teacherSchema = new Schema(
  {
    ...account,
    qualifications: [String],
    bio: { type: String, required: true },
    yoe: { type: Number, required: true, min: 0, max: 60 },
    subjects: [String],
    hourlyRate: { type: Number, required: true, min: 100, max: 20000 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    availability: [String],
    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "pending",
      required: true,
    },
    verificationComment: { type: String, default: "" },
    verifiedAt: Date,
  },
  { timestamps: true },
);
const adminSchema = new Schema(
  { ...account, position: { type: String, default: "Demo administrator" } },
  { timestamps: true },
);
const sessionSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "student", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "teacher", required: true },
    dateTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    mode: { type: String, enum: ["online", "in-person"], required: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
      required: true,
    },
    hourlyRate: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { timestamps: true },
);
sessionSchema.index({ studentId: 1, dateTime: 1 });
sessionSchema.index({ teacherId: 1, dateTime: 1 });
// Every 15-minute interval reserves both participants inside the same transaction.
const slotSchema = new Schema({
  owner: { type: String, required: true },
  time: { type: Date, required: true },
  sessionId: { type: Schema.Types.ObjectId, required: true },
});
slotSchema.index({ owner: 1, time: 1 }, { unique: true });
slotSchema.index({ sessionId: 1 });
const reviewSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "session",
      required: true,
      unique: true,
    },
    studentId: { type: Schema.Types.ObjectId, ref: "student", required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "teacher", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review: { type: String, required: true, maxlength: 1500 },
  },
  { timestamps: true },
);
reviewSchema.index({ teacherId: 1, createdAt: -1 });
const limitSchema = new Schema({
  _id: String,
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
});
limitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
function existing<T>(name: string, schema: Schema<T>) {
  return (
    (mongoose.models[name] as Model<T> | undefined) ??
    mongoose.model<T>(name, schema)
  );
}
export const Student = existing<InferSchemaType<typeof studentSchema>>(
  "student",
  studentSchema,
);
export const Teacher = existing<InferSchemaType<typeof teacherSchema>>(
  "teacher",
  teacherSchema,
);
export const Admin = existing<InferSchemaType<typeof adminSchema>>(
  "admin",
  adminSchema,
);
export const Session = existing<InferSchemaType<typeof sessionSchema>>(
  "session",
  sessionSchema,
);
export const Slot = existing<InferSchemaType<typeof slotSchema>>(
  "reservation",
  slotSchema,
);
export const Review = existing<InferSchemaType<typeof reviewSchema>>(
  "review",
  reviewSchema,
);
export const RateLimit = existing<InferSchemaType<typeof limitSchema>>(
  "rateLimit",
  limitSchema,
);
export async function ensureIndexes() {
  await Promise.all(
    [Student, Teacher, Admin, Session, Slot, Review, RateLimit].map((m) =>
      m.createIndexes(),
    ),
  );
}
