"use client";
import { ADMIN_ROUTES, ROUTES } from "@/constants/routes";
import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

const LoginPage: React.FC = () => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, loginWithGoogle, user } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isEmailConfirm = params.get("isEmailConfirm");
    const error = params.get("error");

    if (error === "access_denied") {
      toast.error("Đăng nhập Google bị từ chối!");
      router.replace(window.location.pathname);
    }

    if (isEmailConfirm === "true") {
      toast.success("Xác nhận email thành công! Vui lòng đăng nhập.");
      router.replace(window.location.pathname);
    } else if (isEmailConfirm === "false") {
      toast.error("Xác nhận email thất bại! Vui lòng thử lại.");
      router.replace(window.location.pathname);
    }
    // nếu null thì do nothing
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await login(userName, password);
      toast.success("Đăng nhập thành công!");
      if(localStorage.getItem("role") === "Admin") {
        router.push(ADMIN_ROUTES.DASHBOARD);
        return;
      }
      router.push(ROUTES.HOME);
    } catch (err) {
      toast.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
            Đăng Nhập
          </h1>
          <div className="flex items-center justify-center text-white text-lg mb-8">
            <span className="mr-2">Bạn chưa phải là thành viên?</span>
            <button
              onClick={() => router.push(ROUTES.DASHBOARD.PUBLIC.REGISTER)}
              className="text-cyan-300 hover:text-cyan-200 underline font-medium"
            >
              Đăng ký
            </button>
          </div>
        </div>

        <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-80 text-white rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="relative">
              <input
                type="text"
                placeholder="Tên Người dùng"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white text-white placeholder-white 
               focus:outline-none focus:border-cyan-400 text-lg py-2"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b-2 border-white text-white placeholder-white 
               focus:outline-none focus:border-cyan-400 text-lg py-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showPassword ? (
                  <FiEyeOff className="text-white w-5 h-5" />
                ) : (
                  <FiEye className="text-white w-5 h-5" />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={() =>
                  router.push(ROUTES.DASHBOARD.PUBLIC.FORGOT_PASSWORD)
                }
                className="text-cyan-300 hover:text-cyan-200 underline font-medium text-sm"
              >
                Bạn quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 bg-black bg-opacity-30 text-cyan-400 font-bold rounded-lg  
              transition-all text-lg transform hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,1)] 
              ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Social login */}
          <div className="mt-8">
            <div className="flex items-center mb-6">
              <div className="flex-1 h-px bg-white/30"></div>
              <span className="px-4 text-white text-sm">tiếp tục với</span>
              <div className="flex-1 h-px bg-white/30"></div>
            </div>

            <div className="flex justify-center space-x-6">
              <button
                onClick={() => {
                  loginWithGoogle();
                }}
                aria-label="Login with Google"
              >
                <svg className="w-12 h-12" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
