import type { ReactNode } from "react"
import { cls } from "./utils"

type MessageProps = {
  role: "user" | "assistant"
  children: ReactNode
  userAvatar?: string | null
  userInitials?: string
}

export default function Message({ role, children, userAvatar, userInitials = "U" }: MessageProps) {
  const isUser = role === "user"
  const bubbleStyle = {
    backgroundColor: isUser ? "var(--chat-user-bubble)" : "var(--chat-assistant-bubble)",
    color: isUser ? "var(--chat-user-text)" : "var(--chat-assistant-text)",
    border: isUser ? "1px solid transparent" : "1px solid var(--chat-border)",
  } as const
  const avatarStyle = {
    backgroundColor: "var(--chat-accent)",
    color: "var(--chat-accent-contrast)",
    border: "1px solid var(--chat-border)",
  } as const

  return (
    <div className={cls("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full text-[10px] font-bold" style={avatarStyle}>
          AI
        </div>
      )}
      <div className={cls("max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm")} style={bubbleStyle}>
        {children}
      </div>
      {isUser && (
        <div className="mt-0.5 grid h-7 w-7 place-items-center overflow-hidden rounded-full text-[10px] font-bold" style={avatarStyle}>
          {userAvatar ? (
            <img src={userAvatar} alt="User avatar" className="h-full w-full object-cover" />
          ) : (
            userInitials
          )}
        </div>
      )}
    </div>
  )
}
