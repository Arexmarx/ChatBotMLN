"use client"

import { useState, useRef, useEffect, type MouseEvent, type KeyboardEvent } from "react"
import { MoreHorizontal, Pin, Edit3, Trash2, X } from "lucide-react"
import { cls, timeAgo } from "./utils"
import { motion, AnimatePresence } from "framer-motion"

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
  preview: string
  pinned: boolean
  messages?: ConversationMessage[]
}

type ConversationRowProps = {
  data: ConversationItem
  active?: boolean
  onSelect: () => void
  onTogglePin?: () => void
  onDelete?: (id: string) => void
  onRename?: (id: string, newName: string) => void
  showMeta?: boolean
}

export default function ConversationRow({ data, active = false, onSelect, onTogglePin, onDelete, onRename, showMeta = false }: ConversationRowProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameValue, setRenameValue] = useState(data.title)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const renameInputRef = useRef<HTMLInputElement | null>(null)
  const count = Array.isArray(data.messages) ? data.messages.length : data.messageCount

  useEffect(() => {
    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (menuRef.current && event.target instanceof Node && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showMenu])

  useEffect(() => {
    if (showRenameModal && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [showRenameModal])

  const handlePin = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onTogglePin?.()
    setShowMenu(false)
  }

  const handleRename = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setRenameValue(data.title)
    setShowRenameModal(true)
    setShowMenu(false)
  }

  const confirmRename = () => {
    const trimmed = renameValue.trim()
    if (trimmed && trimmed !== data.title) {
      onRename?.(data.id, trimmed)
    }
    setShowRenameModal(false)
  }

  const handleRenameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      confirmRename()
    } else if (e.key === "Escape") {
      setShowRenameModal(false)
    }
  }

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${data.title}"?`)) {
      onDelete?.(data.id)
    }
    setShowMenu(false)
  }

  return (
    <div className="group relative">
      <div
        onClick={onSelect}
        className={cls(
          "-mx-1 flex w-[calc(100%+8px)] items-center gap-2 rounded-lg px-2 py-2 cursor-pointer",
          active
            ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800/60 dark:text-zinc-100"
            : "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        )}
        title={data.title}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onSelect()
          }
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {data.pinned && <Pin className="h-3 w-3 shrink-0 text-zinc-500 dark:text-zinc-400" />}
            <span className="truncate text-sm font-medium tracking-tight">{data.title}</span>
            <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">{timeAgo(data.updatedAt)}</span>
          </div>
          {showMeta && <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">{count} messages</div>}
        </div>
      </div>

      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-[150]" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setShowMenu(!showMenu)
          }}
          className="rounded-md p-1 text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-zinc-200/50 dark:text-zinc-300 dark:hover:bg-zinc-700/60 active:opacity-100"
          aria-label="Chat options"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute right-0 top-full mt-1 w-36 rounded-lg border py-1 shadow-xl z-[200]"
              style={{
                backgroundColor: "var(--chat-surface)",
                borderColor: "var(--chat-border)",
              }}
            >
              <button
                onClick={handlePin}
                className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 transition-colors"
                style={{ color: "var(--chat-text)" }}
              >
                {data.pinned ? (
                  <>
                    <Pin className="h-3 w-3" />
                    Unpin
                  </>
                ) : (
                  <>
                    <Pin className="h-3 w-3" />
                    Pin
                  </>
                )}
              </button>
              <button
                onClick={handleRename}
                className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 transition-colors"
                style={{ color: "var(--chat-text)" }}
              >
                <Edit3 className="h-3 w-3" />
                Rename
              </button>
              <button
                onClick={handleDelete}
                className="w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 transition-colors"
                style={{ color: "#ef4444" }}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="pointer-events-none absolute left-[calc(100%+6px)] top-1 hidden w-64 rounded-xl border p-3 text-xs shadow-lg md:group-hover:block" style={{ borderColor: "var(--chat-border)", backgroundColor: "var(--chat-surface)", color: "var(--chat-text)" }}>
        <div className="line-clamp-6 whitespace-pre-wrap">{data.preview}</div>
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
              className="relative w-full max-w-md rounded-xl border p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "var(--chat-surface)",
                borderColor: "var(--chat-border)",
              }}
            >
              <button
                onClick={() => setShowRenameModal(false)}
                className="absolute right-4 top-4 rounded-lg p-1 transition-colors"
                style={{
                  color: "var(--chat-muted)",
                  backgroundColor: "transparent",
                }}
              >
                <X className="h-4 w-4" />
              </button>

              <h3 className="mb-4 text-lg font-semibold" style={{ color: "var(--chat-text)" }}>
                Rename Conversation
              </h3>

              <input
                ref={renameInputRef}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                className="w-full rounded-lg border px-4 py-2.5 text-sm placeholder-text transition-colors outline-none focus:ring-2"
                style={{
                  borderColor: "var(--chat-border)",
                  backgroundColor: "var(--chat-background)",
                  color: "var(--chat-text)",
                  "--placeholder-color": "var(--chat-muted)",
                } as any}
                placeholder="Enter new name..."
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowRenameModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    color: "var(--chat-text)",
                    backgroundColor: "transparent",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRename}
                  className="rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: "var(--chat-accent)",
                    color: "var(--chat-accent-contrast)",
                  }}
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
