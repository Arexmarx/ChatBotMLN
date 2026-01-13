/**
 * Sync user profile after OAuth login
 * Creates profile for first-time users or returns existing profile
 */
export const syncUserProfile = async (
  userId: string,
  email: string,
  fullName?: string,
  avatarUrl?: string
): Promise<{
  userId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isNewUser: boolean;
} | null> => {
  try {
    const response = await fetch("/api/users/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        email,
        fullName,
        avatarUrl,
      }),
    });

    if (!response.ok) {
      console.error("Failed to sync user profile:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error("Error syncing user profile:", error);
    return null;
  }
};
