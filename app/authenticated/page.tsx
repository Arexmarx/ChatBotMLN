"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Loader2, AlertTriangle } from "lucide-react"
import { getSupabaseClient } from "@/lib/supabaseClient"

type AuthStatus = "verifying" | "success" | "error"

type AuthenticatedLayoutProps = {
  status: AuthStatus
  email: string | null
}

function AuthenticatedLayout({ status, email }: AuthenticatedLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-rose-50 to-white px-6">
      <div className="w-full max-w-md rounded-3xl border border-red-100 bg-white p-10 text-center shadow-2xl">
        {status === "verifying" && (
          <div className="space-y-5">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500">
              <Loader2 className="h-8 w-8 animate-spin" />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">Đang xác thực tài khoản của bạn</h1>
            <p className="text-sm text-gray-600">
              Vui lòng chờ trong giây lát, chúng tôi đang kết nối với Supabase và Google.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-5">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
              <CheckCircle className="h-8 w-8" />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">Xác thực thành công</h1>
            <p className="text-sm text-gray-600">
              {email
                ? `Xin chào ${email}, bạn đã đăng nhập vào Việt Sử Chatbot.`
                : "Bạn đã đăng nhập vào Việt Sử Chatbot."}
            </p>
            <p className="text-xs uppercase tracking-wide text-gray-400">Đang chuyển về trang chủ...</p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600"
            >
              Trở về ngay bây giờ
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-5">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <AlertTriangle className="h-8 w-8" />
            </span>
            <h1 className="text-xl font-semibold text-gray-900">Đăng nhập chưa hoàn tất</h1>
            <p className="text-sm text-gray-600">
              Không thể xác minh phiên đăng nhập. Vui lòng thử lại hoặc kiểm tra cấu hình Supabase.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-red-200 px-6 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              Quay về trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function AuthenticatedContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<AuthStatus>("verifying")
  const [email, setEmail] = useState<string | null>(null)

  const code = useMemo(() => searchParams.get("code"), [searchParams])
  const authError = useMemo(() => searchParams.get("error"), [searchParams])

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const supabase = getSupabaseClient()

        if (authError) {
          setStatus("error")
          return
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error("Failed to exchange code", exchangeError)
            setStatus("error")
            return
          }
        }

        const { data, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error("Unable to fetch authenticated user", userError)
          setStatus("error")
          return
        }

        if (data?.user) {
          setEmail(data.user.email ?? null)
          setStatus("success")
          return
        }

        setStatus("error")
      } catch (err) {
        console.error("Supabase verification failed", err)
        setStatus("error")
      }
    }

    verifyUser()
  }, [code, authError])

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        router.push("/")
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [status, router])

  return <AuthenticatedLayout status={status} email={email} />
}

export default function Authenticated() {
  return (
    <Suspense fallback={<AuthenticatedLayout status="verifying" email={null} />}>
      <AuthenticatedContent />
    </Suspense>
  )
}
