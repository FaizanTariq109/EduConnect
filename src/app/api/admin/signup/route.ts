import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt";
import adminModel, { AdminType } from "@/models/admin";
import { connect } from "@/db/db";

await connect();

export async function POST(req: NextRequest) {
  const data: AdminType = await req.json();
  const admin = new adminModel(data);
  // Encrypt the password
  const salt = await bcrypt.genSalt(10);
  admin.password = await bcrypt.hash(admin.password, salt);
  try {
    await admin.save();
    return NextResponse.json({ message: "Admin created successfully" });
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
