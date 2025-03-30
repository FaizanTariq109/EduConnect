import { NextRequest, NextResponse } from "next/server";
import { TeacherType } from "@/models/teacher";
import teacherModel from "@/models/teacher";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    if (!token) {
      return NextResponse.redirect("/login");
    }
    if (type !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    // the status of this teacher
    const { id, status } = await req.json();
    if (status !== "approved" && status !== "rejected") {
      return NextResponse.json(
        { message: "Invalid status, must be approved or rejected" },
        { status: 400 },
      );
    }
    await teacherModel.findByIdAndUpdate(id, { status });

    return NextResponse.json({ message: "Succesful" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
