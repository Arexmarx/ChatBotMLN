"use client";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, Library, Network, GraduationCap, ArrowRight, X, Trophy } from "lucide-react";
import { fetchSupabaseSession, subscribeToAuthChanges } from "@/app/api/authApi";
import { getSupabaseClient } from "@/lib/supabaseClient";

const pillars = [
  {
    title: "Nền tảng lý luận",
    description:
      "Hiểu rõ các nguyên lý của chủ nghĩa Mác - Lênin và sự phát triển của khoa học xã hội học.",
    icon: GraduationCap,
  },
  {
    title: "Liên hệ lịch sử",
    description:
      "Phân tích tiến trình cách mạng Việt Nam qua từng giai đoạn gắn liền với phong trào công nhân thế giới.",
    icon: Library,
  },
  {
    title: "Ứng dụng hiện tại",
    description:
      "Đối thoại cùng AI để khám phá các luận điểm về con đường đi lên chủ nghĩa xã hội của Việt Nam.",
    icon: Network,
  },
];

const timeline = [
  {
    year: "1848",
    title: "Tuyên ngôn Đảng Cộng sản",
    description: "Cơ sở lý luận nền tảng do C. Mác và Ph. Ăng-ghen xây dựng.",
  },
  {
    year: "1917",
    title: "Cách mạng Tháng Mười Nga",
    description: "Biến lý luận thành hiện thực, mở ra thời đại quá độ lên CNXH trên thế giới.",
  },
  {
    year: "1930",
    title: "Đảng Cộng sản Việt Nam ra đời",
    description: "Đánh dấu sự kết hợp chủ nghĩa Mác - Lênin với phong trào công nhân và yêu nước Việt Nam.",
  },
  {
    year: "Đổi mới",
    title: "Từ 1986 đến nay",
    description: "Kiên định mục tiêu xã hội chủ nghĩa, sáng tạo mô hình phát triển phù hợp thực tiễn Việt Nam.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [showGameModal, setShowGameModal] = useState(false);
  const [gamePassword, setGamePassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboardEntries, setLeaderboardEntries] = useState<
    {
      id: string;
      user_id: string;
      score: number;
      total_questions: number;
      time_spent: number;
      completed_at: string | null;
      email?: string | null;
      full_name?: string | null;
    }[]
  >([]);
  const [hasViewedLeaderboard, setHasViewedLeaderboard] = useState(false);
  const [enrichingNames, setEnrichingNames] = useState(false);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const initAuth = async () => {
      try {
        const { data } = await fetchSupabaseSession();
        if (!mounted) return;
        setIsAuthenticated(Boolean(data.session?.user));
      } catch (error) {
        console.error("Unable to initialise auth state", error);
      } finally {
        if (mounted) {
          setAuthChecked(true);
        }
      }
    };

    initAuth();

    try {
      unsubscribe = subscribeToAuthChanges((_event, session) => {
        if (!mounted) return;
        setIsAuthenticated(Boolean(session?.user));
      });
    } catch (error) {
      console.error("Auth subscription failed", error);
    }

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!warningMessage) return;
    const timer = setTimeout(() => setWarningMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [warningMessage]);

  // Lock body scroll when modal is open so backdrop feels full-page
  useEffect(() => {
    if (!showGameModal || typeof document === "undefined") return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [showGameModal]);

  const handleStartChat = () => {
    if (!authChecked) {
      return;
    }

    if (isAuthenticated) {
      router.push("/chat");
      return;
    }

    setWarningMessage("Bạn cần đăng nhập để sử dụng AI.");
  };

  const resetGameModalState = () => {
    setGamePassword("");
    setPasswordError(null);
    setLeaderboardError(null);
    setLeaderboardEntries([]);
    setLoadingLeaderboard(false);
    setHasViewedLeaderboard(false);
  };

  const handleOpenGameModal = () => {
    resetGameModalState();
    setShowGameModal(true);
  };

  const handleCloseGameModal = () => {
    setShowGameModal(false);
    resetGameModalState();
  };

  const handleGameStart = () => {
    if (gamePassword.trim() !== "mln131Group3") {
      setPasswordError("Mật khẩu không đúng. Vui lòng thử lại.");
      return;
    }

    setShowGameModal(false);
    resetGameModalState();
    router.push("/game");
  };

  const handleViewLeaderboard = async () => {
    setHasViewedLeaderboard(true);
    setLoadingLeaderboard(true);
    setLeaderboardError(null);

    try {
      const response = await fetch("/api/leaderboard?limit=10", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load leaderboard");
      }

      const payload = await response.json().catch(() => null);
      const rawEntries = payload && Array.isArray(payload.entries) ? payload.entries : [];
      const sanitized = rawEntries
        .map((entry: any) => {
          if (!entry || typeof entry !== "object") return null;
          const id = typeof entry.id === "string" ? entry.id : null;
          const userId = typeof entry.user_id === "string" ? entry.user_id : null;
          const score = typeof entry.score === "number" ? entry.score : null;
          const totalQuestions = typeof entry.total_questions === "number" ? entry.total_questions : null;
          const timeSpent = typeof entry.time_spent === "number" ? entry.time_spent : null;
          const completedAt = typeof entry.completed_at === "string" || entry.completed_at === null ? entry.completed_at : null;
          const email = typeof entry.email === "string" ? entry.email : null;
          const fullName = typeof entry.full_name === "string" ? entry.full_name : null;
          if (!id || !userId || score === null || totalQuestions === null || timeSpent === null) {
            return null;
          }
          return {
            id,
            user_id: userId,
            score,
            total_questions: totalQuestions,
            time_spent: timeSpent,
            completed_at: completedAt,
            email,
            full_name: fullName,
          };
        })
        .filter(Boolean) as {
          id: string;
          user_id: string;
          score: number;
          total_questions: number;
          time_spent: number;
          completed_at: string | null;
          email?: string | null;
          full_name?: string | null;
        }[];

      setLeaderboardEntries(sanitized);
    } catch (error) {
      console.error("Unable to load leaderboard", error);
      setLeaderboardError("Không thể tải bảng xếp hạng. Vui lòng thử lại sau.");
      setLeaderboardEntries([]);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  // Client-side fallback: enrich entries with full_name from profiles if missing
  useEffect(() => {
    const needsEnrichment = leaderboardEntries.some((e) => !e.full_name);
    if (!hasViewedLeaderboard || !leaderboardEntries.length || !needsEnrichment || enrichingNames) {
      return;
    }
    let active = true;
    const enrich = async () => {
      try {
        setEnrichingNames(true);
        const ids = Array.from(new Set(leaderboardEntries.map((e) => e.user_id)));
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", ids);
        if (error || !Array.isArray(data)) {
          return;
        }
        const nameMap = new Map<string, string | null>();
        for (const p of data) {
          const id = (p as any)?.user_id as string | undefined;
          const fullName = (p as any)?.full_name as string | undefined;
          if (id) nameMap.set(id, fullName ?? null);
        }
        if (!active) return;
        setLeaderboardEntries((prev) => prev.map((e) => ({ ...e, full_name: e.full_name ?? nameMap.get(e.user_id) ?? null })));
      } catch (e) {
        // ignore
      } finally {
        if (active) setEnrichingNames(false);
      }
    };
    void enrich();
    return () => {
      active = false;
    };
  }, [hasViewedLeaderboard, leaderboardEntries, enrichingNames]);

  const leaderboardHasData = useMemo(() => leaderboardEntries.length > 0, [leaderboardEntries]);

  return (
    <div className="relative min-h-screen space-y-16 text-gray-900">
      {showGameModal && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="fixed inset-0" onClick={handleCloseGameModal} />
            <div className="relative z-[1001] w-full max-w-md rounded-3xl border border-red-100 bg-white p-6 shadow-2xl transition-all">
              <button
                type="button"
                onClick={handleCloseGameModal}
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
                    <Bot className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Truy cập trò chơi</h2>
                    <p className="text-xs text-gray-500">Nhập mật khẩu để bắt đầu chơi hoặc xem bảng xếp hạng.</p>
                  </div>
                </div>

                <label className="block text-sm font-medium text-gray-700" htmlFor="game-password">
                  Mật khẩu truy cập
                </label>
                <input
                  id="game-password"
                  type="password"
                  value={gamePassword}
                  onChange={(event) => {
                    setGamePassword(event.target.value);
                    if (passwordError) {
                      setPasswordError(null);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleGameStart();
                    }
                  }}
                  placeholder="Nhập mật khẩu"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm transition-colors focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
                />
                {passwordError && <p className="text-xs font-semibold text-red-500">{passwordError}</p>}

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleGameStart}
                    className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    Vào chơi
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleViewLeaderboard}
                    disabled={loadingLeaderboard}
                    className="inline-flex items-center gap-2 rounded-full border border-blue-200 px-5 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Trophy className="h-4 w-4" />
                    Bảng xếp hạng
                  </button>
                </div>

                {hasViewedLeaderboard && (
                  <div className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
                    <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
                      <span>Top 10 gần đây</span>
                      {loadingLeaderboard && <span className="text-xs font-normal text-gray-500">Đang tải...</span>}
                    </div>
                    {leaderboardError && <p className="text-xs font-semibold text-red-500">{leaderboardError}</p>}
                    {!loadingLeaderboard && !leaderboardError && !leaderboardHasData && (
                      <p className="text-xs text-gray-500">Chưa có dữ liệu bảng xếp hạng.</p>
                    )}
                    {!loadingLeaderboard && leaderboardHasData && (
                      <div className="max-h-60 overflow-y-auto rounded-xl border border-white/70 bg-white">
                        <table className="min-w-full divide-y divide-gray-100 text-xs">
                          <thead className="bg-gray-50 text-[11px] uppercase text-gray-500">
                            <tr>
                              <th className="px-3 py-2 text-left">#</th>
                              <th className="px-3 py-2 text-left">Người chơi</th>
                              <th className="px-3 py-2 text-right">Điểm</th>
                              <th className="px-3 py-2 text-right">Câu</th>
                              <th className="px-3 py-2 text-right">Thời gian</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {leaderboardEntries.map((entry, index) => (
                              <tr key={entry.id}>
                                <td className="px-3 py-2 font-semibold text-gray-700">{index + 1}</td>
                                <td className="px-3 py-2 text-gray-600">
                                  {(entry as any).full_name && typeof (entry as any).full_name === "string"
                                    ? (entry as any).full_name
                                    : ((entry as any).email && typeof (entry as any).email === "string"
                                        ? (entry as any).email
                                        : entry.user_id.slice(0, 8))}
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-gray-800">{entry.score}</td>
                                <td className="px-3 py-2 text-right text-gray-600">{entry.total_questions}</td>
                                <td className="px-3 py-2 text-right text-gray-600">{formatLeaderboardTime(entry.time_spent)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      <section className="overflow-hidden rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 via-white to-amber-50 shadow-lg">
        <div className="grid gap-10 px-10 py-14 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-1 text-xs font-semibold uppercase tracking-wide text-red-600">
              <Bot className="h-4 w-4" />
              Scientific Socialism
            </span>
            <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              Khám phá chủ nghĩa xã hội khoa học qua đối thoại thông minh
            </h1>
            <p className="text-base text-gray-600 md:text-lg">
              Việt Sử Chatbot đồng hành cùng bạn nghiên cứu các luận điểm cốt lõi của
              chủ nghĩa xã hội khoa học, từ nền tảng lý luận đến thực tiễn cách mạng ở Việt Nam.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartChat}
                disabled={!authChecked}
                className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                Bắt đầu trò chuyện
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleOpenGameModal}
                className="inline-flex items-center gap-2 rounded-full border border-blue-200 px-6 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50"
              >
                You want to play? Let's play
              </button>
              <Link
                href="/slides"
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Slides thuyết trình
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 rounded-full border border-red-200 px-6 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Về sản phẩm
              </Link>
            </div>
            {warningMessage && (
              <p className="text-xs font-semibold text-red-500">
                {warningMessage}
              </p>
            )}
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-6 hidden h-20 w-20 rounded-full bg-red-200 blur-2xl md:block" />
            <div className="absolute -right-16 bottom-0 hidden h-32 w-32 rounded-full bg-amber-200 blur-3xl md:block" />
            <div className="relative rounded-2xl border border-red-100 bg-white/80 p-6 backdrop-blur">
              <h2 className="text-lg font-semibold text-red-600">
                Cấu trúc học tập đề xuất
              </h2>
              <ul className="mt-5 space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  Cơ sở hình thành và phát triển của chủ nghĩa xã hội khoa học.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  Những luận điểm về sứ mệnh lịch sử của giai cấp công nhân.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  Các mô hình xây dựng CNXH và kinh nghiệm Việt Nam thời kỳ đổi mới.
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-red-500" />
                  Ứng dụng tư tưởng khoa học xã hội trong giáo dục và truyền thông.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {pillars.map((item) => (
          <article
            key={item.title}
            className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600">
              <item.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-gray-900">
              {item.title}
            </h3>
            <p className="mt-3 text-sm text-gray-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
          Dòng thời gian chủ nghĩa xã hội khoa học
        </h2>
        <p className="mt-3 text-sm text-gray-600">
          Ôn lại những mốc son quan trọng đã định hướng con đường xây dựng xã hội mới của nhân loại và Việt Nam.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-4">
              {timeline.map((milestone) => (
            <div
              key={milestone.year}
              className="rounded-2xl border border-red-100 bg-red-50/60 p-5"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-red-500">
                {milestone.year}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-gray-900">
                {milestone.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{milestone.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatLeaderboardTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}
