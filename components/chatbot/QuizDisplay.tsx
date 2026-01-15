"use client"

import { motion } from "framer-motion"
import type { QuizQuestion } from "@/lib/chatbotService"

type QuizDisplayProps = {
  questions: QuizQuestion[]
  title?: string
}

export default function QuizDisplay({ questions }: QuizDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 space-y-4 rounded-lg border border-zinc-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-zinc-700 dark:from-zinc-800 dark:to-zinc-800"
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">📚 Quiz Created</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">{questions.length} questions</p>
      </div>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900"
          >
            <div className="mb-2">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {idx + 1}. {q.question}
              </p>
            </div>

            <div className="space-y-1 mb-2">
              {q.options.map((option, optIdx) => (
                <div
                  key={optIdx}
                  className={`flex items-start gap-2 rounded px-2 py-1.5 text-sm ${
                    optIdx === q.correctAnswer
                      ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200"
                      : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  }`}
                >
                  <span className="font-semibold">{String.fromCharCode(65 + optIdx)}.</span>
                  <span>{option}</span>
                  {optIdx === q.correctAnswer && <span className="ml-auto">✓</span>}
                </div>
              ))}
            </div>

            <div className="text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-700 pt-2 mt-2">
              <p className="font-medium mb-1">Giải thích:</p>
              <p>{q.explanation}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-blue-100 p-2 text-xs text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
        💡 Quiz đã được lưu. Bạn có thể xem lại ở mục <strong>QUIZZES</strong> trong sidebar.
      </div>
    </motion.div>
  )
}
