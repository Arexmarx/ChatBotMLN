"use client"
import { Asterisk, MoreHorizontal, Menu, ChevronDown } from "lucide-react"
import { useState, type ReactNode } from "react"
import GhostIconButton from "./GhostIconButton"

type HeaderProps = {
  createNewChat?: () => void
  sidebarCollapsed?: boolean
  setSidebarOpen?: (isOpen: boolean) => void
}

type ChatbotOption = {
  name: string
  icon: ReactNode
}

export default function Header({ createNewChat: _createNewChat, sidebarCollapsed = false, setSidebarOpen }: HeaderProps) {
  const [selectedBot, setSelectedBot] = useState("GPT-5")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const chatbots: ChatbotOption[] = [
    { name: "GPT-5", icon: "🤖" },
    { name: "Claude Sonnet 4", icon: "🎭" },
    { name: "Gemini", icon: "💎" },
    { name: "Assistant", icon: <Asterisk className="h-4 w-4" /> },
  ]

  const openSidebar = () => {
    setSidebarOpen?.(true)
  }

  const activeBot = chatbots.find((bot) => bot.name === selectedBot) ?? chatbots[0]

  return (
    <div className="sticky top-0 z-30 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-4 py-3 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
      {sidebarCollapsed && (
        <button
          onClick={openSidebar}
          className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-zinc-800"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="hidden md:flex relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-semibold tracking-tight hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800"
        >
          {typeof activeBot.icon === "string" ? (
            <span className="text-sm">{activeBot.icon}</span>
          ) : (
            activeBot.icon
          )}
          {activeBot.name}
          <ChevronDown className="h-4 w-4" />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-950 z-50">
            {chatbots.map((bot) => (
              <button
                key={bot.name}
                onClick={() => {
                  setSelectedBot(bot.name)
                  setIsDropdownOpen(false)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg"
              >
                {typeof bot.icon === "string" ? <span className="text-sm">{bot.icon}</span> : bot.icon}
                {bot.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <GhostIconButton label="More">
          <MoreHorizontal className="h-4 w-4" />
        </GhostIconButton>
      </div>
    </div>
  )
}
