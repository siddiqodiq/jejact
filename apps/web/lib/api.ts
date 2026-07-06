import type {
  ActivitiesResponse,
  ActivityDto,
  SessionUser,
} from "@repo/types";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get unauthorized(): boolean {
    return this.status === 401;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { credentials: "same-origin", ...init });
  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = (await response.json()) as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // non-JSON error body
    }
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<T>;
}

export const api = {
  me: () => request<SessionUser>("/api/me"),
  activities: (page = 1) =>
    request<ActivitiesResponse>(`/api/activities?page=${page}`),
  activity: (id: string) => request<ActivityDto>(`/api/activities/${id}`),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  disconnectStrava: () =>
    request<{ ok: true }>("/api/me/strava", { method: "DELETE" }),
};
