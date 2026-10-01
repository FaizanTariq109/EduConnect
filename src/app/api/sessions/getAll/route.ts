import { handler } from "@/server/api";
export const runtime = "nodejs";
export const GET = handler("sessions/getAll");
