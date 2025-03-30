import { NextRequest, NextResponse } from "next/server";
import sessionModel from "@/models/sessions";
import { SessionType } from "@/models/sessions";
import { getDatafromJWT } from "@/util/getDatafromJWT";
import { Document } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    // Only teacher can accept sessions
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    if (!token) {
      return NextResponse.redirect("/login");
    }
    const id = getDatafromJWT(token).id;
    const data = await req.json();
    const sessionID = data.sessionID;
    // First check if the session is accepted
    const session: (SessionType & Document) | null = await sessionModel.findOne(
      {
        _id: sessionID,
      },
    );
    //console.log(session);
    if (type === "teacher" && session?.teacherId != id) {
      return NextResponse.json(
        { message: "Do not have permission for this session" },
        { status: 200 },
      );
    } else if (type === "student" && session?.studentId != id) {
      return NextResponse.json(
        { message: "Do not have permission for this session" },
        { status: 200 },
      );
    }
    await session?.deleteOne();
    return NextResponse.json(
      { message: "Session accepted", session },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
