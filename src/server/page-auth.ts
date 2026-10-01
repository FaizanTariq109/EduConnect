import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authenticate, cookieName } from "./security";
import type { Role } from "../lib/types";
export async function pageUser(role: Role) {
  let user;
  try {
    user = await authenticate((await cookies()).get(cookieName)?.value);
  } catch {
    redirect("/login");
  }
  if (user.role !== role) redirect("/dashboard/" + user.role);
  return user;
}
