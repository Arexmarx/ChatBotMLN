"use client"
import { useState, type ReactNode } from "react"
import { Globe, HelpCircle, Crown, BookOpen, LogOut, ChevronRight, Settings } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

type SettingsPopoverProps = {
  children: ReactNode
}

export default function SettingsPopover({ children }: SettingsPopoverProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        className="w-72 p-0"
        align="start"
        side="top"
        style={{
          backgroundColor: "var(--chat-surface)",
          borderColor: "var(--chat-border)",
        }}
      >
        <div className="p-3">
          <div className="text-sm mb-3" style={{ color: "var(--chat-muted)" }}>
            user@example.com
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg mb-3"
            style={{ backgroundColor: "var(--chat-background)", borderColor: "var(--chat-border)" }}
          >
            <div
              className="flex items-center justify-center h-8 w-8 rounded-md text-xs font-bold"
              style={{ backgroundColor: "var(--chat-accent)", color: "var(--chat-accent-contrast)" }}
            >
              ID
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium" style={{ color: "var(--chat-text)" }}>
                Personal
              </div>
              <div className="text-xs" style={{ color: "var(--chat-muted)" }}>
                Pro plan
              </div>
            </div>
            <div style={{ color: "var(--chat-accent)" }}>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="space-y-0.5">
            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors"
              style={{ color: "var(--chat-text)" }}
            >
              <Settings className="h-4 w-4" style={{ color: "var(--chat-muted)" }} />
              <span>Settings</span>
            </button>

            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors"
              style={{ color: "var(--chat-text)" }}
            >
              <Globe className="h-4 w-4" style={{ color: "var(--chat-muted)" }} />
              <span>Language</span>
              <ChevronRight className="h-4 w-4 ml-auto" style={{ color: "var(--chat-muted)" }} />
            </button>

            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors"
              style={{ color: "var(--chat-text)" }}
            >
              <HelpCircle className="h-4 w-4" style={{ color: "var(--chat-muted)" }} />
              <span>Get help</span>
            </button>
          </div>

          <div className="my-2" style={{ borderTop: "1px solid var(--chat-border)" }} />

          <div className="space-y-0.5">
            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors"
              style={{ color: "var(--chat-text)" }}
            >
              <Crown className="h-4 w-4" style={{ color: "var(--chat-muted)" }} />
              <span>Upgrade plan</span>
            </button>

            <button
              className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors"
              style={{ color: "var(--chat-text)" }}
            >
              <BookOpen className="h-4 w-4" style={{ color: "var(--chat-muted)" }} />
              <span>Learn more</span>
              <ChevronRight className="h-4 w-4 ml-auto" style={{ color: "var(--chat-muted)" }} />
            </button>
          </div>

          <div className="my-2" style={{ borderTop: "1px solid var(--chat-border)" }} />

          <button
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors"
            style={{ color: "#ef4444" }}
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
