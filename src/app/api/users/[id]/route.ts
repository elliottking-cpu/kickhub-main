import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    {
      message: `User ${params.id} API - coming soon`,
      user: null,
    },
    { status: 200 }
  );
}