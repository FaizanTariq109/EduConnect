import { NextRequest, NextResponse } from "next/server";
import { ReviewType } from "@/models/reviews";
import reviewModel from "@/models/reviews";

export async function POST(req: NextResponse) {
  const token = req.cookies.get("token")?.value || "";
  const type = req.cookies.get("type")?.value || "";
  if (!token || !type || type !== "student") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { stdID, tchID, rating, review } = await req.json();
  if (!stdID || !tchID || !rating || !review) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
  const newReview: ReviewType = {
    teacherId: tchID,
    studentId: stdID,
    rating,
    review,
  };
  //console.log(newReview);
  try {
    const review = new reviewModel(newReview);
    await review.save();
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
