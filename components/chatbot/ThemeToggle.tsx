import { useState } from "react"
import { ChevronDown, Palette, Sparkles } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CHAT_THEMES, type ChatThemeKey } from "./themePresets"

type ThemeToggleProps = {
  theme: ChatThemeKey
  onThemeChange: (theme: ChatThemeKey) => void
  size?: "default" | "compact"
}

export default function ThemeToggle({ theme, onThemeChange, size = "default" }: ThemeToggleProps) {
  const activeTheme = CHAT_THEMES[theme] ?? CHAT_THEMES.classic
  const triggerPadding = size === "compact" ? "px-2.5 py-1.5" : "px-3 py-2"
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-2 rounded-full border ${triggerPadding} text-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors`}
          style={{
            backgroundColor: "var(--chat-surface)",
            color: "var(--chat-text)",
            borderColor: "var(--chat-border)",
          }}
          aria-label="Change chat theme"
        >
          <span className="text-base leading-none">{activeTheme.emoji}</span>
          <span className="hidden sm:inline">{activeTheme.label}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" sideOffset={8} className="w-80 max-w-[calc(100vw-2rem)] p-3 sm:w-96">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          <Palette className="h-4 w-4" />
          Pick a theme
        </div>
        <div className="grid gap-2">
          {Object.values(CHAT_THEMES).map((option) => {
            const isActive = option.key === activeTheme.key
            return (
              <button
                key={option.key}
                onClick={() => {
                  onThemeChange(option.key)
                  setOpen(false)
                }}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition hover:-translate-y-[1px] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isActive
                    ? "border-blue-500/50 bg-blue-50 text-blue-900 dark:border-blue-400/40 dark:bg-blue-400/10 dark:text-blue-100"
                    : "border-zinc-200 text-zinc-800 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <div
                  className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md text-lg"
                  style={{
                    background: option.colors.surface,
                    color: option.colors.text,
                    border: `1px solid ${option.colors.border}`,
                  }}
                >
                  {option.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-sm font-semibold">
                    {option.label}
                    {isActive && <Sparkles className="h-3 w-3 flex-shrink-0 text-blue-500" />}
                  </div>
                  <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{option.description}</div>
                </div>
                <div className="ml-2 flex flex-shrink-0 items-center gap-1">
                  <ColorDot color={option.colors.background} />
                  <ColorDot color={option.colors.accent} />
                  <ColorDot color={option.colors.text} />
                </div>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ColorDot({ color }: { color: string }) {
  return <span className="h-3 w-3 rounded-full border border-black/5 dark:border-white/10" style={{ background: color }} />
}
