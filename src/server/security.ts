import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { connect } from "../db/db";
import { Student, Teacher, Admin, RateLimit } from "./models";
import type { Role, User } from "../lib/types";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const cookieName = "educonnect_session";
export function secret() {
  const key = process.env.JWT_SECRET;
  if (!key || key.length < 32 || key.startsWith("replace-"))
    throw new HttpError(503, "Authentication is not configured.");
  return key;
}
export function signSession(id: string, role: Role, version: number) {
  return jwt.sign({ role, version }, secret(), {
    subject: id,
    expiresIn: "8h",
    algorithm: "HS256",
    issuer: "educonnect",
    audience: "educonnect-web",
  });
}
export async function authenticate(token?: string): Promise<User> {
  if (!token) throw new HttpError(401, "Please sign in.");
  let data: jwt.JwtPayload;
  try {
    const decoded = jwt.verify(token, secret(), {
      algorithms: ["HS256"],
      issuer: "educonnect",
      audience: "educonnect-web",
    });
    if (typeof decoded === "string") throw new Error();
    data = decoded;
  } catch {
    throw new HttpError(401, "Your session has expired. Please sign in again.");
  }
  if (
    !["student", "teacher", "admin"].includes(data.role) ||
    !data.sub ||
    !/^[a-f0-9]{24}$/i.test(data.sub)
  )
    throw new HttpError(401, "Invalid session.");
  await connect();
  const account =
    data.role === "student"
      ? await Student.findById(data.sub)
      : data.role === "teacher"
        ? await Teacher.findById(data.sub)
        : await Admin.findById(data.sub);
  if (!account || account.tokenVersion !== data.version)
    throw new HttpError(401, "Please sign in again.");
  return {
    id: account.id,
    name: account.name,
    email: account.email,
    role: data.role,
    demo: account.demo,
  };
}
export async function requireUser(
  req: NextRequest,
  roles: Role[] = ["student", "teacher", "admin"],
) {
  const user = await authenticate(req.cookies.get(cookieName)?.value);
  if (!roles.includes(user.role))
    throw new HttpError(403, "You do not have permission for this action.");
  return user;
}
export function cookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 8 * 60 * 60,
  };
}
export function setSession(response: NextResponse, token: string) {
  response.cookies.set(cookieName, token, cookieOptions());
  response.cookies.delete("token");
  response.cookies.delete("type");
}
export function checkOrigin(req: NextRequest) {
  if (req.method === "GET") return;
  const origin = req.headers.get("origin");
  if (!origin || origin !== new URL(req.url).origin)
    throw new HttpError(403, "Request origin is not allowed.");
  if (!req.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Use a JSON request.");
}
export async function rateLimit(key: string, max = 30, minutes = 15) {
  await connect();
  const now = Date.now();
  const bucket = Math.floor(now / (minutes * 60000));
  const id = createHash("sha256").update(`${key}:${bucket}`).digest("hex");
  const row = await RateLimit.findOneAndUpdate(
    { _id: id },
    {
      $inc: { count: 1 },
      $setOnInsert: { expiresAt: new Date((bucket + 1) * minutes * 60000) },
    },
    { upsert: true, new: true },
  );
  if (row.count > max)
    throw new HttpError(429, "Too many attempts. Please try again later.");
}
