import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { NextRequest } from "next/server";
import { handler } from "../src/server/api";
import { connect } from "../src/db/db";
import { Student, Teacher, Session, Review, Slot } from "../src/server/models";
import {
  authenticate,
  signSession,
  cookieName,
  cookieOptions,
} from "../src/server/security";
import { seedDemo, demoPassword } from "../scripts/demo-data";
let db: MongoMemoryReplSet;
let student = "",
  tutor = "",
  admin = "",
  otherStudent = "",
  otherTutor = "",
  teacherId = "",
  pendingId = "";
const origin = "http://localhost:3008";
const future = (hours = 24) =>
  new Date(
    Math.ceil(Date.now() / 900000) * 900000 + hours * 3600000,
  ).toISOString();
async function request(
  action: string,
  token = "",
  data?: unknown,
  requestOrigin = origin,
) {
  const r = await handler(action)(
    new NextRequest(origin + "/api/" + action, {
      method: data === undefined ? "GET" : "POST",
      headers: {
        ...(token ? { cookie: `${cookieName}=${token}; type=admin` } : {}),
        ...(data === undefined
          ? {}
          : { origin: requestOrigin, "content-type": "application/json" }),
      },
      ...(data === undefined ? {} : { body: JSON.stringify(data) }),
    }),
  );
  return {
    status: r.status,
    body: await r.json(),
    cookie: r.headers.get("set-cookie") ?? "",
  };
}
async function login(email: string, type: string) {
  const r = await request("login", "", { email, password: demoPassword, type });
  assert.equal(r.status, 200, JSON.stringify(r.body));
  assert.ok(!("token" in r.body));
  assert.ok(!("password" in r.body.user));
  assert.match(r.cookie, /HttpOnly/i);
  assert.match(r.cookie, /SameSite=Lax/i);
  return r.cookie.match(/educonnect_session=([^;]+)/)![1];
}
const booking = (dateTime = future()) => ({
  teacherId,
  dateTime,
  duration: 60,
  subject: "Mathematics",
  mode: "online",
});
before(
  async () => {
    process.env.JWT_SECRET = randomBytes(48).toString("hex");
    db = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: "wiredTiger" },
    });
    process.env.MONGO_URI = db.getUri("educonnect_tests");
    await connect();
    await seedDemo();
    await seedDemo();
    assert.equal(await Student.countDocuments(), 1);
    assert.equal(await Teacher.countDocuments(), 2);
    student = await login("student@educonnect.example", "student");
    tutor = await login("tutor@educonnect.example", "teacher");
    admin = await login("admin@educonnect.example", "admin");
    const t = await Teacher.findOne({ email: "tutor@educonnect.example" });
    teacherId = t!.id;
    pendingId = (await Teacher.findOne({ status: "pending" }))!.id;
    const password = await bcrypt.hash(demoPassword, 4);
    const s = await Student.create({
      name: "Other synthetic student",
      email: "other@educonnect.example",
      password,
      educationLevel: "school",
      institution: "Synthetic School",
      subjects: ["Mathematics"],
    });
    otherStudent = signSession(s.id, "student", 0);
    const second = await Teacher.create({
      name: "Other synthetic tutor",
      email: "other-tutor@educonnect.example",
      password,
      bio: "A synthetic tutor used for authorization tests.",
      yoe: 1,
      subjects: ["Mathematics"],
      qualifications: ["Synthetic BSc"],
      hourlyRate: 900,
      availability: ["online"],
      status: "approved",
    });
    otherTutor = signSession(second.id, "teacher", 0);
  },
  { timeout: 240000 },
);
after(async () => {
  await mongoose.disconnect();
  if (db) await db.stop();
});
test("JWT signature, expiry, role and account validation; no role-cookie authority", async () => {
  assert.equal((await request("auth")).status, 401);
  assert.equal((await request("auth", "forged")).status, 401);
  const decoded = jwt.decode(student) as jwt.JwtPayload;
  const forged = jwt.sign({ role: "admin", version: 0 }, "wrong-secret", {
    subject: decoded.sub,
  });
  assert.equal((await request("auth", forged)).status, 401);
  const expired = jwt.sign(
    { role: "student", version: 0 },
    process.env.JWT_SECRET!,
    {
      subject: decoded.sub,
      expiresIn: -1,
      issuer: "educonnect",
      audience: "educonnect-web",
    },
  );
  assert.equal((await request("auth", expired)).status, 401);
  assert.equal((await request("admin/teachers", student)).status, 403);
  assert.equal(
    (
      await request("admin/teacher/status", tutor, {
        id: pendingId,
        status: "approved",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request(
        "auth",
        signSession(new mongoose.Types.ObjectId().toString(), "student", 0),
      )
    ).status,
    401,
  );
  assert.equal(
    (await request("logout", student, {}, "https://evil.example")).status,
    403,
  );
  assert.equal((await request("admin/signup", "", {})).status, 410);
  assert.equal((await request("teachers/bulkSignup", "", {})).status, 410);
  const prior = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: "production" });
  assert.equal(cookieOptions().secure, true);
  Object.assign(process.env, { NODE_ENV: prior ?? "test" });
});
test("public discovery hides pending tutors and credentials; profile cannot mutate other tutors/status", async () => {
  const r = await request("teachers/getAll");
  assert.equal(r.status, 200);
  assert.ok(
    r.body.profiles.every((p: { status: string }) => p.status === "approved"),
  );
  assert.ok(!JSON.stringify(r.body).includes("password"));
  assert.ok(!JSON.stringify(r.body).includes("@educonnect"));
  const profile = {
    name: "Demo Tutor",
    qualifications: ["Demo MSc"],
    bio: "Updated synthetic profile for booking tests.",
    yoe: 3,
    subjects: ["Mathematics", "Physics"],
    hourlyRate: 1000,
    availability: ["online", "in-person"],
  };
  assert.equal((await request("edit/teacher", student, profile)).status, 403);
  assert.equal(
    (await request("edit/teacher", tutor, { ...profile, _id: pendingId }))
      .status,
    400,
  );
  assert.equal(
    (await request("edit/teacher", tutor, { ...profile, status: "approved" }))
      .status,
    400,
  );
  assert.equal((await request("edit/teacher", tutor, profile)).status, 200);
  assert.equal((await Teacher.findById(pendingId))!.status, "pending");
});
test("signup validates fields and forces pending status; deliberate password flow invalidates tokens", async () => {
  const signup = {
    name: "Registered Student",
    email: "registered@educonnect.example",
    password: demoPassword,
    subjects: ["Mathematics"],
    educationLevel: "school",
    institution: "Synthetic School",
  };
  assert.equal(
    (await request("students/signup", "", { ...signup, password: "" })).status,
    400,
  );
  assert.equal((await request("students/signup", "", signup)).status, 201);
  const token = await login(signup.email, "student");
  assert.equal(
    (
      await request("account/password", token, {
        currentPassword: "wrong",
        newPassword: "New-Demo-Password-2026!",
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("account/password", token, {
        currentPassword: demoPassword,
        newPassword: "",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("account/password", token, {
        currentPassword: demoPassword,
        newPassword: "New-Demo-Password-2026!",
      })
    ).status,
    200,
  );
  await assert.rejects(() => authenticate(token));
  assert.equal(
    (
      await request("account/password", student, {
        currentPassword: demoPassword,
        newPassword: "New-Demo-Password-2026!",
      })
    ).status,
    403,
  );
  const newTutor = {
    name: "Registered Tutor",
    email: "registered-tutor@educonnect.example",
    password: demoPassword,
    qualifications: ["Synthetic BSc"],
    bio: "Synthetic tutor registration under test.",
    yoe: 1,
    subjects: ["Mathematics"],
    hourlyRate: 1000,
    availability: ["online"],
  };
  assert.equal(
    (await request("teachers/signup", "", { ...newTutor, status: "approved" }))
      .status,
    400,
  );
  assert.equal((await request("teachers/signup", "", newTutor)).status, 201);
  assert.equal(
    (await Teacher.findOne({ email: newTutor.email }))!.status,
    "pending",
  );
});
test("concurrent tutor and student overlaps yield one booking; invalid/forged booking data rejected", async () => {
  assert.equal((await request("sessions/book", tutor, booking())).status, 403);
  assert.equal(
    (
      await request("sessions/book", student, {
        ...booking(),
        studentId: pendingId,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("sessions/book", student, {
        ...booking(),
        status: "completed",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        "sessions/book",
        student,
        booking(new Date(0).toISOString()),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request("sessions/book", student, {
        ...booking(),
        teacherId: pendingId,
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("sessions/book", student, {
        ...booking(),
        subject: "Unavailable",
      })
    ).status,
    400,
  );
  const race = await Promise.all([
    request("sessions/book", student, booking()),
    request("sessions/book", otherStudent, booking()),
  ]);
  assert.deepEqual(race.map((r) => r.status).sort(), [201, 409]);
  assert.equal(await Session.countDocuments(), 1);
  assert.equal(await Slot.countDocuments(), 8);
  const otherId = (await authenticate(otherTutor)).id;
  const race2 = await Promise.all([
    request("sessions/book", student, booking(future(30))),
    request("sessions/book", student, {
      ...booking(future(30)),
      teacherId: otherId,
    }),
  ]);
  assert.deepEqual(race2.map((r) => r.status).sort(), [201, 409]);
});
test("ownership, lifecycle, verified review and rating; admin verification; persistence across reconnect", async () => {
  const created = await request("sessions/book", student, booking(future(48)));
  assert.equal(created.status, 201);
  const sessionID = created.body.sessionId;
  assert.equal(
    (await request("sessions/getAll", otherStudent)).body.sessions.some(
      (s: { _id: string }) => s._id === sessionID,
    ),
    false,
  );
  assert.equal(
    (await request("sessions/accept", otherTutor, { sessionID })).status,
    409,
  );
  assert.equal(
    (await request("sessions/cancel", otherStudent, { sessionID })).status,
    409,
  );
  assert.equal(
    (await request("sessions/complete", tutor, { sessionID })).status,
    409,
  );
  assert.equal(
    (
      await request("review", student, {
        sessionID,
        rating: 5,
        review: "Synthetic review before completion",
      })
    ).status,
    403,
  );
  assert.equal(
    (await request("sessions/accept", tutor, { sessionID })).status,
    200,
  );
  assert.equal(
    (await request("sessions/accept", tutor, { sessionID })).status,
    409,
  );
  assert.equal(
    (await request("sessions/complete", tutor, { sessionID })).status,
    200,
  );
  assert.equal(
    (await request("sessions/cancel", student, { sessionID })).status,
    409,
  );
  assert.equal(
    (
      await request("review", otherStudent, {
        sessionID,
        rating: 5,
        review: "Unauthorized review",
      })
    ).status,
    403,
  );
  const reviews = await Promise.all([
    request("review", student, {
      sessionID,
      rating: 4,
      review: "Helpful synthetic session for this demo.",
    }),
    request("review", student, {
      sessionID,
      rating: 5,
      review: "Duplicate synthetic review attempted.",
    }),
  ]);
  assert.deepEqual(reviews.map((r) => r.status).sort(), [201, 409]);
  assert.equal(await Review.countDocuments({ sessionId: sessionID }), 1);
  const rating = (await Review.findOne({ sessionId: sessionID }))!.rating;
  assert.equal((await Teacher.findById(teacherId))!.averageRating, rating);
  assert.equal((await Teacher.findById(teacherId))!.reviewCount, 1);
  assert.equal(
    (
      await request("admin/teacher/status", admin, {
        id: pendingId,
        status: "approved",
        comment: "Synthetic verification completed.",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("admin/teacher/status", admin, {
        id: pendingId,
        status: "rejected",
      })
    ).status,
    409,
  );
  await seedDemo();
  assert.equal((await Teacher.findById(pendingId))!.status, "approved");
  await mongoose.disconnect();
  await connect();
  assert.equal((await Session.findById(sessionID))!.status, "completed");
  assert.equal((await Teacher.findById(teacherId))!.averageRating, rating);
});
test("reschedule rollback preserves slots, resets acceptance, cancellation and rejection release reservations", async () => {
  const a = await request("sessions/book", student, booking(future(72)));
  const b = await request("sessions/book", student, booking(future(74)));
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
  const sessionID = a.body.sessionId;
  assert.equal(
    (
      await request("sessions/reschedule", otherStudent, {
        sessionID,
        dateTime: future(76),
        duration: 60,
      })
    ).status,
    404,
  );
  assert.equal(
    (await request("sessions/accept", tutor, { sessionID })).status,
    200,
  );
  assert.equal(
    (
      await request("sessions/reschedule", student, {
        sessionID,
        dateTime: future(74),
        duration: 60,
      })
    ).status,
    409,
  );
  assert.equal((await Session.findById(sessionID))!.status, "accepted");
  assert.equal(await Slot.countDocuments({ sessionId: sessionID }), 8);
  assert.equal(
    (
      await request("sessions/reschedule", student, {
        sessionID,
        dateTime: future(76),
        duration: 90,
      })
    ).status,
    200,
  );
  assert.equal((await Session.findById(sessionID))!.status, "pending");
  assert.equal((await Session.findById(sessionID))!.price, 1500);
  assert.equal(
    (await request("sessions/cancel", student, { sessionID })).status,
    200,
  );
  assert.equal(await Slot.countDocuments({ sessionId: sessionID }), 0);
  assert.equal(
    (await request("sessions/reject", tutor, { sessionID: b.body.sessionId }))
      .status,
    200,
  );
  assert.equal(
    (await request("sessions/book", student, booking(future(74)))).status,
    201,
  );
});
