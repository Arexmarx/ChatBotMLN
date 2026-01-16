"use client";
import React, { useState, useRef, useEffect } from "react";
import { X, Camera, Loader2 } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { upsertUserProfile, type UserProfile } from "@/lib/profileService";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  profile?: UserProfile | null;
  onProfileUpdate?: (data: { name: string; avatarUrl: string }) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  onProfileUpdate,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Get current user data - prioritize profile from database over OAuth metadata
  const metadata = user.user_metadata ?? {};
  const currentAvatarUrl =
    profile?.avatar_url ||
    (typeof metadata.avatar_url === "string"
      ? metadata.avatar_url
      : typeof metadata.picture === "string"
      ? metadata.picture
      : null);
  const currentName =
    profile?.full_name || (typeof metadata.full_name === "string" ? metadata.full_name : "");
  const userInitial =
    currentName.charAt(0).toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "U";

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(currentName);
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [isOpen, currentName]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }

      setAvatarFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let uploadedAvatarUrl = currentAvatarUrl;

      // Upload avatar to Cloudinary if user selected a new image
      if (avatarFile) {
        uploadedAvatarUrl = await uploadImageToCloudinary(avatarFile);
        console.log("Avatar uploaded to Cloudinary:", uploadedAvatarUrl);
      }

      // Update user profile in database (not user_metadata)
      const { error } = await upsertUserProfile(
        user.id,
        name,
        uploadedAvatarUrl || ""
      );
      
      if (error) {
        console.error("Failed to update profile:", error);
        alert("Không thể cập nhật hồ sơ. Vui lòng thử lại.");
        return;
      }

      console.log("Profile updated successfully:", { name, avatarUrl: uploadedAvatarUrl });

      // Call the update callback
      onProfileUpdate?.({ name, avatarUrl: uploadedAvatarUrl || "" });

      // Close modal after successful update
      alert("Cập nhật hồ sơ thành công!");
      onClose();
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert(
        error instanceof Error 
          ? `Lỗi: ${error.message}` 
          : "Không thể cập nhật hồ sơ. Vui lòng kiểm tra kết nối và thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const displayAvatar = avatarPreview || currentAvatarUrl;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            Chỉnh sửa hồ sơ
          </h2>
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Ảnh đại diện
              </p>
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isLoading}
                  className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-red-100 bg-red-50 transition-all hover:border-red-200 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-3xl font-semibold text-red-600">
                      {userInitial}
                    </span>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isLoading}
                className="mt-3 text-sm font-medium text-red-600 hover:text-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Thay đổi ảnh
              </button>
              {avatarFile && (
                <p className="mt-1 text-xs text-gray-500">
                  Đã chọn: {avatarFile.name}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100" />

            {/* Name Section */}
            <div>
              <label
                htmlFor="profile-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Họ và tên
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
                placeholder="Nhập họ và tên của bạn"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-70"
              />
            </div>

            {/* Email (readonly info) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-gray-500 text-sm">
                {user.email}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Email không thể thay đổi
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl transition-all hover:bg-gray-50 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#9B1B1B] rounded-xl transition-all hover:bg-[#7A1515] shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;

