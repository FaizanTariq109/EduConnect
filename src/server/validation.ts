import { z } from "zod";
export const id = z.string().regex(/^[a-f0-9]{24}$/i, "Invalid record ID.");
export const password = z
  .string()
  .min(10)
  .max(72)
  .refine((v) => Buffer.byteLength(v, "utf8") <= 72, "Password is too long.");
export const email = z.string().trim().email().max(254).toLowerCase();
const text = z.string().trim().min(1).max(80);
export const profile = z
  .object({
    name: text,
    qualifications: z.array(text).min(1).max(10),
    bio: z.string().trim().min(20).max(1500),
    yoe: z.number().int().min(0).max(60),
    subjects: z.array(text).min(1).max(10),
    hourlyRate: z.number().int().min(100).max(20000),
    availability: z
      .array(z.enum(["online", "in-person"]))
      .min(1)
      .max(2),
  })
  .strict();
export const tutorSignup = profile.extend({ email, password });
export const studentSignup = z
  .object({
    name: text,
    email,
    password,
    subjects: z.array(text).min(1).max(10),
    educationLevel: z.enum(["school", "undergraduate", "postgraduate"]),
    institution: text,
  })
  .strict();
export const booking = z
  .object({
    teacherId: id,
    dateTime: z.iso.datetime({ offset: true }),
    duration: z.union([
      z.literal(30),
      z.literal(60),
      z.literal(90),
      z.literal(120),
    ]),
    subject: text,
    mode: z.enum(["online", "in-person"]),
  })
  .strict();
export const reschedule = booking
  .omit({ teacherId: true, subject: true, mode: true })
  .extend({ sessionID: id })
  .strict();
export const review = z
  .object({
    sessionID: id,
    rating: z.number().int().min(1).max(5),
    review: z.string().trim().min(5).max(1500),
  })
  .strict();
export function validStart(value: string, now = Date.now()) {
  const time = new Date(value).getTime();
  if (
    time < now + 5 * 60000 ||
    time > now + 180 * 86400000 ||
    time % (15 * 60000) !== 0
  )
    throw new Error(
      "Choose a 15-minute start time at least 5 minutes ahead and within 180 days.",
    );
  return new Date(time);
}
