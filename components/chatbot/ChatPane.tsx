"use client"

import { useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Pencil, RefreshCw, Check, X, Square } from "lucide-react"
import Message from "./Message"
import Composer, { type ComposerHandle } from "./Composer"
import { cls, timeAgo } from "./utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import QuizDisplay from "./QuizDisplay"

type ConversationMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
  editedAt?: string
}

type ConversationItem = {
  id: string
  title: string
  updatedAt: string
  messageCount: number
  messages?: ConversationMessage[]
}

type ChatPaneProps = {
  conversation: ConversationItem | null
  onSend?: (content: string, mode?: "assistant" | "quiz") => void | Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => void
  onResendMessage?: (messageId: string) => void
  isThinking: boolean
  onPauseThinking: () => void
  userAvatar?: string | null
  userInitials?: string
}

const FAQ_QUESTIONS = [
  "Nền dân chủ xã hội chủ nghĩa (DCXHCN) được hình thành dựa trên cơ sở thực tiễn nào trong lịch sử?",
  "Theo chủ nghĩa Mác - Lênin, tại sao sự xuất hiện của nền DCXHCN là một tất yếu lịch sử?",
  "Phân tích các mốc thời gian quan trọng: Đâu là giai đoạn phôi thai và đâu là mốc đánh dấu sự xác lập chính thức của nền DCXHCN?",
  "Tại sao nói sự ra đời của nền DCXHCN đánh dấu một bước phát triển mới về 'chất' so với các nền dân chủ trước đó?",
  "Mối quan hệ giữa cuộc đấu tranh cho dân chủ và cuộc cách mạng xã hội chủ nghĩa của giai cấp vô sản là gì?",
  "Tại sao nền DCXHCN lại mang tính nhất nguyên về chính trị? Vai trò lãnh đạo của Đảng Cộng sản có ý nghĩa như thế nào đối với quyền lực của nhân dân?",
  "Làm rõ khái niệm 'Dân chủ xã hội chủ nghĩa là chế độ dân chủ của đại đa số dân cư'. Đối tượng thụ hưởng và đối tượng bị loại bỏ quyền dân chủ ở đây là ai?",
  "Phân tích quan điểm của Hồ Chí Minh: 'Bao nhiêu quyền lực đều là của dân, bao nhiêu sức mạnh đều ở nơi dân'. Điều này thể hiện bản chất gì của nhà nước?",
  "Sự khác biệt về chất giữa bản chất chính trị của DCXHCN và dân chủ tư sản thể hiện qua những tiêu chí nào (về đảng phái, giai cấp, nhà nước)?",
  "Nền DCXHCN dựa trên chế độ sở hữu nào về tư liệu sản xuất? Tại sao đây được coi là cơ sở để thực hiện quyền làm chủ của nhân dân?",
  "Mối quan hệ giữa sự hoàn thiện của nền DCXHCN và sự 'tiêu vong' của nó được hiểu như thế nào về mặt chính trị?",
  "Hệ tư tưởng nào giữ vai trò chủ đạo trong nền DCXHCN? Tính kế thừa các giá trị văn hóa nhân loại được thể hiện như thế nào?",
  "Tại sao nói trong nền DCXHCN, lợi ích kinh tế của người lao động là động lực cơ bản nhất?",
  "Tại sao hiện nay mức độ dân chủ ở một số nước xã hội chủ nghĩa còn có những hạn chế nhất định so với các nước tư bản phát triển?",
  "Để quyền lực thực sự thuộc về nhân dân trong chế độ DCXHCN, cần phải đảm bảo những yếu tố khách quan và chủ quan nào (về dân trí, pháp luật, vật chất)?",
  "Giải thích nhận định của V.I. Lênin: 'Chế độ dân chủ vô sản so với bất cứ chế độ dân chủ tư sản nào, cũng dân chủ hơn gấp triệu lần'.",
]

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items]
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export type ChatPaneHandle = {
  insertTemplate: (content: string) => void
}

function ThinkingMessage({ onPause }: { onPause: () => void }) {
  return (
    <Message role="assistant">
      <div className="flex items-center gap-3" style={{ color: "var(--chat-text)" }}>
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]" style={{ background: "var(--chat-muted)" }}></div>
          <div className="h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]" style={{ background: "var(--chat-muted)" }}></div>
          <div className="h-2 w-2 animate-bounce rounded-full" style={{ background: "var(--chat-muted)" }}></div>
        </div>
        <span className="text-sm" style={{ color: "var(--chat-muted)" }}>
          AI is thinking...
        </span>
        <button
          onClick={onPause}
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs hover:opacity-90"
          style={{
            border: "1px solid var(--chat-border)",
            color: "var(--chat-text)",
            background: "var(--chat-surface)",
          }}
        >
          <Square className="h-3 w-3" /> Pause
        </button>
      </div>
    </Message>
  )
}

const ChatPane = forwardRef<ChatPaneHandle, ChatPaneProps>(function ChatPane(
  { conversation, onSend, onEditMessage, onResendMessage, isThinking, onPauseThinking, userAvatar, userInitials = "U" },
  ref,
) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<string>("")
  const [busy, setBusy] = useState(false)
  const composerRef = useRef<ComposerHandle | null>(null)
  const [suggestedPrompts] = useState(() => shuffleArray(FAQ_QUESTIONS).slice(0, 3))

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent: string) => {
        composerRef.current?.insertTemplate(templateContent)
      },
    }),
    [],
  )

  if (!conversation) return null

  const tags = ["Certified", "Personalized", "Experienced", "Helpful"]
  const rawMessages: ConversationMessage[] = Array.isArray(conversation.messages) ? conversation.messages : []
  
  // Deduplicate messages by ID - keep first occurrence
  const seenIds = new Set<string>()
  const messages = rawMessages.filter((m) => {
    if (seenIds.has(m.id)) return false
    seenIds.add(m.id)
    return true
  })
  
  const count = messages.length || conversation.messageCount || 0

  function startEdit(message: ConversationMessage) {
    setEditingId(message.id)
    setDraft(message.content)
  }
  function cancelEdit() {
    setEditingId(null)
    setDraft("")
  }
  function saveEdit() {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    cancelEdit()
  }
  function saveAndResend() {
    if (!editingId) return
    onEditMessage?.(editingId, draft)
    onResendMessage?.(editingId)
    cancelEdit()
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mb-2 text-3xl font-serif tracking-tight sm:text-4xl md:text-5xl">
          <span className="block leading-[1.05] font-sans text-2xl">{conversation.title}</span>
        </div>
        <div className="mb-4 text-sm" style={{ color: "var(--chat-muted)" }}>
          Updated {timeAgo(conversation.updatedAt)} · {count} messages
        </div>

        <div className="mb-6 flex flex-wrap gap-2 border-b pb-5" style={{ borderColor: "var(--chat-border)" }}>
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded-full px-3 py-1 text-xs"
              style={{ border: `1px solid var(--chat-border)`, color: "var(--chat-text)" }}
            >
              {t}
            </span>
          ))}
        </div>

        {messages.length === 0 ? (
          <div
            className="rounded-xl border border-dashed p-6 text-sm space-y-3"
            style={{ borderColor: "var(--chat-border)", color: "var(--chat-muted)" }}
          >
            <p className="font-medium" style={{ color: "var(--chat-text)" }}>
              Chưa có tin nhắn nào. Hãy bắt đầu với một trong những câu hỏi gợi ý sau:
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => composerRef.current?.insertTemplate(prompt)}
                  className="rounded-xl border px-3 py-2 text-left text-xs transition-colors hover:bg-[var(--chat-surface)]"
                  style={{ borderColor: "var(--chat-border)", color: "var(--chat-text)" }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                {editingId === m.id ? (
                  <div className={cls("rounded-2xl border p-2")} style={{ borderColor: "var(--chat-border)", backgroundColor: "var(--chat-surface)" }}>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      className="w-full resize-y rounded-xl bg-transparent p-2 text-sm outline-none"
                      style={{ color: "var(--chat-text)" }}
                      rows={3}
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={saveEdit}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
                        style={{ background: "var(--chat-accent)", color: "var(--chat-accent-contrast)" }}
                      >
                        <Check className="h-3.5 w-3.5" /> Save
                      </button>
                      <button
                        onClick={saveAndResend}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
                        style={{ border: "1px solid var(--chat-border)", color: "var(--chat-text)" }}
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Save & Resend
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs"
                        style={{ color: "var(--chat-muted)" }}
                      >
                        <X className="h-3.5 w-3.5" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <Message role={m.role} userAvatar={m.role === "user" ? userAvatar : undefined} userInitials={userInitials}>
                    {m.role === "assistant" ? (
                      m.content.startsWith("__QUIZ__") ? (
                        <QuizDisplay
                          questions={JSON.parse(m.content.replace("__QUIZ__", ""))}
                          title="Quiz Created"
                        />
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-pre:my-2 prose-ul:my-2 prose-ol:my-2" style={{ color: "var(--chat-assistant-text)", fontWeight: "500" }}>
                          <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Customize styling for markdown elements
                            p: ({ children }) => <p className="my-2">{children}</p>,
                            ul: ({ children }) => <ul className="my-2 ml-4 list-disc">{children}</ul>,
                            ol: ({ children }) => <ol className="my-2 ml-4 list-decimal">{children}</ol>,
                            li: ({ children }) => <li className="my-1">{children}</li>,
                            strong: ({ children }) => <strong style={{ color: "var(--chat-text)", fontWeight: "700" }}>{children}</strong>,
                            em: ({ children }) => <em style={{ color: "var(--chat-text)" }}>{children}</em>,
                            code: ({ inline, children, ...props }: any) =>
                              inline ? (
                                <code
                                  className="rounded px-1 py-0.5 text-xs"
                                  style={{ background: "var(--chat-surface)", color: "var(--chat-text)", border: "1px solid var(--chat-border)" }}
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <code
                                  className="block rounded p-2 text-xs"
                                  style={{ background: "var(--chat-surface)", color: "var(--chat-text)", border: "1px solid var(--chat-border)" }}
                                  {...props}
                                >
                                  {children}
                                </code>
                              ),
                            a: ({ children, href }) => (
                              <a
                                href={href}
                                className="hover:underline"
                                style={{ color: "var(--chat-accent)" }}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {m.content}
                        </ReactMarkdown>
                      </div>
                      )
                    ) : (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    )}
                    {m.role === "user" && (
                      <div className="mt-1 flex gap-2 text-[11px]" style={{ color: "var(--chat-muted)" }}>
                        <button className="inline-flex items-center gap-1 hover:underline" onClick={() => startEdit(m)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          className="inline-flex items-center gap-1 hover:underline"
                          onClick={() => onResendMessage?.(m.id)}
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Resend
                        </button>
                      </div>
                    )}
                  </Message>
                )}
              </div>
            ))}
            {isThinking && <ThinkingMessage onPause={onPauseThinking} />}
          </>
        )}
      </div>

      <Composer
        ref={composerRef}
        onSend={async (text, mode) => {
          if (!text.trim()) return
          setBusy(true)
          await onSend?.(text, mode)
          setBusy(false)
        }}
        busy={busy}
      />
    </div>
  )
})

export default ChatPane
