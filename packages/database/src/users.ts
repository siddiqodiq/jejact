import "server-only";
import { getSupabase } from "./client";

export interface UpsertUserParams {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  encryptedAccessToken: string;
  encryptedRefreshToken: string;
  tokenExpiresAt: number;
}

export async function upsertUser(params: UpsertUserParams): Promise<void> {
  const { error } = await getSupabase().from("users").upsert({
    id: params.id,
    first_name: params.firstName,
    last_name: params.lastName,
    avatar_url: params.avatarUrl,
    access_token: params.encryptedAccessToken,
    refresh_token: params.encryptedRefreshToken,
    token_expires_at: params.tokenExpiresAt,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Failed to upsert user: ${error.message}`);
  }
}

export async function updateUserTokens(
  userId: string,
  encryptedAccessToken: string,
  encryptedRefreshToken: string,
  tokenExpiresAt: number,
): Promise<void> {
  const { error } = await getSupabase()
    .from("users")
    .update({
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: tokenExpiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update user tokens: ${error.message}`);
  }
}

export async function getUserTokens(userId: string) {
  const { data, error } = await getSupabase()
    .from("users")
    .select("access_token, refresh_token, token_expires_at")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    encryptedAccessToken: data.access_token,
    encryptedRefreshToken: data.refresh_token,
    tokenExpiresAt: data.token_expires_at,
  };
}

export async function updateLastSyncedAt(userId: string): Promise<void> {
  const { error } = await getSupabase()
    .from("users")
    .update({ last_synced_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    throw new Error(`Failed to update last_synced_at: ${error.message}`);
  }
}

export async function getLastSyncedAt(userId: string): Promise<string | null> {
  const { data, error } = await getSupabase()
    .from("users")
    .select("last_synced_at")
    .eq("id", userId)
    .single();
    
  if (error) return null;
  return data?.last_synced_at ?? null;
}
