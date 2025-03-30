import { NextRequest, NextResponse } from "next/server";
import sessionModel from "@/models/sessions";
import { SessionType } from "@/models/sessions";

export async function POST(req: NextRequest) {
  try {
    // Only teacher can accept sessions
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    if (!token || type !== "teacher") {
      return NextResponse.redirect("/login");
    }
    const data = await req.json();
    const sessionID = data.sessionID;
    const session: SessionType | null = await sessionModel.findByIdAndUpdate(
      sessionID,
      { status: "accepted" },
      { new: true },
    );
    console.log(session);
    return NextResponse.json(
      { message: "Session accepted", session },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
