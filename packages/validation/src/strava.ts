import { z } from "zod";

/** Response from Strava's OAuth token endpoint (authorization + refresh). */
export const stravaTokenResponseSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(), // unix seconds
  athlete: z
    .object({
      id: z.number(),
      firstname: z.string().nullish(),
      lastname: z.string().nullish(),
      profile: z.string().nullish(),
      profile_medium: z.string().nullish(),
    })
    .passthrough()
    .optional(),
});

export type StravaTokenResponse = z.infer<typeof stravaTokenResponseSchema>;

/** Summary activity from GET /athlete/activities (fields we care about). */
export const stravaActivitySchema = z
  .object({
    id: z.number(),
    name: z.string(),
    sport_type: z.string().default("Workout"),
    start_date: z.string(),
    timezone: z.string().nullish(),
    distance: z.number().default(0),
    moving_time: z.number().default(0),
    elapsed_time: z.number().default(0),
    total_elevation_gain: z.number().default(0),
    average_speed: z.number().nullish(),
    average_heartrate: z.number().nullish(),
    calories: z.number().nullish(), // only present on detailed activity
    map: z
      .object({
        summary_polyline: z.string().nullish(),
        polyline: z.string().nullish(),
      })
      .nullish(),
  })
  .passthrough();

export type StravaActivity = z.infer<typeof stravaActivitySchema>;

export const stravaActivityListSchema = z.array(stravaActivitySchema);
