import { NextRequest, NextResponse } from "next/server";
import sessionModel, { SessionType } from "@/models/sessions";
import { getDatafromJWT } from "@/util/getDatafromJWT";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    if (!token) {
      return NextResponse.redirect("/login");
    }
    const id = getDatafromJWT(token).id;
    let sessions: SessionType[] = [];
    if (type === "student") {
      sessions = await sessionModel
        .find({
          studentId: id,
        })
        .populate("teacherId", "-password -email");
    } else if (type === "teacher") {
      console.log("teacher", id, type);
      sessions = await sessionModel
        .find({
          teacherId: id,
        })
        .populate("studentId", "-password -email");
    }

    return NextResponse.json(
      { message: "Sessions found", sessions },
      { status: 200 },
    );
  } catch (error) {
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
