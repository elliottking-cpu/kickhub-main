import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Matches API - coming soon",
      matches: [],
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      message: "Create match API - coming soon",
    },
    { status: 501 }
  );
}