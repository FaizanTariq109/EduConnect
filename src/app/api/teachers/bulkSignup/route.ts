import { connect } from "@/db/db";
import teacherModel from "@/models/teacher";
import { TeacherType } from "@/models/teacher";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

await connect();

export async function POST(req: NextRequest) {
  const data: TeacherType[] = await req.json();
  for (let teacher of data) {
    const salt = await bcrypt.genSalt(10);
    teacher.password = await bcrypt.hash(teacher.password, salt);
    teacher.status = "pending";
  }
  // Set default status as pending
  try {
    await teacherModel.insertMany(data);
    return NextResponse.json({ message: "Teachers created successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
