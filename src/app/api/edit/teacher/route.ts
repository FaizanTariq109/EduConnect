import { connect } from "@/db/db";
import teacherModel from "@/models/teacher";
import { TeacherType } from "@/models/teacher";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";

await connect();

export async function POST(req: NextRequest) {
  const data: TeacherType = await req.json();
  const salt = await bcrypt.genSalt(10);
  data.password = await bcrypt.hash(data.password, salt);
  const teacher = await teacherModel.findByIdAndUpdate(data._id!, data);
  try {
    await teacher.save();
    return NextResponse.json({ message: "Teacher created successfully" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
