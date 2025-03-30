import { NextRequest, NextResponse } from "next/server";
import sessionModel, { SessionType } from "@/models/sessions";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    if (!token) {
      return NextResponse.redirect("/login");
    }
    const date = new URL(req.url).searchParams.get("date");
    if (!date) {
      return NextResponse.json(
        { message: "Missing 'date' query parameter" },
        { status: 400 },
      );
    }
    const dateStart = new Date(date);
    const dateEnd = new Date(dateStart);
    dateEnd.setDate(dateEnd.getDate() + 1);
    //console.log(date);
    const sessions: SessionType[] = await sessionModel.find({
      dateTime: { $gte: dateStart, $lt: dateEnd },
      // If pending or accepted, then the session is already booked
      status: ["pending", "accepted"],
    });
    console.log(sessions);
    let times: string[] = [];
    sessions.forEach((session) => {
      const date = new Date(session.dateTime);
      const hours: string = date.getUTCHours().toString();
      let minutes: string = date.getUTCMinutes().toString();
      if (minutes.length === 1) {
        minutes = `0${minutes}`;
      }
      const time: string = `${hours}:${minutes}`;
      times.push(time);
    });
    console.log(times);
    return NextResponse.json(
      { message: "Session Found", times },
      { status: 200 },
    );
  } catch (error: any) {
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
