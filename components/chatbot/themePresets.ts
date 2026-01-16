export type ChatThemeKey = "classic" | "midnight" | "holiday" | "mono"

export type ChatThemeConfig = {
  key: ChatThemeKey
  label: string
  description: string
  emoji: string
  isDark?: boolean
  colors: {
    background: string
    surface: string
    text: string
    headerText?: string
    sidebarText?: string
    inputText?: string
    muted: string
    border: string
    accent: string
    accentText: string
    bubbleUser: string
    bubbleAssistant: string
    bubbleUserText: string
    bubbleAssistantText: string
  }
}

export const CHAT_THEME_STORAGE_KEY = "chat-theme"

export const CHAT_THEMES: Record<ChatThemeKey, ChatThemeConfig> = {
  classic: {
    key: "classic",
    label: "Classic",
    description: "Light, clean workspace",
    emoji: "✨",
    colors: {
      background: "#f8fafc",
      surface: "#ffffff",
      text: "#0f172a",
      headerText: "#0f172a",
      sidebarText: "#0f172a",
      inputText: "#0f172a",
      muted: "#475569",
      border: "#e2e8f0",
      accent: "#2563eb",
      accentText: "#eff6ff",
      bubbleUser: "#dbeafe",
      bubbleAssistant: "#f0f9ff",
      bubbleUserText: "#0c4a6e",
      bubbleAssistantText: "#0f172a",
    },
  },
  midnight: {
    key: "midnight",
    label: "Midnight",
    description: "High-contrast dark mode",
    emoji: "🌙",
    isDark: true,
    colors: {
      background: "#0b1120",
      surface: "#111827",
      text: "#e2e8f0",
      headerText: "#e2e8f0",
      sidebarText: "#e2e8f0",
      inputText: "#e2e8f0",
      muted: "#94a3b8",
      border: "#1f2937",
      accent: "#38bdf8",
      accentText: "#0f172a",
      bubbleUser: "#0ea5e9",
      bubbleAssistant: "#1f2937",
      bubbleUserText: "#ffffff",
      bubbleAssistantText: "#e2e8f0",
    },
  },
  holiday: {
    key: "holiday",
    label: "Holiday",
    description: "Warm red and pine",
    emoji: "🎄",
    colors: {
      background: "#fdf6f0",
      surface: "#fff7ed",
      text: "#3b2f2f",
      headerText: "#3b2f2f",
      sidebarText: "#3b2f2f",
      inputText: "#3b2f2f",
      muted: "#7c6f64",
      border: "#f0d9c2",
      accent: "#dc2626",
      accentText: "#fff1f2",
      bubbleUser: "#fee2e2",
      bubbleAssistant: "#fff7ed",
      bubbleUserText: "#7f1d1d",
      bubbleAssistantText: "#3b2f2f",
    },
  },
  mono: {
    key: "mono",
    label: "Monochrome",
    description: "Minimal gray scale",
    emoji: "⚪",
    colors: {
      background: "#f5f5f4",
      surface: "#f0f0ef",
      text: "#18181b",
      headerText: "#18181b",
      sidebarText: "#18181b",
      inputText: "#18181b",
      muted: "#3f3f46",
      border: "#d4d4d8",
      accent: "#3f3f46",
      accentText: "#f8f8f8",
      bubbleUser: "#e4e4e7",
      bubbleAssistant: "#f0f0ef",
      bubbleUserText: "#18181b",
      bubbleAssistantText: "#18181b",
    },
  },
}

export function isChatTheme(value: string | null): value is ChatThemeKey {
  if (!value) return false
  return Object.prototype.hasOwnProperty.call(CHAT_THEMES, value)
}
