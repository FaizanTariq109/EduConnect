import { MongoMemoryReplSet } from "mongodb-memory-server";
import { spawn, type ChildProcess } from "node:child_process";
import { once } from "node:events";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { connect } from "../src/db/db";
import { seedDemo, demoPassword } from "../scripts/demo-data";
const origin = "http://localhost:3009";
let child: ChildProcess | undefined;
let db: MongoMemoryReplSet | undefined;
async function boot() {
  child = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", "3009"],
    { env: process.env, stdio: "ignore" },
  );
  for (let n = 0; n < 60; n++) {
    try {
      const r = await fetch(origin + "/login");
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Production server did not start.");
}
async function stop() {
  if (child && child.exitCode === null) {
    const exited = once(child, "exit");
    child.kill();
    await exited;
  }
  child = undefined;
}
async function call(path: string, cookie = "", body?: unknown) {
  const res = await fetch(origin + "/api/" + path, {
    method: body ? "POST" : "GET",
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(body ? { "content-type": "application/json", origin } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { res, data: await res.json() };
}
async function login(email: string, type: string) {
  const { res, data } = await call("login", "", {
    email,
    type,
    password: demoPassword,
  });
  assert.equal(res.status, 200, JSON.stringify(data));
  const header = res.headers.get("set-cookie")!;
  assert.match(header, /Secure/i);
  assert.match(header, /HttpOnly/i);
  assert.match(header, /SameSite=Lax/i);
  assert.ok(!JSON.stringify(data).includes("password"));
  return header.match(/educonnect_session=[^;]+/)![0];
}
async function main() {
  db = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });
  process.env.MONGO_URI = db.getUri("educonnect_http_synthetic");
  process.env.JWT_SECRET = randomBytes(48).toString("hex");
  await connect();
  await seedDemo();
  await mongoose.disconnect();
  await boot();
  const unauthorized = await fetch(origin + "/dashboard/admin", {
    redirect: "manual",
    headers: { cookie: "token=forged; type=admin" },
  });
  assert.ok([303, 307].includes(unauthorized.status));
  assert.equal(unauthorized.headers.get("location"), "/login");
  const student = await login("student@educonnect.example", "student");
  const tutor = await login("tutor@educonnect.example", "teacher");
  const admin = await login("admin@educonnect.example", "admin");
  assert.equal(
    (
      await fetch(origin + "/dashboard/student", {
        headers: { cookie: student },
      })
    ).status,
    200,
  );
  const tutors = await call("teachers/getAll");
  const teacherId = tutors.data.profiles[0]._id;
  const booking = await call("sessions/book", student, {
    teacherId,
    subject: "Mathematics",
    mode: "online",
    duration: 60,
    dateTime: new Date(
      Math.ceil(Date.now() / 900000) * 900000 + 86400000,
    ).toISOString(),
  });
  assert.equal(booking.res.status, 201);
  const sessionID = booking.data.sessionId;
  assert.equal(
    (await call("sessions/accept", tutor, { sessionID })).res.status,
    200,
  );
  assert.equal(
    (await call("sessions/complete", tutor, { sessionID })).res.status,
    200,
  );
  assert.equal(
    (
      await call("review", student, {
        sessionID,
        rating: 5,
        review: "Synthetic full-stack production smoke test.",
      })
    ).res.status,
    201,
  );
  const pending = (await call("admin/teachers", admin)).data.profiles.find(
    (p: { status: string }) => p.status === "pending",
  );
  assert.equal(
    (
      await call("admin/teacher/status", admin, {
        id: pending._id,
        status: "approved",
        comment: "Synthetic HTTP test verification.",
      })
    ).res.status,
    200,
  );
  assert.equal((await call("admin/teachers", student)).res.status, 403);
  assert.equal(
    (await call("sessions/cancel", student, { sessionID })).res.status,
    409,
  );
  await stop();
  await boot();
  const rows = (await call("sessions/getAll", student)).data.sessions;
  assert.equal(
    rows.find((r: { _id: string }) => r._id === sessionID).status,
    "completed",
  );
  assert.equal(rows[0].reviewed, true);
  const after = (await call("teachers/getAll")).data.profiles;
  assert.equal(
    after.find((p: { _id: string }) => p._id === teacherId).averageRating,
    5,
  );
  assert.ok(after.some((p: { _id: string }) => p._id === pending._id));
  console.log(
    "PASS: production HTTP login, secure cookies, protected pages, booking, acceptance, completion, review/rating, admin verification, authorization failures and persistence after Next.js process restart.",
  );
}
main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : "HTTP smoke test failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await stop();
    await mongoose.disconnect();
    if (db) await db.stop();
  });
