"use client"
import { MoreHorizontal, Menu } from "lucide-react"
import GhostIconButton from "./GhostIconButton"
import ThemeToggle from "./ThemeToggle"
import { CHAT_THEMES, type ChatThemeKey } from "./themePresets"
import ViewerCountBadge from "./ViewerCountBadge"

type HeaderProps = {
  createNewChat?: () => void
  sidebarCollapsed?: boolean
  setSidebarOpen?: (isOpen: boolean) => void
  theme: ChatThemeKey
  onThemeChange: (theme: ChatThemeKey) => void
}

export default function Header({ createNewChat: _createNewChat, sidebarCollapsed = false, setSidebarOpen, theme, onThemeChange }: HeaderProps) {
  const openSidebar = () => {
    setSidebarOpen?.(true)
  }

  const colors = (CHAT_THEMES[theme] ?? CHAT_THEMES.classic).colors

  return (
    <div
      className="sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-3 backdrop-blur"
      style={{
        backgroundColor: colors.surface,
        color: "var(--chat-header-text, var(--chat-text))",
        borderColor: colors.border,
      }}
    >
      {sidebarCollapsed && (
        <button
          onClick={openSidebar}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          style={{ color: "var(--chat-header-text, var(--chat-text))", backgroundColor: "transparent" }}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="hidden md:flex relative">
        <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ViewerCountBadge />
        <GhostIconButton label="More">
          <MoreHorizontal className="h-4 w-4" />
        </GhostIconButton>
      </div>
    </div>
  )
}
