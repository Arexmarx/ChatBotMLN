import { getSupabaseClient } from "./supabaseClient";

export interface UserProfile {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get user profile from database
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
};

/**
 * Update or insert user profile
 */
export const upsertUserProfile = async (
  userId: string,
  fullName: string,
  avatarUrl: string
): Promise<{ error: any }> => {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        user_id: userId,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  return { error };
};

/**
 * Create initial profile from OAuth data
 */
export const createInitialProfile = async (
  userId: string,
  email: string | undefined,
  metadata: any
): Promise<void> => {
  const supabase = getSupabaseClient();

  // Check if profile already exists
  const { data: existing } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .single();

  if (existing) {
    return; // Profile already exists, don't overwrite
  }

  // Create new profile with OAuth data
  const fullName = metadata.full_name || metadata.name || email?.split("@")[0] || "";
  const avatarUrl = metadata.picture || metadata.avatar_url || null;

  await supabase.from("profiles").insert({
    user_id: userId,
    full_name: fullName,
    avatar_url: avatarUrl,
  });
};
