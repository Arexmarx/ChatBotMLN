"use client"
import { motion, AnimatePresence } from "framer-motion"
import { X, Lightbulb } from "lucide-react"
import { useState, type FormEvent } from "react"

type CreateFolderModalProps = {
  isOpen: boolean
  onClose: () => void
  onCreateFolder: (name: string) => void
}

export default function CreateFolderModal({ isOpen, onClose, onCreateFolder }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState("")

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (folderName.trim()) {
      onCreateFolder(folderName.trim())
      setFolderName("")
      onClose()
    }
  }

  const handleCancel = () => {
    setFolderName("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={handleCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-6 shadow-xl"
            style={{
              backgroundColor: "var(--chat-surface)",
              borderColor: "var(--chat-border)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--chat-text)" }}>
                Folder name
              </h2>
              <button
                onClick={handleCancel}
                className="rounded-lg p-1 transition-colors"
                style={{
                  color: "var(--chat-muted)",
                  backgroundColor: "transparent",
                }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="E.g. Marketing Projects"
                className="w-full rounded-lg border px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  borderColor: "var(--chat-border)",
                  backgroundColor: "var(--chat-background)",
                  color: "var(--chat-text)",
                }}
                autoFocus
              />

              <div
                className="mt-4 flex items-start gap-3 rounded-lg p-4"
                style={{
                  backgroundColor: "var(--chat-background)",
                  borderColor: "var(--chat-border)",
                }}
              >
                <Lightbulb className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "var(--chat-muted)" }} />
                <div className="text-sm">
                  <div className="font-medium mb-1" style={{ color: "var(--chat-text)" }}>
                    What's a folder?
                  </div>
                  <div style={{ color: "var(--chat-muted)" }}>
                    Folders keep chats, files, and custom instructions in one place. Use them for ongoing work, or just
                    to keep things tidy.
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    borderColor: "var(--chat-border)",
                    color: "var(--chat-text)",
                    backgroundColor: "transparent",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!folderName.trim()}
                  className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: "var(--chat-accent)",
                    color: "var(--chat-accent-contrast)",
                  }}
                >
                  Create folder
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
