import { connect } from "@/db/db";
import stdModel from "@/models/student";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { StudentType } from "@/models/student";

await connect();

export async function POST(req: NextRequest) {
  const data: StudentType = await req.json();
  const std = new stdModel(data);
  // Encrypt the password
  const salt = await bcrypt.genSalt(10);
  std.password = await bcrypt.hash(std.password, salt);
  try {
    await std.save();
    return NextResponse.json({ message: "Student created successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
