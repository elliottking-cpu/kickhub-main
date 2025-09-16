import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      message: "KickHub API is running successfully",
    },
    { status: 200 }
  );
}

export async function HEAD(request: NextRequest) {
  return new NextResponse(null, { status: 200 });
}