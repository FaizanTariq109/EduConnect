import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value || "";
    const type = req.cookies.get("type")?.value || "";
    console.log("token, type", token, type);
    if (token && type) {
      // Profile logged in
      return NextResponse.json(
        { message: "Profile logged in", token, type },
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Profile not logged in" },
      { status: 401 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Profile not logged in" },
      { status: 401 },
    );
  }
}
