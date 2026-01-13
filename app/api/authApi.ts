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
		options: redirectTo
			? {
				redirectTo,
			}
			: undefined,
	});
};

export const signOutUser = () => {
	const supabase = getSupabaseClient();
	return supabase.auth.signOut();
};
