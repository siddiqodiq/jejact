import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "../../../../lib/server/session";
import {
  fromStravaError,
  jsonError,
  unauthorized,
} from "../../../../lib/server/responses";
import {
  fetchActivityDetail,
  toActivityDto,
} from "../../../../lib/server/strava";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;
  if (!/^\d+$/.test(id)) return jsonError(400, "Invalid activity id");

  try {
    // Detailed activity (developers.strava.com #api-Activities-getActivityById)
    // — includes calories, which the summary list omits.
    const activity = await fetchActivityDetail(session.accessToken, id);
    return NextResponse.json(toActivityDto(activity));
  } catch (error) {
    return fromStravaError(error);
  }
}
