"use client"
import { useState, type ReactElement, type ReactNode } from "react"
import { Paperclip, Bot, Search, Palette, BookOpen, MoreHorizontal, Globe, ChevronRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { cls } from "./utils"

type ActionItem = {
  icon: (props: { className?: string }) => ReactElement
  label: string
  action: () => void
  badge?: string
}

type ComposerActionsPopoverProps = {
  children: ReactNode
}

export default function ComposerActionsPopover({ children }: ComposerActionsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [showMore, setShowMore] = useState(false)

  const mainActions: ActionItem[] = [
    {
      icon: (props) => <Paperclip {...props} />,
      label: "Add photos & files",
      action: () => console.log("Add photos & files"),
    },
    {
      icon: (props) => <Bot {...props} />,
      label: "Agent mode",
      badge: "NEW",
      action: () => console.log("Agent mode"),
    },
    {
      icon: (props) => <Search {...props} />,
      label: "Deep research",
      action: () => console.log("Deep research"),
    },
    {
      icon: (props) => <Palette {...props} />,
      label: "Create image",
      action: () => console.log("Create image"),
    },
    {
      icon: (props) => <BookOpen {...props} />,
      label: "Study and learn",
      action: () => console.log("Study and learn"),
    },
  ]

  const moreActions: ActionItem[] = [
    {
      icon: (props) => <Globe {...props} />,
      label: "Web search",
      action: () => console.log("Web search"),
    },
    {
      icon: (props) => <Palette {...props} />,
      label: "Canvas",
      action: () => console.log("Canvas"),
    },
    {
      icon: ({ className }) => (
        <div className={cls("flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-blue-500 via-green-400 to-yellow-400", className)}>
          <div className="h-2.5 w-2.5 rounded-sm bg-white" />
        </div>
      ),
      label: "Connect Google Drive",
      action: () => console.log("Connect Google Drive"),
    },
    {
      icon: ({ className }) => (
        <div className={cls("flex h-5 w-5 items-center justify-center rounded bg-blue-500", className)}>
          <div className="h-2.5 w-2.5 rounded-sm bg-white" />
        </div>
      ),
      label: "Connect OneDrive",
      action: () => console.log("Connect OneDrive"),
    },
    {
      icon: ({ className }) => (
        <div className={cls("flex h-5 w-5 items-center justify-center rounded bg-teal-500", className)}>
          <div className="h-2.5 w-2.5 rounded-sm bg-white" />
        </div>
      ),
      label: "Connect Sharepoint",
      action: () => console.log("Connect Sharepoint"),
    },
  ]

  const handleAction = (action: () => void) => {
    action()
    setOpen(false)
    setShowMore(false)
  }

  const handleMoreClick = () => {
    setShowMore(true)
  }

  const handleBackClick = () => {
    setShowMore(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setShowMore(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" side="top">
        {!showMore ? (
          <div className="p-2 min-w-[220px]">
            <div className="space-y-0.5">
              {mainActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <button
                    key={index}
                    onClick={() => handleAction(action.action)}
                    className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    <IconComponent className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                    <span>{action.label}</span>
                    {action.badge && (
                      <span className="ml-auto px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full font-medium">
                        {action.badge}
                      </span>
                    )}
                  </button>
                )
              })}
              <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />
              <button
                onClick={handleMoreClick}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <MoreHorizontal className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <span>More</span>
                <ChevronRight className="h-4 w-4 ml-auto text-zinc-400" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-w-[440px]">
            <div className="flex-1 p-2 border-r border-zinc-200 dark:border-zinc-700">
              <div className="space-y-0.5">
                {mainActions.map((action, index) => {
                  const IconComponent = action.icon
                  return (
                    <button
                      key={index}
                      onClick={() => handleAction(action.action)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <IconComponent className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                      <span>{action.label}</span>
                      {action.badge && (
                        <span className="ml-auto px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full font-medium">
                          {action.badge}
                        </span>
                      )}
                    </button>
                  )
                })}
                <div className="my-1 border-t border-zinc-200 dark:border-zinc-700" />
                <button
                  onClick={handleBackClick}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors bg-zinc-100 dark:bg-zinc-800"
                >
                  <MoreHorizontal className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                  <span>More</span>
                  <ChevronRight className="h-4 w-4 ml-auto text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="flex-1 p-2">
              <div className="space-y-0.5">
                {moreActions.map((action, index) => {
                  const IconComponent = action.icon
                  return (
                    <button
                      key={index}
                      onClick={() => handleAction(action.action)}
                      className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-left hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <IconComponent className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                      <span>{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
