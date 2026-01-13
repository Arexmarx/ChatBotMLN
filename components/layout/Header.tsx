"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, LogIn, ChevronDown, History, LogOut, Pencil } from "lucide-react";
import {
  fetchSupabaseSession,
  subscribeToAuthChanges,
  signOutUser,
} from "@/app/api/authApi";
import type { User } from "@supabase/supabase-js";
import EditProfileModal from "./EditProfileModal";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  className?: string;
}

const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/kien-thuc", label: "Kho tư liệu" },
  { href: "/moc-lich-su", label: "Mốc lịch sử" },
  { href: "/nhan-vat", label: "Nhân vật" },
];

const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  const router = useRouter();
  const { user: currentUser, profile, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const avatarData = useMemo(() => {
    if (!currentUser) {
      return { url: null as string | null, initial: "", fullName: "" };
    }

    // Use profile from database, fallback to OAuth metadata
    const avatarUrl = profile?.avatar_url || currentUser.user_metadata?.picture || null;
    const fullName = profile?.full_name || currentUser.user_metadata?.full_name || "";
    const emailInitial = currentUser.email?.charAt(0)?.toUpperCase();
    const nameInitial = fullName ? fullName.charAt(0).toUpperCase() : undefined;

    return {
      url: avatarUrl,
      initial: nameInitial || emailInitial || "U",
      fullName,
    };
  }, [currentUser, profile]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setAuthOpen(false);
  };

  const toggleAuth = () => {
    setAuthOpen((prev) => !prev);
    setMenuOpen(false);
  };

  const handleLoginClick = () => {
    router.push("/auth");
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOutUser();
      if (error) {
        console.error("Google logout failed", error);
        return;
      }
      setAuthOpen(false);
    } catch (err) {
      console.error("Supabase client unavailable", err);
    }
  };

  const handleEditProfile = () => {
    setAuthOpen(false);
    setIsEditProfileOpen(true);
  };

  const handleProfileUpdate = (data: { name: string; avatarUrl: string }) => {
    console.log("Profile updated:", data);
    // Profile will be auto-refreshed by AuthContext
  };

  return (
    <header
      className={`bg-white border-b border-gray-200 shadow-sm ${className}`}
    >
      <div className="relative mx-auto flex max-w-7xl flex-col px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <History className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <span className="text-base font-semibold text-gray-900">
                Việt Sử Chatbot
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Khám phá lịch sử Việt Nam
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-600 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-red-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <button
                type="button"
                onClick={toggleAuth}
                className="flex items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-red-50"
              >
                <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-red-100 text-red-600">
                  {avatarData.url ? (
                    <img
                      src={avatarData.url}
                      alt={currentUser.email ?? "Người dùng"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarData.initial
                  )}
                </span>
                <span className="hidden max-w-[160px] truncate text-left text-xs font-semibold uppercase tracking-wide text-gray-500 md:block">
                  {currentUser.email ?? "Đã đăng nhập"}
                </span>
                <ChevronDown className="h-4 w-4 text-red-500" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLoginClick}
                disabled={loading}
                className="flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:bg-red-100/60"
              >
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </button>
            )}
            <button
              type="button"
              onClick={toggleMenu}
              className="rounded-md border border-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
              aria-label="Toggle navigation"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {authOpen && currentUser && (
          <div className="absolute right-6 top-full z-20 mt-3 w-72 rounded-lg border border-gray-200 bg-white p-5 shadow-lg">
            <p className="text-xs font-semibold uppercase text-gray-500">
              Tài khoản của bạn
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-red-100 text-lg font-semibold text-red-600">
                {avatarData.url ? (
                  <img
                    src={avatarData.url}
                    alt={currentUser.email ?? "Người dùng"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarData.initial
                )}
              </span>
              <div className="flex flex-col text-sm text-gray-700">
                <span className="font-semibold text-gray-900">
                  {avatarData.fullName || currentUser.email?.split('@')[0] || "Người dùng"}
                </span>
                <span className="text-xs text-gray-500">
                  {currentUser.email}
                </span>
              </div>
            </div>

            {/* Menu Actions */}
            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={handleEditProfile}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4 text-gray-500" />
                Chỉnh sửa hồ sơ
              </button>
              
              <div className="h-px bg-gray-100" />

              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}

        {menuOpen && (
          <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 text-sm text-gray-600 md:hidden">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 transition-colors hover:bg-red-50 hover:text-red-600"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {currentUser && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={currentUser}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </header>
  );
};

export default Header;
