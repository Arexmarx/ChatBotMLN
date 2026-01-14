"use client"

import { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react"
import { Send, Loader2, Plus, Mic } from "lucide-react"
import ComposerActionsPopover from "./ComposerActionsPopover"
import { cls } from "./utils"

export type ComposerHandle = {
  insertTemplate: (content: string) => void
  focus: () => void
}

type ComposerProps = {
  onSend?: (value: string) => void | Promise<void>
  busy?: boolean
}

const Composer = forwardRef<ComposerHandle, ComposerProps>(function Composer({ onSend, busy = false }, ref) {
  const [value, setValue] = useState<string>("")
  const [sending, setSending] = useState(false)
  const [lineCount, setLineCount] = useState(1)
  const inputRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (inputRef.current) {
      const textarea = inputRef.current
      const lineHeight = 24
      const minHeight = 24

      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      const calculatedLines = Math.max(1, Math.ceil(scrollHeight / lineHeight))

      setLineCount(calculatedLines)

      if (calculatedLines <= 12) {
        textarea.style.height = `${Math.max(minHeight, scrollHeight)}px`
        textarea.style.overflowY = "hidden"
      } else {
        textarea.style.height = `${12 * lineHeight}px`
        textarea.style.overflowY = "auto"
      }
    }
  }, [value])

  useImperativeHandle(
    ref,
    () => ({
      insertTemplate: (templateContent: string) => {
        setValue((prev) => {
          const newValue = prev ? `${prev}\n\n${templateContent}` : templateContent
          setTimeout(() => {
            inputRef.current?.focus()
            const length = newValue.length
            inputRef.current?.setSelectionRange(length, length)
          }, 0)
          return newValue
        })
      },
      focus: () => {
        inputRef.current?.focus()
      },
    }),
    [],
  )

  async function handleSend() {
    if (!value.trim() || sending) return
    setSending(true)
    try {
      await onSend?.(value)
      setValue("")
      inputRef.current?.focus()
    } finally {
      setSending(false)
    }
  }

  const hasContent = value.trim().length > 0

  return (
    <div className="border-t p-4" style={{ borderColor: "var(--chat-border)", backgroundColor: "var(--chat-background)" }}>
      <div
        className="mx-auto flex flex-col rounded-3xl border shadow-sm transition-all duration-200 max-w-3xl"
        style={{ borderColor: "var(--chat-border)", backgroundColor: "var(--chat-surface)" }}
      >
        {/* Textarea area - grows upward */}
        <div className="flex-1 px-4 pt-4 pb-2">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="How can I help you today?"
            rows={1}
            className={cls(
              "w-full resize-none bg-transparent text-sm outline-none transition-all duration-200",
              "min-h-[24px] text-left leading-6",
            )}
            style={{ color: "var(--chat-input-text, var(--chat-text))", "--placeholder-color": "var(--chat-muted)" } as any}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
        </div>

        {/* Bottom toolbar: + on left, mic/send on right */}
        <div className="flex items-center justify-between px-3 pb-3">
          <ComposerActionsPopover>
            <button
              className="inline-flex shrink-0 items-center justify-center rounded-full p-2 transition-colors"
              style={{ color: "var(--chat-muted)" }}
              title="Add attachment"
            >
              <Plus className="h-5 w-5" />
            </button>
          </ComposerActionsPopover>

          <div className="flex items-center gap-1 shrink-0">
            <button
              className="inline-flex items-center justify-center rounded-full p-2 transition-colors"
              style={{ color: "var(--chat-muted)" }}
              title="Voice input"
            >
              <Mic className="h-5 w-5" />
            </button>
            <button
              onClick={handleSend}
              disabled={sending || busy || !hasContent}
              className="inline-flex shrink-0 items-center justify-center rounded-full p-2.5 transition-colors"
              style={{
                backgroundColor: hasContent ? "var(--chat-accent)" : "var(--chat-border)",
                color: hasContent ? "var(--chat-accent-contrast)" : "var(--chat-muted)",
                cursor: hasContent ? "pointer" : "not-allowed",
              }}
            >
              {sending || busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-2 max-w-3xl px-1 text-center text-[11px]" style={{ color: "var(--chat-muted)" }}>
        AI can make mistakes. Check important info.
      </div>
    </div>
  )
})

export default Composer
