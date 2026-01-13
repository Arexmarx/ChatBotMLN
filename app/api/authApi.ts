import { getSupabaseClient } from "@/lib/supabaseClient";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export const fetchSupabaseSession = () => {
	const supabase = getSupabaseClient();
	return supabase.auth.getSession();
};

export const subscribeToAuthChanges = (
	callback: (event: AuthChangeEvent, session: Session | null) => void,
) => {
	const supabase = getSupabaseClient();
	const { data } = supabase.auth.onAuthStateChange(callback);
	return () => {
		data.subscription.unsubscribe();
	};
};

export const signInWithGoogle = (redirectTo?: string) => {
	const supabase = getSupabaseClient();
	return supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			...(redirectTo ? { redirectTo } : {}),
			// Skip auto-refresh to prevent metadata overwrite
			skipBrowserRedirect: false,
		},
	});
};

export const signOutUser = () => {
	const supabase = getSupabaseClient();
	return supabase.auth.signOut();
};

/**
 * Update user profile (name and avatar)
 * @param fullName - User's full name
 * @param avatarUrl - URL of the avatar image
 */
export const updateUserProfile = async (
	fullName: string,
	avatarUrl: string
) => {
	const supabase = getSupabaseClient();
	
	// Get current user to preserve existing metadata
	const { data: { user } } = await supabase.auth.getUser();
	const existingMetadata = user?.user_metadata || {};
	
	return supabase.auth.updateUser({
		data: {
			...existingMetadata, // Preserve all existing metadata
			full_name: fullName,
			avatar_url: avatarUrl,
		},
	});
};
