import { NextRequest, NextResponse } from "next/server";
import { getDatafromJWT } from "@/util/getDatafromJWT";
import { StudentType } from "@/models/student";
import { TeacherType } from "@/models/teacher";

import stdModel from "@/models/student";
import teacherModel from "@/models/teacher";
import { connect } from "@/db/db";

await connect();

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    if (!token) {
      return NextResponse.redirect("/login");
    }
    let profile: StudentType | TeacherType | null = null;
    const _id = getDatafromJWT(token).id;
    if (type === "student") {
      profile = (await stdModel
        .findById(_id)
        .select("-password")) as StudentType;
    } else if (type === "teacher") {
      profile = (await teacherModel
        .findById(_id)
        .select("-password")) as TeacherType;
    }
    return NextResponse.json(
      { message: "Profile found", profile },
      { status: 200 },
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
