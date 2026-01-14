"use client";

import React, { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { signInWithGoogle, signOutUser } from "@/app/api/authApi";
import { useAuth } from "@/context/AuthContext";

interface AuthButtonProps {
  className?: string;
  showAvatar?: boolean;
  showDropdown?: boolean;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  className = "",
  showAvatar = true,
  showDropdown = false,
}) => {
  const { user, profile, loading } = useAuth();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get avatar data
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.picture || null;
  const fullName = profile?.full_name || user?.user_metadata?.full_name || "";
  const email = user?.email || "";
  const initial = fullName
    ? fullName.charAt(0).toUpperCase()
    : email
    ? email.charAt(0).toUpperCase()
    : "U";

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const redirectTo = `${window.location.origin}/authenticated`;
      const { error } = await signInWithGoogle(redirectTo);

      if (error) {
        console.error("Google sign-in failed:", error);
        setIsGoogleLoading(false);
      }
      // If successful, user will be redirected to /authenticated
    } catch (err) {
      console.error("Supabase client unavailable", err);
      setIsGoogleLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await signOutUser();
      if (error) {
        console.error("Sign out failed:", error);
      }
    } catch (err) {
      console.error("Supabase client unavailable", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
        <div className="hidden h-4 w-24 animate-pulse rounded bg-gray-200 md:block" />
      </div>
    );
  }

  // Not logged in - Show Google Sign In button
  if (!user) {
    return (
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className={`flex items-center justify-center gap-3 rounded-full border-2 border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 shadow-sm transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      >
        {isGoogleLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="hidden sm:inline">Đang chuyển hướng...</span>
            <span className="sm:hidden">Đang xử lý...</span>
          </>
        ) : (
          <>
            {/* Google Icon */}
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="hidden sm:inline">Đăng nhập với Google</span>
            <span className="sm:hidden">Đăng nhập</span>
          </>
        )}
      </button>
    );
  }

  // Logged in - Show Avatar + Logout button
  if (showDropdown) {
    // Dropdown version (for Header)
    return (
      <div className={`relative flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={isLoggingOut}
          className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {showAvatar && (
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-red-100 text-red-600">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || email}
                  className="h-full w-full object-cover"
                />
              ) : (
                initial
              )}
            </span>
          )}
          <span className="hidden max-w-[160px] truncate text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:block">
            {fullName || email.split("@")[0] || "Người dùng"}
          </span>
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
          ) : (
            <LogOut className="h-4 w-4 text-red-500" />
          )}
        </button>
      </div>
    );
  }

  // Simple version - Avatar + Logout button side by side
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showAvatar && (
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-red-100 text-red-600">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName || email}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold">{initial}</span>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={handleSignOut}
        disabled={isLoggingOut}
        className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isLoggingOut ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang đăng xuất...</span>
          </>
        ) : (
          <>
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AuthButton;

