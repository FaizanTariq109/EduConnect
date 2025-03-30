import { connect } from "@/db/db";
import { NextRequest, NextResponse } from 'next/server'

await connect()

export async function POST(req: NextRequest) {
  try {
    // Check if the user is logged in 
    const token = req.cookies.get('token')
    if (!token) {
      return NextResponse.json({ message: "Teacher not logged in" }, { status: 401 })
    }
    const resp: NextResponse = NextResponse.json({ message: "Teacher logged out" }, { status: 200 })
    resp.cookies.set('token', '', { httpOnly: true, sameSite: 'strict', expires: new Date(0) })
    return resp;
  } catch (error) {
    console.log(error)
  }
}
