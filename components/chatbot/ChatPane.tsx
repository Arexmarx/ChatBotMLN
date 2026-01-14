"use client"

import { useState, forwardRef, useImperativeHandle, useRef } from "react"
import { Pencil, RefreshCw, Check, X, Square } from "lucide-react"
import Message from "./Message"
import Composer, { type ComposerHandle } from "./Composer"
import { cls, timeAgo } from "./utils"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
  onSend?: (content: string) => void | Promise<void>
  onEditMessage?: (messageId: string, newContent: string) => void
  onResendMessage?: (messageId: string) => void
  isThinking: boolean
  onPauseThinking: () => void
  userAvatar?: string | null
  userInitials?: string
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
            className="rounded-xl border border-dashed p-6 text-sm"
            style={{ borderColor: "var(--chat-border)", color: "var(--chat-muted)" }}
          >
            No messages yet. Say hello to start.
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
        onSend={async (text) => {
          if (!text.trim()) return
          setBusy(true)
          await onSend?.(text)
          setBusy(false)
        }}
        busy={busy}
      />
    </div>
  )
})

export default ChatPane
