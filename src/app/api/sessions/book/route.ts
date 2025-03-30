import { NextRequest, NextResponse } from "next/server";
import sessionModel, { SessionType } from "@/models/sessions";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    if (!token) {
      return NextResponse.redirect("/login");
    }
    const sessionD: SessionType = await req.json();
    //const dateTime = new Date(sessionD.dateTime).toLocaleString("en-CA");
    //console.log(dateTime);
    const session = new sessionModel({
      studentId: sessionD.studentId,
      teacherId: sessionD.teacherId,
      dateTime: sessionD.dateTime,
      duration: sessionD.duration,
      status: sessionD.status,
      subject: sessionD.subject,
    });
    await session.save();
    return NextResponse.json(
      { message: "Session booked", session },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
