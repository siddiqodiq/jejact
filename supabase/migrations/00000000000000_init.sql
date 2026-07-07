-- users: data athlete dari Strava
CREATE TABLE users (
  id            TEXT PRIMARY KEY,           -- Strava athlete ID (string)
  first_name    TEXT NOT NULL DEFAULT '',
  last_name     TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  access_token  TEXT NOT NULL,              -- AES-256-GCM encrypted
  refresh_token TEXT NOT NULL,              -- AES-256-GCM encrypted  
  token_expires_at BIGINT NOT NULL,         -- Unix seconds
  last_synced_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- activities: cached Strava activities
CREATE TABLE activities (
  id              TEXT NOT NULL,            -- Strava activity ID (string)
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sport_type      TEXT NOT NULL DEFAULT 'Workout',
  start_date      TIMESTAMPTZ NOT NULL,
  distance_meters DOUBLE PRECISION DEFAULT 0,
  moving_time_seconds INTEGER DEFAULT 0,
  elapsed_time_seconds INTEGER DEFAULT 0,
  elevation_gain_meters DOUBLE PRECISION DEFAULT 0,
  average_speed_mps DOUBLE PRECISION,
  average_heartrate_bpm DOUBLE PRECISION,
  calories        DOUBLE PRECISION,
  map_polyline    TEXT,
  has_detail      BOOLEAN DEFAULT FALSE,    -- true = calories sudah di-fetch
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

CREATE INDEX idx_activities_user_date ON activities(user_id, start_date DESC);
