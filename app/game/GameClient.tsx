"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, RotateCcw, RefreshCw } from "lucide-react";
import { fetchSupabaseSession } from "@/app/api/authApi";
import Header from "@/components/layout/Header";

const QUESTION_COUNT = 12;

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
};

type LeaderboardEntry = {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string | null;
};

export default function GameClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const startTimeRef = useRef<number | null>(null);

  const loadQuizzesFromApi = async (): Promise<{ data: QuizQuestion[] | null; error?: string }> => {
    try {
      const response = await fetch(`/api/game?count=${QUESTION_COUNT}`, {
        cache: "no-store",
      });

      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (!response.ok) {
        const message =
          payload && typeof payload === "object" && payload !== null && "error" in payload
            ? String((payload as { error?: unknown }).error ?? "")
            : "";
        throw new Error(message || `Failed to fetch quizzes (${response.status})`);
      }

      const rawQuizzes =
        payload && typeof payload === "object" && payload !== null && Array.isArray((payload as { quizzes?: unknown }).quizzes)
          ? (payload as { quizzes: unknown[] }).quizzes
          : [];

      const sanitized = rawQuizzes
        .map<QuizQuestion | null>((item) => {
          if (!item || typeof item !== "object") {
            return null;
          }

          const record = item as Record<string, unknown>;
          const id = typeof record.id === "string" ? record.id : null;
          const question = typeof record.question === "string" ? record.question : null;
          const optionsRaw = Array.isArray(record.options) ? record.options : [];
          const options = optionsRaw.filter((opt): opt is string => typeof opt === "string");

          let correctIndexValue: number | null = null;
          if (typeof record.correctOptionIndex === "number") {
            correctIndexValue = record.correctOptionIndex;
          } else if (typeof record.correct_option_index === "number") {
            correctIndexValue = record.correct_option_index;
          } else if (typeof record.correctOptionIndex === "string") {
            const parsed = Number(record.correctOptionIndex);
            if (Number.isInteger(parsed)) {
              correctIndexValue = parsed;
            }
          } else if (typeof record.correct_option_index === "string") {
            const parsed = Number(record.correct_option_index);
            if (Number.isInteger(parsed)) {
              correctIndexValue = parsed;
            }
          }

          if (!id || !question || options.length < 2 || correctIndexValue === null || !Number.isInteger(correctIndexValue)) {
            return null;
          }

          const correctOptionIndex = Number(correctIndexValue);
          if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
            return null;
          }

          return {
            id,
            question,
            options,
            correctOptionIndex,
          };
        })
        .filter((quiz): quiz is QuizQuestion => Boolean(quiz));

      if (!sanitized.length) {
        return { data: null, error: "Hiện chưa có câu hỏi nào khả dụng." };
      }

      return { data: sanitized.slice(0, QUESTION_COUNT) };
    } catch (loadError) {
      console.error("GameClient: unable to fetch quizzes via API", loadError);
      return { data: null, error: "Không thể tải câu hỏi. Vui lòng thử lại sau." };
    }
  };

  useEffect(() => {
    let active = true;

    const initialiseGame = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data } = await fetchSupabaseSession();
        if (!active) return;

        const sessionUser = data.session?.user ?? null;
        if (!sessionUser) {
          setError("Bạn cần đăng nhập để chơi trò này.");
          router.replace("/");
          return;
        }

        setUserId(sessionUser.id);

        const { data: quizData, error: quizError } = await loadQuizzesFromApi();
        if (!active) return;

        if (!quizData || !quizData.length) {
          setError(quizError ?? "Hiện chưa có câu hỏi nào khả dụng.");
          return;
        }

        setQuestions(quizData);
        setAnswers(new Array(quizData.length).fill(-1));
        setCurrentIndex(0);
        setSelectedOption(null);
        startTimeRef.current = Date.now();
        setNow(Date.now());
      } catch (initialiseError) {
        console.error("GameClient: unexpected error", initialiseError);
        if (active) {
          setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initialiseGame();

    return () => {
      active = false;
    };
  }, [router]);

  const hasFinished = useMemo(() => score !== null, [score]);

  const currentQuestion = useMemo(() => questions[currentIndex] ?? null, [questions, currentIndex]);

  useEffect(() => {
    if (hasFinished) {
      return undefined;
    }

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [hasFinished]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const submitResult = async (finalScore: number, totalQuestions: number, elapsedSeconds: number) => {
    if (!userId) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          score: finalScore,
          totalQuestions,
          timeSpent: elapsedSeconds,
        }),
      });

      if (!response.ok) {
        console.error("GameClient: failed to save leaderboard entry", await response.text());
      }
    } catch (submitError) {
      console.error("GameClient: leaderboard submission failed", submitError);
    }

    try {
      const leaderboardResponse = await fetch("/api/leaderboard?limit=10", {
        cache: "no-store",
      });

      const payload = await leaderboardResponse.json().catch(() => null);
      if (
        leaderboardResponse.ok &&
        payload &&
        typeof payload === "object" &&
        Array.isArray((payload as { entries?: unknown }).entries)
      ) {
        const rawEntries = (payload as { entries: unknown[] }).entries;
        const sanitized = rawEntries.reduce<LeaderboardEntry[]>((acc, item) => {
          if (!item || typeof item !== "object") {
            return acc;
          }
          const record = item as Record<string, unknown>;
          if (
            typeof record.id === "string" &&
            typeof record.user_id === "string" &&
            typeof record.score === "number" &&
            typeof record.total_questions === "number" &&
            typeof record.time_spent === "number"
          ) {
            acc.push({
              id: record.id,
              user_id: record.user_id,
              score: record.score,
              total_questions: record.total_questions,
              time_spent: record.time_spent,
              completed_at: typeof record.completed_at === "string" ? record.completed_at : null,
            });
          }
          return acc;
        }, []);
        setLeaderboard(sanitized);
      } else if (!leaderboardResponse.ok) {
        console.error("GameClient: failed to load leaderboard", payload);
      } else {
        setLeaderboard([]);
      }
    } catch (loadError) {
      console.error("GameClient: unable to refresh leaderboard", loadError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (selectedOption === null || !questions.length) {
      return;
    }

    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = selectedOption;
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(updatedAnswers[currentIndex + 1] >= 0 ? updatedAnswers[currentIndex + 1] : null);
      return;
    }

    const finalScore = updatedAnswers.reduce((total, answer, index) => {
      const q = questions[index];
      if (!q) return total;
      return answer === q.correctOptionIndex ? total + 1 : total;
    }, 0);

    const elapsedSeconds = startTimeRef.current ? Math.max(0, Math.round((Date.now() - startTimeRef.current) / 1000)) : 0;

    setScore(finalScore);
    setTimeSpent(elapsedSeconds);

    void submitResult(finalScore, questions.length, elapsedSeconds);
  };

  const handleRestart = () => {
    setScore(null);
    setTimeSpent(0);
    setLeaderboard([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswers([]);
    startTimeRef.current = null;
    setNow(Date.now());

    // Reload questions
    setLoading(true);
    setError(null);

    const reload = async () => {
      try {
        const { data: quizData, error: quizzesError } = await loadQuizzesFromApi();

        if (!quizData || !quizData.length) {
          setError(quizzesError ?? "Không thể tải câu hỏi mới.");
          return;
        }

        setQuestions(quizData);
        setAnswers(new Array(quizData.length).fill(-1));
        setCurrentIndex(0);
        setSelectedOption(null);
        startTimeRef.current = Date.now();
        setNow(Date.now());
      } catch (reloadError) {
        console.error("GameClient: reload failed", reloadError);
        setError("Không thể tải lại trò chơi.");
      } finally {
        setLoading(false);
      }
    };

    void reload();
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Đang tải trò chơi...</div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-white font-sans">
      <Header/>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm font-semibold text-red-600">{error}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRestart}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-600"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            Quay về trang chủ
          </Link>
        </div>
      </div>
        </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">Không tìm thấy câu hỏi nào.</div>
      </div>
    );
  }

  if (hasFinished && score !== null) {
    return (
      <div className="mx-auto mt-10 flex max-w-4xl flex-col gap-8">
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Trophy className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-emerald-700">Bạn đã hoàn thành!</h1>
          <p className="mt-2 text-sm text-emerald-700">
            Số câu đúng: <strong>{score}</strong> / {questions.length} &bull; Thời gian: <strong>{formatTime(timeSpent)}</strong>
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              <RotateCcw className="h-4 w-4" />
              Chơi lại
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 px-6 py-3 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-100"
            >
              Quay về trang chủ
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Bảng xếp hạng</h2>
          <p className="mt-2 text-sm text-gray-600">Top người chơi có thành tích tốt nhất gần đây.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs uppercase">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Người chơi</th>
                  <th className="px-4 py-3">Điểm</th>
                  <th className="px-4 py-3">Số câu</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3">Hoàn thành</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-5 text-center text-xs text-gray-500">
                      Chưa có dữ liệu bảng xếp hạng.
                    </td>
                  </tr>
                )}
                {leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.user_id === userId;
                  return (
                    <tr
                      key={entry.id}
                      className={isCurrentUser ? "bg-emerald-50/70" : undefined}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {isCurrentUser ? "Bạn" : entry.user_id.slice(0, 8)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">{entry.score}</td>
                      <td className="px-4 py-3 text-gray-700">{entry.total_questions}</td>
                      <td className="px-4 py-3 text-gray-700">{formatTime(entry.time_spent)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {entry.completed_at ? new Date(entry.completed_at).toLocaleString() : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        {submitting && (
          <p className="text-center text-xs text-gray-500">Đang cập nhật bảng xếp hạng...</p>
        )}
      </div>
    );
  }
  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-gray-500">
          <span>Câu hỏi {currentIndex + 1} / {questions.length}</span>
          <span>
            Thời gian: {formatTime(startTimeRef.current ? Math.max(0, Math.round((now - startTimeRef.current) / 1000)) : 0)}
          </span>
        </div>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">{currentQuestion.question}</h1>
        <div className="mt-6 grid gap-3">
          {currentQuestion.options.map((option, optionIndex) => {
            const isSelected = selectedOption === optionIndex;
            return (
              <button
                key={optionIndex}
                type="button"
                onClick={() => setSelectedOption(optionIndex)}
                className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
                  isSelected ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-white hover:border-emerald-300"
                }`}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current text-xs font-semibold">
                  {String.fromCharCode(65 + optionIndex)}
                </span>
                <span className="ml-3 align-middle text-gray-800">{option}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
          <button
            type="button"
            onClick={() => {
              if (currentIndex === 0) return;
              setCurrentIndex((prev) => prev - 1);
              const previousSelection = answers[currentIndex - 1];
              setSelectedOption(previousSelection >= 0 ? previousSelection : null);
            }}
            className="rounded-full border border-gray-200 px-4 py-2 font-semibold transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={currentIndex === 0}
          >
            Quay lại
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={selectedOption === null}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {currentIndex + 1 === questions.length ? "Hoàn thành" : "Câu tiếp theo"}
          </button>
        </div>
      </div>
    </div>
  );
}
