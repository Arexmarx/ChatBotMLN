"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, LayoutGrid, MoreHorizontal } from "lucide-react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import GhostIconButton from "./GhostIconButton"
import ThemeToggle from "./ThemeToggle"
import { INITIAL_CONVERSATIONS, INITIAL_TEMPLATES, INITIAL_FOLDERS } from "./mockData"
import { fetchSupabaseSession, subscribeToAuthChanges } from "@/app/api/authApi"
import type { User } from "@supabase/supabase-js"

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
  folder: string | null
  messages: ConversationMessage[]
}

type TemplateItem = {
  id: string
  name: string
  content: string
  snippet: string
  createdAt: string
  updatedAt: string
}

type FolderItem = {
  id: string
  name: string
}

export default function AIAssistantUI() {
  const router = useRouter()
  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("theme")
    if (saved) return saved
    if (typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark"
    return "light"
  })

  useEffect(() => {
    try {
      if (theme === "dark") document.documentElement.classList.add("dark")
      else document.documentElement.classList.remove("dark")
      document.documentElement.setAttribute("data-theme", theme)
      document.documentElement.style.colorScheme = theme
      localStorage.setItem("theme", theme)
    } catch {}
  }, [theme])

  useEffect(() => {
    try {
      const media = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")
      if (!media) return
      const listener = (e: MediaQueryListEvent) => {
        const saved = localStorage.getItem("theme")
        if (!saved) setTheme(e.matches ? "dark" : "light")
      }
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    } catch {}
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<{ pinned: boolean; recent: boolean; folders: boolean; templates: boolean }>(() => {
    try {
      const raw = localStorage.getItem("sidebar-collapsed")
      return raw ? JSON.parse(raw) : { pinned: true, recent: false, folders: true, templates: true }
    } catch {
      return { pinned: true, recent: false, folders: true, templates: true }
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(collapsed))
    } catch {}
  }, [collapsed])

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("sidebar-collapsed-state")
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem("sidebar-collapsed-state", JSON.stringify(sidebarCollapsed))
    } catch {}
  }, [sidebarCollapsed])

  const [conversations, setConversations] = useState<ConversationItem[]>(INITIAL_CONVERSATIONS as ConversationItem[])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES as TemplateItem[])
  const [folders, setFolders] = useState<FolderItem[]>(INITIAL_FOLDERS as FolderItem[])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [query, setQuery] = useState("")
  const searchRef = useRef<HTMLInputElement | null>(null)

  const [isThinking, setIsThinking] = useState(false)
  const [thinkingConvId, setThinkingConvId] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault()
        createNewChat()
      }
      if (!e.metaKey && !e.ctrlKey && e.key === "/") {
        const tag = document.activeElement?.tagName?.toLowerCase()
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault()
          searchRef.current?.focus()
        }
      }
      if (e.key === "Escape" && sidebarOpen) setSidebarOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sidebarOpen, conversations])

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      createNewChat()
    }
  }, [])

  useEffect(() => {
    let mounted = true
    let unsubscribe: (() => void) | null = null

    const initialiseUser = async () => {
      try {
        const { data } = await fetchSupabaseSession()
        if (!mounted) return
        setCurrentUser(data.session?.user ?? null)
        if (!data.session?.user) {
          router.replace("/")
        }
      } catch (error) {
        console.error("Unable to load Supabase session", error)
      }
    }

    initialiseUser()

    unsubscribe = subscribeToAuthChanges((_event, session) => {
      if (!mounted) return
      setCurrentUser(session?.user ?? null)
      if (!session?.user) {
        router.replace("/")
      }
    })

    return () => {
      mounted = false
      unsubscribe?.()
    }
  }, [router])

  const filtered = useMemo<ConversationItem[]>(() => {
    if (!query.trim()) return conversations
    const q = query.toLowerCase()
    return conversations.filter((c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q))
  }, [conversations, query])

  const pinned = filtered.filter((c) => c.pinned).sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))

  const recent = filtered
    .filter((c) => !c.pinned)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 10)

  const folderCounts = React.useMemo<Record<string, number>>(() => {
    const map = Object.fromEntries(folders.map((f) => [f.name, 0])) as Record<string, number>
    for (const c of conversations) {
      if (c.folder && map[c.folder] != null) {
        map[c.folder] += 1
      }
    }
    return map
  }, [conversations, folders])

  function togglePin(id: string) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c)))
  }

  function createNewChat() {
    const id = Math.random().toString(36).slice(2)
    const item: ConversationItem = {
      id,
      title: "New Chat",
      updatedAt: new Date().toISOString(),
      messageCount: 0,
      preview: "Say hello to start...",
      pinned: false,
      folder: "Work Projects",
      messages: [],
    }
    setConversations((prev) => [item, ...prev])
    setSelectedId(id)
    setSidebarOpen(false)
  }

  function createFolder(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (folders.some((folder) => folder.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("Folder already exists.")
      return
    }
    setFolders((prev) => [...prev, { id: Math.random().toString(36).slice(2), name: trimmed }])
  }

  function deleteFolder(name: string) {
    setFolders((prev) => prev.filter((folder) => folder.name !== name))
    setConversations((prev) =>
      prev.map((conversation) => (conversation.folder === name ? { ...conversation, folder: null } : conversation)),
    )
  }

  function renameFolder(oldName: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return
    if (folders.some((folder) => folder.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("Folder already exists.")
      return
    }

    setFolders((prev) => prev.map((folder) => (folder.name === oldName ? { ...folder, name: trimmed } : folder)))
    setConversations((prev) =>
      prev.map((conversation) => (conversation.folder === oldName ? { ...conversation, folder: trimmed } : conversation)),
    )
  }

  function sendMessage(convId: string, content: string) {
    if (!content.trim()) return
    const now = new Date().toISOString()
    const userMsg: ConversationMessage = { id: Math.random().toString(36).slice(2), role: "user", content, createdAt: now }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = [...(c.messages || []), userMsg]
        return {
          ...c,
          messages: msgs,
          updatedAt: now,
          messageCount: msgs.length,
          preview: content.slice(0, 80),
        }
      }),
    )

    setIsThinking(true)
    setThinkingConvId(convId)

    const currentConvId = convId
    setTimeout(() => {
      // Always clear thinking state and generate response for this specific conversation
      setIsThinking(false)
      setThinkingConvId(null)
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== currentConvId) return c
          const ack = `Got it — I'll help with that.`
          const asstMsg: ConversationMessage = {
            id: Math.random().toString(36).slice(2),
            role: "assistant",
            content: ack,
            createdAt: new Date().toISOString(),
          }
          const msgs = [...(c.messages || []), asstMsg]
          return {
            ...c,
            messages: msgs,
            updatedAt: new Date().toISOString(),
            messageCount: msgs.length,
            preview: asstMsg.content.slice(0, 80),
          }
        }),
      )
    }, 2000)
  }

  function editMessage(convId: string, messageId: string, newContent: string) {
    const now = new Date().toISOString()
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = (c.messages || []).map((m) =>
          m.id === messageId ? { ...m, content: newContent, editedAt: now } : m,
        )
        return {
          ...c,
          messages: msgs,
          preview: msgs[msgs.length - 1]?.content?.slice(0, 80) || c.preview,
        }
      }),
    )
  }

  function resendMessage(convId: string, messageId: string) {
    const conv = conversations.find((c) => c.id === convId)
    const msg = conv?.messages?.find((m) => m.id === messageId)
    if (!msg) return
    sendMessage(convId, msg.content)
  }

  function pauseThinking() {
    setIsThinking(false)
    setThinkingConvId(null)
  }

  function handleUseTemplate(template: TemplateItem) {
    // This will be passed down to the Composer component
    // The Composer will handle inserting the template content
    if (composerRef.current) {
      composerRef.current.insertTemplate(template.content)
    }
  }

  const composerRef = useRef<{ insertTemplate: (content: string) => void } | null>(null)

  const selected = conversations.find((c) => c.id === selectedId) || null

  return (
    <div className="fixed inset-0 h-screen w-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b border-zinc-200/60 bg-white/80 px-3 py-2 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="ml-1 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-flex h-4 w-4 items-center justify-center">✱</span> AI Assistant
        </div>
        <div className="ml-auto flex items-center gap-2">
          <GhostIconButton label="Schedule">
            <Calendar className="h-4 w-4" />
          </GhostIconButton>
          <GhostIconButton label="Apps">
            <LayoutGrid className="h-4 w-4" />
          </GhostIconButton>
          <GhostIconButton label="More">
            <MoreHorizontal className="h-4 w-4" />
          </GhostIconButton>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </div>

      <div className="flex h-full w-full">
        <Sidebar
          user={currentUser}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          theme={theme}
          setTheme={setTheme}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          conversations={conversations}
          pinned={pinned}
          recent={recent}
          folders={folders}
          folderCounts={folderCounts}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          togglePin={togglePin}
          query={query}
          setQuery={setQuery}
          searchRef={searchRef}
          createFolder={createFolder}
          deleteFolder={deleteFolder}
          renameFolder={renameFolder}
          createNewChat={createNewChat}
          templates={templates}
          setTemplates={setTemplates}
          onUseTemplate={handleUseTemplate}
        />

        <main className="relative flex min-w-0 flex-1 flex-col">
          <Header createNewChat={createNewChat} sidebarCollapsed={sidebarCollapsed} setSidebarOpen={setSidebarOpen} />
          <ChatPane
            ref={composerRef}
            conversation={selected}
            onSend={(content) => {
              if (selected) {
                sendMessage(selected.id, content)
              }
            }}
            onEditMessage={(messageId, newContent) => {
              if (selected) {
                editMessage(selected.id, messageId, newContent)
              }
            }}
            onResendMessage={(messageId) => {
              if (selected) {
                resendMessage(selected.id, messageId)
              }
            }}
            isThinking={isThinking && thinkingConvId === selected?.id}
            onPauseThinking={pauseThinking}
          />
        </main>
      </div>
    </div>
  )
}
