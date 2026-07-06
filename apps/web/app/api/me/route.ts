import { NextResponse } from "next/server";
import { getSession } from "../../../lib/server/session";
import { unauthorized } from "../../../lib/server/responses";

export async function GET() {
  const session = await getSession();
  if (!session) return unauthorized();
  return NextResponse.json(session.athlete);
}
