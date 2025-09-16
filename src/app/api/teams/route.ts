import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Teams API - coming soon",
      teams: [],
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Create team API - coming soon",
    },
    { status: 501 }
  );
}