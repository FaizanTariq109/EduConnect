import { connect } from "@/db/db";
import teacherModel from "@/models/teacher";
import { TeacherType } from "@/models/teacher";
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

await connect()

export async function POST(req: NextRequest) {
  const data: TeacherType = await req.json()
  const teacher = new teacherModel(data)
  // Encrypt the password 
  const salt = await bcrypt.genSalt(10)
  teacher.password = await bcrypt.hash(teacher.password, salt)
  try {
    await teacher.save()
    return NextResponse.json({ message: "Teacher created successfully" })
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
}
