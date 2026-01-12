"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Mail, 
  ArrowLeft, 
  CheckCircle2,
  Loader2,
  Star
} from "lucide-react";
import Link from "next/link";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsLoading(false);
    setIsSuccess(true);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ backgroundColor: "#FFFDF5" }}
    >
      {/* Background Watermark - Lotus */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.svg
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.04, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          width="800"
          height="800"
          viewBox="0 0 400 400"
          className="text-[#9B1B1B]"
        >
          {/* Large Decorative Lotus */}
          <g transform="translate(200, 200)">
            {/* Center petals */}
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(0)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(30)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(60)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(90)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(120)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(150)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(180)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(210)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(240)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(270)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(300)"/>
            <ellipse cx="0" cy="80" rx="25" ry="80" fill="currentColor" transform="rotate(330)"/>
            {/* Center circle */}
            <circle cx="0" cy="0" r="40" fill="currentColor"/>
          </g>
        </motion.svg>
      </div>

      {/* Decorative Stars */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.06 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="absolute top-20 left-20"
      >
        <Star className="w-32 h-32 text-[#F59E0B] fill-[#F59E0B]" strokeWidth={0.5} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.04 }}
        transition={{ delay: 0.7, duration: 1 }}
        className="absolute bottom-20 right-20"
      >
        <Star className="w-48 h-48 text-[#9B1B1B] fill-[#9B1B1B]" strokeWidth={0.5} />
      </motion.div>

      {/* Glassmorphism Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div 
          className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-3xl shadow-2xl p-8 lg:p-10"
          style={{
            boxShadow: "0 8px 32px rgba(155, 27, 27, 0.1), 0 0 0 1px rgba(255,255,255,0.5) inset"
          }}
        >
          <AnimatePresence mode="wait">
            {!isSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#9B1B1B] to-[#7A1515] flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-serif text-2xl lg:text-3xl font-bold text-[#1F2937] text-center mb-3"
                >
                  Khôi phục mật khẩu
                </motion.h1>

                {/* Instruction */}
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-gray-500 text-center mb-8 font-sans text-sm lg:text-base leading-relaxed"
                >
                  Vui lòng nhập địa chỉ Email để nhận liên kết đặt lại mật khẩu.
                </motion.p>

                {/* Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  {/* Email Input */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email"
                      className="w-full pl-12 pr-4 py-4 bg-white/80 border-2 border-gray-200 rounded-xl font-sans text-[#1F2937] placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-[#F59E0B] focus:ring-4 focus:ring-yellow-100 focus:bg-white"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={isLoading || !email.trim()}
                    whileHover={{ scale: isLoading ? 1 : 1.02 }}
                    whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    className={`w-full py-4 px-6 bg-gradient-to-r from-[#9B1B1B] to-[#B82828] hover:from-[#7A1515] hover:to-[#9B1B1B] text-white font-sans font-bold text-sm uppercase tracking-wider rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center ${
                      isLoading || !email.trim() ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi yêu cầu"
                    )}
                  </motion.button>
                </motion.form>

                {/* Back to Login Link */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 text-center"
                >
                  <Link
                    href="/auth"
                    className="inline-flex items-center text-gray-500 hover:text-[#9B1B1B] font-sans text-sm transition-colors duration-300 group"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
                    Quay lại Đăng nhập
                  </Link>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-center py-6"
              >
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="flex justify-center mb-6"
                >
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={1.5} />
                  </div>
                </motion.div>

                {/* Success Title */}
                <motion.h2
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-2xl lg:text-3xl font-bold text-[#1F2937] mb-4"
                >
                  Đã gửi hướng dẫn!
                </motion.h2>

                {/* Success Message */}
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-gray-500 font-sans mb-8 leading-relaxed"
                >
                  Vui lòng kiểm tra email <span className="font-semibold text-[#9B1B1B]">{email}</span> để nhận liên kết đặt lại mật khẩu.
                </motion.p>

                {/* Decorative Divider */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="w-16 h-1 bg-[#F59E0B] rounded-full mx-auto mb-8"
                />

                {/* Back to Login Button */}
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Link
                    href="/auth"
                    className="inline-flex items-center px-6 py-3 bg-[#9B1B1B] hover:bg-[#7A1515] text-white font-sans font-semibold text-sm rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Quay lại Đăng nhập
                  </Link>
                </motion.div>

                {/* Additional Help */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-6 text-xs text-gray-400 font-sans"
                >
                  Không nhận được email? Kiểm tra thư mục spam hoặc{" "}
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setEmail("");
                    }}
                    className="text-[#9B1B1B] hover:underline"
                  >
                    thử lại
                  </button>
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-xs text-gray-400 font-sans">
            © 2026 Chatbot Chủ nghĩa xã hội khoa học
          </p>
        </motion.footer>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

