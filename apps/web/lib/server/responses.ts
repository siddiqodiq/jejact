import "server-only";
import { NextResponse } from "next/server";
import type { ApiErrorBody } from "@repo/types";
import { StravaApiError } from "./strava";

export function jsonError(statusCode: number, message: string) {
  return NextResponse.json<ApiErrorBody>(
    { statusCode, message },
    { status: statusCode },
  );
}

export function unauthorized() {
  return jsonError(401, "Not signed in");
}

/** Maps upstream Strava failures onto our API error shape. */
export function fromStravaError(error: unknown) {
  if (error instanceof StravaApiError) {
    if (error.status === 401) return jsonError(401, "Strava access revoked");
    return jsonError(error.status === 429 ? 429 : 502, error.message);
  }
  return jsonError(500, "Something went wrong");
}
