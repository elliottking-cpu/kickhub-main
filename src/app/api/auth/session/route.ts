import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Session endpoint - authentication system coming soon",
      authenticated: false,
    },
    { status: 200 }
  );
}