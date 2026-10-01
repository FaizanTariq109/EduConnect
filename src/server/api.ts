import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { z, ZodError } from "zod";
import { connect } from "../db/db";
import { Student, Teacher, Admin, Session, Slot, Review } from "./models";
import {
  HttpError,
  requireUser,
  signSession,
  setSession,
  cookieName,
  cookieOptions,
  checkOrigin,
  rateLimit,
} from "./security";
import * as v from "./validation";
import type { User } from "../lib/types";
const publicTutor =
  "name qualifications bio yoe subjects hourlyRate averageRating reviewCount availability status";
const ok = (body: unknown, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function body(req: NextRequest) {
  const reader = req.body?.getReader();
  if (!reader) throw new HttpError(400, "A request body is required.");
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 16384) {
      await reader.cancel();
      throw new HttpError(413, "Request is too large.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
function start(value: string) {
  try {
    return v.validStart(value);
  } catch (e) {
    throw new HttpError(400, (e as Error).message);
  }
}
function slots(
  student: string,
  tutor: string,
  date: Date,
  duration: number,
  sessionId: mongoose.Types.ObjectId,
) {
  const rows = [];
  for (let minutes = 0; minutes < duration; minutes += 15) {
    for (const owner of [`student:${student}`, `teacher:${tutor}`])
      rows.push({
        owner,
        time: new Date(date.getTime() + minutes * 60000),
        sessionId,
      });
  }
  return rows;
}
function owner(user: User) {
  return user.role === "student"
    ? { studentId: user.id }
    : { teacherId: user.id };
}
async function mySessions(user: User) {
  const rows = await Session.find(owner(user))
    .sort({ dateTime: -1 })
    .limit(200)
    .populate("teacherId", "name")
    .populate("studentId", "name")
    .lean();
  const reviews = await Review.find({
    sessionId: { $in: rows.map((r) => r._id) },
  })
    .select("sessionId")
    .lean();
  const ids = new Set(reviews.map((r) => String(r.sessionId)));
  return rows.map((r) => ({ ...r, reviewed: ids.has(String(r._id)) }));
}
export function handler(action: string) {
  return async (req: NextRequest) => {
    try {
      checkOrigin(req);
      if (
        ["admin/signup", "teachers/bulkSignup", "sessions/delete"].includes(
          action,
        )
      )
        throw new HttpError(410, "This operation is not available.");
      if (action === "logout") {
        const res = ok({ message: "Signed out." });
        res.cookies.set(cookieName, "", { ...cookieOptions(), maxAge: 0 });
        res.cookies.delete("token");
        res.cookies.delete("type");
        return res;
      }
      if (action === "login") {
        const d = z
          .object({
            email: v.email,
            password: z.string().min(1).max(72),
            type: z.enum(["student", "teacher", "admin"]),
          })
          .strict()
          .parse(await body(req));
        await rateLimit(`login:${d.type}:${d.email}`, 25);
        const account =
          d.type === "student"
            ? await Student.findOne({ email: d.email }).select("+password")
            : d.type === "teacher"
              ? await Teacher.findOne({ email: d.email }).select("+password")
              : await Admin.findOne({ email: d.email }).select("+password");
        if (!account || !(await bcrypt.compare(d.password, account.password)))
          throw new HttpError(401, "Invalid email, password or role.");
        const user = {
          id: account.id,
          name: account.name,
          email: account.email,
          role: d.type,
          demo: account.demo,
        };
        const response = ok({ user });
        setSession(
          response,
          signSession(account.id, d.type, account.tokenVersion),
        );
        return response;
      }
      if (action === "students/signup" || action === "teachers/signup") {
        const d =
          action === "students/signup"
            ? v.studentSignup.parse(await body(req))
            : v.tutorSignup.parse(await body(req));
        await rateLimit("signup:global", 100, 60);
        await rateLimit(`signup:${d.email}`, 5, 60);
        const data = { ...d, password: await bcrypt.hash(d.password, 12) };
        if (action === "students/signup") await Student.create(data);
        else
          await Teacher.create({
            ...data,
            status: "pending",
            averageRating: 0,
            reviewCount: 0,
          });
        return ok({ message: "Account created. Please sign in." }, 201);
      }
      if (action === "teachers/getAll") {
        await connect();
        const profiles = await Teacher.find({ status: "approved" })
          .select(publicTutor)
          .sort({ name: 1 })
          .limit(200)
          .lean();
        return ok({ profiles });
      }
      if (action === "reviews/list") {
        const tutorId = v.id.parse(req.nextUrl.searchParams.get("teacherId"));
        await connect();
        if (!(await Teacher.exists({ _id: tutorId, status: "approved" })))
          throw new HttpError(404, "Tutor not found.");
        const reviews = await Review.find({ teacherId: tutorId })
          .select("studentId rating review createdAt")
          .populate("studentId", "name")
          .sort({ createdAt: -1 })
          .limit(50)
          .lean();
        return ok({ reviews });
      }
      const roles = action.startsWith("admin/")
        ? ["admin" as const]
        : action === "edit/teacher"
          ? ["teacher" as const]
          : action === "sessions/book" ||
              action === "sessions/reschedule" ||
              action === "review"
            ? ["student" as const]
            : action === "sessions/accept" ||
                action === "sessions/reject" ||
                action === "sessions/complete"
              ? ["teacher" as const]
              : action.startsWith("sessions/")
                ? ["student" as const, "teacher" as const]
                : ["student" as const, "teacher" as const, "admin" as const];
      const user = await requireUser(req, roles);
      if (req.method !== "GET") await rateLimit(`write:${user.id}`, 100);
      if (action === "auth") return ok({ user });
      if (action === "me") {
        const profile =
          user.role === "teacher"
            ? await Teacher.findById(user.id).select(
                publicTutor + " verificationComment",
              )
            : user.role === "student"
              ? await Student.findById(user.id).select(
                  "name subjects educationLevel institution",
                )
              : await Admin.findById(user.id).select("name position");
        return ok({ user, profile });
      }
      if (action === "account/password") {
        if (user.demo)
          throw new HttpError(
            403,
            "Shared demo account passwords cannot be changed.",
          );
        const d = z
          .object({
            currentPassword: z.string().min(1).max(72),
            newPassword: v.password,
          })
          .strict()
          .parse(await body(req));
        const account =
          user.role === "student"
            ? await Student.findById(user.id).select("+password")
            : user.role === "teacher"
              ? await Teacher.findById(user.id).select("+password")
              : await Admin.findById(user.id).select("+password");
        if (
          !account ||
          !(await bcrypt.compare(d.currentPassword, account.password))
        )
          throw new HttpError(403, "Current password is incorrect.");
        account.password = await bcrypt.hash(d.newPassword, 12);
        account.tokenVersion += 1;
        await account.save();
        const res = ok({ message: "Password changed. Please sign in again." });
        res.cookies.set(cookieName, "", { ...cookieOptions(), maxAge: 0 });
        return res;
      }
      if (action === "edit/teacher") {
        const d = v.profile.parse(await body(req));
        const tutor = await Teacher.findOneAndUpdate(
          { _id: user.id },
          { $set: d },
          { new: true, runValidators: true },
        ).select(publicTutor + " verificationComment");
        return ok({ profile: tutor });
      }
      if (action === "admin/teachers") {
        const profiles = await Teacher.find()
          .select(publicTutor + " verificationComment verifiedAt")
          .sort({ createdAt: -1 })
          .limit(200)
          .lean();
        const totals = await Teacher.aggregate<{ _id: string; count: number }>([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]);
        const counts = { pending: 0, approved: 0, rejected: 0 };
        for (const row of totals)
          if (row._id in counts)
            counts[row._id as keyof typeof counts] = row.count;
        return ok({ profiles, counts });
      }
      if (action === "admin/teacher/status") {
        const d = z
          .object({
            id: v.id,
            status: z.enum(["approved", "rejected"]),
            comment: z.string().trim().max(500).default(""),
          })
          .strict()
          .parse(await body(req));
        const tutor = await Teacher.findOneAndUpdate(
          { _id: d.id, status: "pending" },
          {
            $set: {
              status: d.status,
              verificationComment: d.comment,
              verifiedAt: new Date(),
            },
          },
          { new: true, runValidators: true },
        ).select(publicTutor + " verificationComment");
        if (!tutor)
          throw new HttpError(
            409,
            "This tutor is no longer pending. Refresh the list.",
          );
        return ok({ profile: tutor });
      }
      if (action === "sessions/getAll")
        return ok({ sessions: await mySessions(user) });
      if (action === "sessions/date/available")
        throw new HttpError(
          410,
          "Choose a time when booking; availability is checked securely on submission.",
        );
      if (action === "sessions/book") {
        const d = v.booking.parse(await body(req));
        const dateTime = start(d.dateTime);
        let createdId = "";
        await mongoose.connection.transaction(async (tx) => {
          const tutor = await Teacher.findOne({
            _id: d.teacherId,
            status: "approved",
          }).session(tx);
          if (!tutor) throw new HttpError(404, "Approved tutor not found.");
          if (
            !tutor.subjects.includes(d.subject) ||
            !tutor.availability.includes(d.mode)
          )
            throw new HttpError(
              400,
              "Choose a subject and teaching mode offered by this tutor.",
            );
          const sessionId = new mongoose.Types.ObjectId();
          await Slot.insertMany(
            slots(user.id, tutor.id, dateTime, d.duration, sessionId),
            { session: tx, ordered: true },
          );
          await Session.create(
            [
              {
                _id: sessionId,
                studentId: user.id,
                teacherId: tutor.id,
                dateTime,
                duration: d.duration,
                mode: d.mode,
                subject: d.subject,
                status: "pending",
                hourlyRate: tutor.hourlyRate,
                price: Math.round((tutor.hourlyRate * d.duration) / 60),
              },
            ],
            { session: tx },
          );
          createdId = String(sessionId);
        });
        return ok({ message: "Session requested.", sessionId: createdId }, 201);
      }
      if (action === "sessions/reschedule") {
        const d = v.reschedule.parse(await body(req));
        const dateTime = start(d.dateTime);
        await mongoose.connection.transaction(async (tx) => {
          const row = await Session.findOne({
            _id: d.sessionID,
            studentId: user.id,
            status: { $in: ["pending", "accepted"] },
            dateTime: { $gt: new Date() },
          }).session(tx);
          if (!row)
            throw new HttpError(404, "Reschedulable session not found.");
          if (
            !(await Teacher.exists({
              _id: row.teacherId,
              status: "approved",
            }).session(tx))
          )
            throw new HttpError(409, "Tutor is no longer approved.");
          await Slot.deleteMany({ sessionId: row._id }).session(tx);
          await Slot.insertMany(
            slots(
              user.id,
              String(row.teacherId),
              dateTime,
              d.duration,
              row._id,
            ),
            { session: tx },
          );
          row.dateTime = dateTime;
          row.duration = d.duration;
          row.price = Math.round((row.hourlyRate * d.duration) / 60);
          row.status = "pending";
          await row.save({ session: tx });
        });
        return ok({ message: "Rescheduled; awaiting tutor acceptance." });
      }
      if (
        [
          "sessions/accept",
          "sessions/reject",
          "sessions/cancel",
          "sessions/complete",
        ].includes(action)
      ) {
        const d = z
          .object({ sessionID: v.id })
          .strict()
          .parse(await body(req));
        const target =
          action === "sessions/accept"
            ? "accepted"
            : action === "sessions/reject"
              ? "rejected"
              : action === "sessions/cancel"
                ? "cancelled"
                : "completed";
        const allowed =
          target === "completed"
            ? ["accepted"]
            : target === "cancelled"
              ? ["pending", "accepted"]
              : ["pending"];
        await mongoose.connection.transaction(async (tx) => {
          const row = await Session.findOneAndUpdate(
            { _id: d.sessionID, ...owner(user), status: { $in: allowed } },
            { $set: { status: target } },
            { new: true, session: tx, runValidators: true },
          );
          if (!row)
            throw new HttpError(
              409,
              "Session is unavailable or this change is not allowed.",
            );
          if (target === "rejected" || target === "cancelled")
            await Slot.deleteMany({ sessionId: row._id }).session(tx);
        });
        return ok({ message: `Session ${target}.` });
      }
      if (action === "review") {
        const d = v.review.parse(await body(req));
        await mongoose.connection.transaction(async (tx) => {
          const row = await Session.findOne({
            _id: d.sessionID,
            studentId: user.id,
            status: "completed",
          }).session(tx);
          if (!row)
            throw new HttpError(
              403,
              "Only your completed sessions can be reviewed.",
            );
          await Review.create(
            [
              {
                sessionId: row._id,
                studentId: user.id,
                teacherId: row.teacherId,
                rating: d.rating,
                review: d.review,
              },
            ],
            { session: tx },
          );
          const stats = await Review.aggregate<{
            average: number;
            count: number;
          }>([
            { $match: { teacherId: row.teacherId } },
            {
              $group: {
                _id: null,
                average: { $avg: "$rating" },
                count: { $sum: 1 },
              },
            },
          ]).session(tx);
          await Teacher.updateOne(
            { _id: row.teacherId },
            {
              $set: {
                averageRating: stats[0].average,
                reviewCount: stats[0].count,
              },
            },
            { session: tx },
          );
        });
        return ok({ message: "Verified review published." }, 201);
      }
      throw new HttpError(404, "Operation not found.");
    } catch (error) {
      if (error instanceof HttpError)
        return ok({ message: error.message }, error.status);
      if (error instanceof ZodError)
        return ok(
          {
            message: "Please check the form fields.",
            fields: error.issues.map((i) => ({
              field: i.path.join("."),
              message: i.message,
            })),
          },
          400,
        );
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      )
        return ok(
          {
            message:
              "This record already exists, or the student/tutor time slot is already reserved.",
          },
          409,
        );
      // Log only the exception category, never request payloads, tokens, hashes or connection strings.
      console.error(
        "EduConnect request failed:",
        error instanceof Error ? error.name : "UnknownError",
      );
      return ok(
        {
          message: "The service is temporarily unavailable. Please try again.",
        },
        503,
      );
    }
  };
}
