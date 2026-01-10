"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Send, Facebook, Instagram } from "lucide-react";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle email submission
    console.log("Email submitted:", email);
    setEmail("");
  };

  return (
    <footer
      className={`bg-gray-50 border-t-4 border-blue-500 px-6 py-8 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center mb-6">
              <Link href="#" className="flex items-center">
                <div className="h-14 w-[140px] overflow-hidden flex items-center justify-center">
                  <img
                    src="https://res.cloudinary.com/dkzn3xjwt/image/upload/v1759841621/LOGO_WEB_BLACK_orslzj.png"
                    alt="Logo"
                    className="object-contain scale-[0.85]"
                  />
                </div>
              </Link>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-medium">Cần giúp đỡ</span>
              </p>
              <p>
                <span className="font-medium">Gọi chúng tôi: </span>
                <span className="text-red-500 font-bold">098 325 9324</span>
              </p>
              <p>TP Thủ Đức, TP Hồ Chí Minh</p>
              <p>hexaplanner@gmail.com</p>
            </div>
          </div>

          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-base mb-4">
              Công ty
            </h3>
            <div className="space-y-3">
              <Link
                href="#"
                className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Về chúng tôi
              </Link>
              <Link
                href="#"
                className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Liên hệ chúng tôi
              </Link>
              <Link
                href="#"
                className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Hướng dẫn du lịch
              </Link>
              <Link
                href="#"
                className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Chính sách đổi lịch
              </Link>
            </div>
          </div>

          {/* Popular Destinations */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800 text-base mb-4">
              Địa điểm nổi bật
            </h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <Link
                href="/phu-quoc"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Phú Quốc
              </Link>
              <Link
                href="/hoi-an"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Hội An
              </Link>
              <Link
                href="/phan-thiet"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Phan Thiết
              </Link>
              <Link
                href="/ha-noi"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Hà Nội
              </Link>
              <Link
                href="/da-lat"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Đà Lạt
              </Link>
              <Link
                href="/ho-chi-minh"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Hồ Chí Minh
              </Link>
              <Link
                href="/nha-trang"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Nha Trang
              </Link>
              <Link
                href="/sapa"
                className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
              >
                Sa pa
              </Link>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800 text-sm mb-4">
              Đăng ký nhận thông tin mới nhất
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập Email"
                  className="w-full px-4 py-3 bg-purple-100 border border-purple-200 rounded-lg text-sm placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Social Icons */}
            <div className="flex space-x-3 mt-6">
              <Link
                href="https://www.facebook.com/profile.php?id=61580875525961"
                className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white hover:bg-pink-600 transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </Link>
              <Link
                href="#"
                className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors"
              >
                <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                  <span className="text-blue-500 font-bold text-xs">D</span>
                </div>
              </Link>
            </div>

            {/* Copyright */}
            <div className="mt-6 pt-4">
              <p className="text-xs text-gray-500">
                2025 HexaCore All Right Reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
