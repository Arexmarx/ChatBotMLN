"use client"
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from "react"
import { Bot, BookOpen } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

type ActionItem = {
  icon: (props: { className?: string }) => ReactElement
  label: string
  action: () => void
  badge?: string
}

type ComposerActionsPopoverProps = {
  children: ReactNode
  currentMode?: "assistant" | "quiz"
  onModeChange?: (mode: "assistant" | "quiz") => void
}

export default function ComposerActionsPopover({ children, currentMode = "assistant", onModeChange }: ComposerActionsPopoverProps) {
  const [open, setOpen] = useState(false)
  const firstActionRef = useRef<HTMLButtonElement | null>(null)

  const mainActions: ActionItem[] = [
    {
      icon: (props) => <Bot {...props} />,
      label: "Assistant",
      badge: "Default",
      action: () => console.log("Assistant"),
    },
    {
      icon: (props) => <BookOpen {...props} />,
      label: "Create quiz",
      action: () => console.log("Create quiz"),
    },
  ]

  const handleAction = (action: () => void, mode: "assistant" | "quiz") => {
    action()
    onModeChange?.(mode)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  useEffect(() => {
    if (open && firstActionRef.current) {
      firstActionRef.current.focus()
    }
  }, [open])

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="top">
        <div className="p-2 min-w-[220px]">
          <div className="space-y-0.5">
            {mainActions.map((action, index) => {
              const IconComponent = action.icon
              const mode = index === 0 ? "assistant" : "quiz"
              const isActive = currentMode === mode
              return (
                <button
                  key={index}
                  ref={index === 0 ? firstActionRef : undefined}
                  onClick={() => handleAction(action.action, mode)}
                  className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left rounded-lg transition-colors ${
                    isActive ? "bg-blue-100 dark:bg-blue-900/30" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <IconComponent className={`h-5 w-5 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-600 dark:text-zinc-400"}`} />
                  <span className={isActive ? "font-semibold text-blue-700 dark:text-blue-300" : ""}>{action.label}</span>
                  {isActive ? (
                    <span className="ml-auto px-2 py-0.5 text-xs bg-blue-600 text-white dark:bg-blue-500 rounded-full font-medium">
                      Current
                    </span>
                  ) : (
                    action.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded-full font-medium">
                        {action.badge}
                      </span>
                    )
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
