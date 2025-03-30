import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Locations that don't need auth
const publicPaths = ["/", "/about", "/contact", "/login", "/signup"];
const privatePaths = ["/dashboard", "/profile"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value || "";
  const type = request.cookies.get("type")?.value || "";
  //console.log("path, token, type", path, token, type);
  // IF logged in, than
  if (publicPaths.includes(path) && token && type) {
    return NextResponse.redirect(new URL("/dashboard/" + type, request.url));
  }
  // Dashboard and logged out
  if (path.includes("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // Dashboard and logged in but wrong type
  if (path.includes("/dashboard") && token && type && !path.includes(type)) {
    return NextResponse.redirect(new URL("/dashboard/" + type, request.url));
  }
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/profile/:path*", "/login", "/signup"],
};
