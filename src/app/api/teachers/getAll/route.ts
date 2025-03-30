import { NextRequest, NextResponse } from "next/server";
import { TeacherType } from "@/models/teacher";
import teacherModel from "@/models/teacher";

export async function GET(req: NextRequest) {
  // Get all the teachers
  try {
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    if (!token) {
      return NextResponse.redirect("/login");
    }
    const status = type === "admin" ? "pending" : "approved";
    let profiles: TeacherType[] = (await teacherModel
      .find({ status })
      .select("-password")) as TeacherType[];

    return NextResponse.json(
      { message: "Teachers found", profiles },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
