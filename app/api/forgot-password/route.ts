import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.redirect(new URL("/reset-password?sent=1", request.url), 303);
}
