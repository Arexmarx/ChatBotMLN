"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { MoreHorizontal, Edit3, Trash2, X } from "lucide-react"
import type { Quiz } from "@/lib/chatbotService"

type QuizViewProps = {
  quiz: Quiz
  onRename?: (quizId: string, newTitle: string) => void
  onDelete?: (quizId: string) => void
}

export default function QuizView({ quiz, onRename, onDelete }: QuizViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [showMenu, setShowMenu] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameValue, setRenameValue] = useState(quiz.title)

  const handleSelectAnswer = (questionId: number, optionIndex: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }))
  }

  const handleRename = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== quiz.title) {
      onRename?.(quiz.id, trimmed)
    }
    setShowRenameModal(false)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${quiz.title}"?`)) {
      onDelete?.(quiz.id)
    }
  }
  return (
    <div className="flex h-full flex-col overflow-hidden" style={{ backgroundColor: "var(--chat-background)" }}>
      {/* Header */}
      <div
        className="border-b px-6 py-4"
        style={{ borderColor: "var(--chat-border)", backgroundColor: "var(--chat-surface)" }}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold" style={{ color: "var(--chat-text)" }}>
              📚 {quiz.title}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--chat-muted)" }}>
              {quiz.questions.length} questions · Created {new Date(quiz.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-lg p-2 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            >
              <MoreHorizontal className="h-5 w-5" style={{ color: "var(--chat-muted)" }} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-40 rounded-lg border bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900 z-[200]"
                  style={{ borderColor: "var(--chat-border)" }}
                >
                  <button
                    onClick={() => {
                      setShowRenameModal(true)
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Edit3 className="h-4 w-4" />
                    Rename
                  </button>
                  <button
                    onClick={() => {
                      handleDelete()
                      setShowMenu(false)
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {quiz.questions.map((q, idx) => {
            const userAnswer = selectedAnswers[q.id]
            const answered = userAnswer !== undefined
            const isCorrect = answered && userAnswer === q.correctAnswer

            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border p-6"
                style={{ borderColor: "var(--chat-border)", backgroundColor: "var(--chat-surface)" }}
              >
                <div className="mb-4">
                  <div className="mb-3 flex items-start gap-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{ backgroundColor: "var(--chat-accent)", color: "var(--chat-accent-contrast)" }}
                    >
                      {idx + 1}
                    </span>
                    <p className="flex-1 text-base font-semibold leading-relaxed" style={{ color: "var(--chat-text)" }}>
                      {q.question}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {q.options.map((option, optIdx) => {
                    const shouldShowAsCorrect = answered && optIdx === q.correctAnswer
                    const shouldShowAsWrong = answered && userAnswer === optIdx && userAnswer !== q.correctAnswer

                    return (
                      <button
                        key={optIdx}
                        onClick={() => !answered && handleSelectAnswer(q.id, optIdx)}
                        disabled={answered}
                        className={`w-full flex items-start gap-3 rounded-lg px-4 py-3 text-sm transition-all text-left ${
                          !answered
                            ? "cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-700 bg-zinc-100 dark:bg-zinc-800"
                            : shouldShowAsCorrect
                            ? "bg-green-100 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-600"
                            : shouldShowAsWrong
                            ? "bg-red-100 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600"
                            : "bg-zinc-100 dark:bg-zinc-800 border border-transparent"
                        }`}
                      >
                        <span
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            shouldShowAsCorrect
                              ? "bg-green-600 text-white dark:bg-green-500"
                              : shouldShowAsWrong
                              ? "bg-red-600 text-white dark:bg-red-500"
                              : "bg-zinc-300 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span
                          className={`flex-1 ${
                            shouldShowAsCorrect
                              ? "font-semibold text-green-900 dark:text-green-100"
                              : shouldShowAsWrong
                              ? "font-semibold text-red-900 dark:text-red-100"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {option}
                        </span>
                        {shouldShowAsCorrect && <span className="text-green-600 dark:text-green-400 text-lg">✓</span>}
                        {shouldShowAsWrong && <span className="text-red-600 dark:text-red-400 text-lg">✗</span>}
                      </button>
                    )
                  })}
                </div>

                {answered && isCorrect && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border-l-4 p-4 text-sm"
                    style={{
                      borderColor: "var(--chat-accent)",
                      backgroundColor: "var(--chat-background)",
                      color: "var(--chat-text)",
                    }}
                  >
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--chat-accent)" }}>
                      💡 Explanation
                    </p>
                    <p className="leading-relaxed" style={{ color: "var(--chat-text)" }}>
                      {q.explanation}
                    </p>
                  </motion.div>
                )}

                {answered && !isCorrect && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg p-4 text-sm mb-3"
                    style={{
                      backgroundColor: "var(--chat-background)",
                      border: "1px solid var(--chat-border)",
                    }}
                  >
                    <p className="mb-2 text-xs font-semibold text-red-600 dark:text-red-400">
                      ✗ Incorrect
                    </p>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--chat-accent)" }}>
                      💡 Explanation
                    </p>
                    <p className="leading-relaxed" style={{ color: "var(--chat-text)" }}>
                      {q.explanation}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Rename Modal */}
      <AnimatePresence>
        {showRenameModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowRenameModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md rounded-xl border bg-white p-6 shadow-2xl dark:bg-zinc-900"
              style={{ borderColor: "var(--chat-border)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowRenameModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--chat-text)" }}>
                Rename Quiz
              </h3>

              <input
                autoFocus
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename()
                  else if (e.key === "Escape") setShowRenameModal(false)
                }}
                className="w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "var(--chat-border)",
                  backgroundColor: "var(--chat-background)",
                  color: "var(--chat-text)",
                } as React.CSSProperties}
                placeholder="Enter new quiz name..."
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  style={{ color: "var(--chat-text)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRename}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: "var(--chat-accent)" }}
                >
                  Rename
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
