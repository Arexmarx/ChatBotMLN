"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, 
  EyeOff, 
  User, 
  Lock, 
  Mail,
  Star,
  Sparkles
} from "lucide-react";
import Link from "next/link";

type AuthMode = "login" | "register";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    console.log("Form submitted:", { mode, formData });
    setIsLoading(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Decorative */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="lg:w-[40%] w-full lg:min-h-screen relative overflow-hidden"
        style={{ backgroundColor: "#9B1B1B" }}
      >
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="socialist-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M30 0L60 30L30 60L0 30Z" fill="none" stroke="#FFD700" strokeWidth="0.5"/>
                <circle cx="30" cy="30" r="8" fill="none" stroke="#FFD700" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#socialist-pattern)"/>
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-center items-center p-8 lg:p-12 text-center">
          {/* Star Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.5, type: "spring" }}
            className="mb-8"
          >
            <div className="relative">
              <Star 
                className="w-20 h-20 lg:w-28 lg:h-28 text-yellow-400 fill-yellow-400" 
                strokeWidth={1}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 lg:w-10 lg:h-10 text-yellow-300 opacity-60" />
              </motion.div>
            </div>
          </motion.div>

          {/* Logo/Title */}
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="font-serif text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight"
          >
            Chủ Nghĩa Xã Hội<br />
            <span className="text-yellow-400">Khoa Học</span>
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="w-16 h-1 bg-yellow-400 rounded-full mb-8"
          />

          {/* Quote */}
          <motion.blockquote
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="max-w-md"
          >
            <p className="font-serif text-lg lg:text-xl text-white/90 italic leading-relaxed mb-4">
              &ldquo;Dân chủ xã hội chủ nghĩa là bản chất của chế độ ta, vừa là mục tiêu, 
              vừa là động lực của sự phát triển đất nước.&rdquo;
            </p>
            <footer className="text-yellow-400/80 text-sm font-sans">
              — Trích dẫn về Dân chủ XHCN
            </footer>
          </motion.blockquote>

          {/* Decorative Lotus */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3"
          >
            <svg 
              width="300" 
              height="200" 
              viewBox="0 0 300 200" 
              className="text-yellow-400"
            >
              {/* Stylized Lotus */}
              <ellipse cx="150" cy="180" rx="80" ry="15" fill="currentColor" opacity="0.3"/>
              <path 
                d="M150 20 C120 60 100 100 150 160 C200 100 180 60 150 20" 
                fill="currentColor" 
                opacity="0.5"
              />
              <path 
                d="M100 50 C80 90 90 130 150 160 C120 100 110 70 100 50" 
                fill="currentColor" 
                opacity="0.4"
              />
              <path 
                d="M200 50 C220 90 210 130 150 160 C180 100 190 70 200 50" 
                fill="currentColor" 
                opacity="0.4"
              />
              <path 
                d="M70 80 C50 110 80 140 150 160 C100 120 80 100 70 80" 
                fill="currentColor" 
                opacity="0.3"
              />
              <path 
                d="M230 80 C250 110 220 140 150 160 C200 120 220 100 230 80" 
                fill="currentColor" 
                opacity="0.3"
              />
            </svg>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Form */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="lg:w-[60%] w-full min-h-screen paper-texture flex items-center justify-center p-6 lg:p-12"
      >
        <div className="w-full max-w-md">
          {/* Tab Switcher */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex mb-8 bg-white/50 rounded-xl p-1 shadow-sm border border-gray-200/50"
          >
            <button
              onClick={() => switchMode("login")}
              className={`flex-1 py-3 px-6 rounded-lg font-sans font-semibold text-sm transition-all duration-300 ${
                mode === "login"
                  ? "bg-[#9B1B1B] text-white shadow-md"
                  : "text-gray-600 hover:text-[#9B1B1B]"
              }`}
            >
              ĐĂNG NHẬP
            </button>
            <button
              onClick={() => switchMode("register")}
              className={`flex-1 py-3 px-6 rounded-lg font-sans font-semibold text-sm transition-all duration-300 ${
                mode === "register"
                  ? "bg-[#9B1B1B] text-white shadow-md"
                  : "text-gray-600 hover:text-[#9B1B1B]"
              }`}
            >
              ĐĂNG KÝ
            </button>
          </motion.div>

          {/* Form Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-center mb-8"
          >
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-[#1F2937] mb-2">
              {mode === "login" ? "Chào mừng trở lại" : "Tạo tài khoản mới"}
            </h2>
            <p className="text-gray-500 font-sans">
              {mode === "login"
                ? "Đăng nhập để tiếp tục học tập"
                : "Đăng ký để bắt đầu hành trình học tập"}
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="fullName"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Full Name Input */}
                  <div className="relative mb-5">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Họ và tên"
                      className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl font-sans text-[#1F2937] placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-yellow-100"
                      required={mode === "register"}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl font-sans text-[#1F2937] placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-yellow-100"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Mật khẩu"
                className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl font-sans text-[#1F2937] placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-yellow-100"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#9B1B1B] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "register" && (
                <motion.div
                  key="confirmPassword"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Confirm Password Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Xác nhận mật khẩu"
                      className="w-full pl-12 pr-12 py-4 bg-white border-2 border-gray-200 rounded-xl font-sans text-[#1F2937] placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-yellow-100"
                      required={mode === "register"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#9B1B1B] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Forgot Password Link (Login only) */}
            {mode === "login" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-right"
              >
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-[#9B1B1B] hover:text-[#7A1515] font-sans font-medium hover:underline transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 px-6 bg-[#9B1B1B] hover:bg-[#7A1515] text-white font-sans font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Đang xử lý...
                </span>
              ) : mode === "login" ? (
                "ĐĂNG NHẬP"
              ) : (
                "ĐĂNG KÝ"
              )}
            </motion.button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center my-8"
          >
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="px-4 text-gray-400 text-sm font-sans">hoặc</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </motion.div>

          {/* Switch Mode Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-gray-500 font-sans"
          >
            {mode === "login" ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-[#9B1B1B] hover:text-[#7A1515] font-semibold hover:underline transition-colors"
            >
              {mode === "login" ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </motion.p>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12 text-center"
          >
            <p className="text-xs text-gray-400 font-sans">
              © 2026 Chatbot Chủ nghĩa xã hội khoa học
            </p>
            <p className="text-xs text-gray-400 font-sans mt-1">
              Hệ thống hỗ trợ học tập trực tuyến
            </p>
          </motion.footer>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;

