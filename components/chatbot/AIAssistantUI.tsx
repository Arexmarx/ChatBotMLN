"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, LayoutGrid, MoreHorizontal, Home } from "lucide-react"
import Link from "next/link"
import Sidebar from "./Sidebar"
import Header from "./Header"
import ChatPane from "./ChatPane"
import QuizView from "./QuizView"
import GhostIconButton from "./GhostIconButton"
import ThemeToggle from "./ThemeToggle"
import { CHAT_THEMES, CHAT_THEME_STORAGE_KEY, isChatTheme, type ChatThemeKey } from "./themePresets"
import { fetchSupabaseSession, subscribeToAuthChanges } from "@/app/api/authApi"
import type { User } from "@supabase/supabase-js"
import {
  getConversations,
  getFolders,
  getTemplates,
  createConversation,
  createFolder as createFolderDB,
  deleteFolder as deleteFolderDB,
  updateFolder,
  toggleConversationPin,
  updateMessage,
  getConversationWithMessages,
  updateConversation,
  deleteConversation as deleteConversationDB,
  saveQuizToLocalStorage,
  getQuizzesFromLocalStorage,
  renameQuizInLocalStorage,
  deleteQuizFromLocalStorage,
  type Quiz,
} from "@/lib/chatbotService"

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
  const [theme, setTheme] = useState<ChatThemeKey>(() => {
    if (typeof window === "undefined") return "classic"
    // Check new storage key first
    const saved = localStorage.getItem(CHAT_THEME_STORAGE_KEY)
    if (isChatTheme(saved)) return saved
    // Fall back to legacy key
    const legacy = localStorage.getItem("theme")
    if (legacy === "dark") return "midnight"
    if (legacy === "light") return "classic"
    // Use system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "midnight"
    return "classic"
  })

  useEffect(() => {
    try {
      const config = CHAT_THEMES[theme] ?? CHAT_THEMES.classic
      const root = document.documentElement

      root.classList.toggle("dark", Boolean(config.isDark))
      root.setAttribute("data-chat-theme", config.key)
      root.style.colorScheme = config.isDark ? "dark" : "light"

      const c = config.colors
      root.style.setProperty("--chat-bg", c.background)
      root.style.setProperty("--chat-background", c.background)
      root.style.setProperty("--chat-surface", c.surface)
      root.style.setProperty("--chat-text", c.text)
      root.style.setProperty("--chat-header-text", c.headerText ?? c.text)
      root.style.setProperty("--chat-sidebar-text", c.sidebarText ?? c.text)
      root.style.setProperty("--chat-input-text", c.inputText ?? c.text)
      root.style.setProperty("--chat-muted", c.muted)
      root.style.setProperty("--chat-border", c.border)
      root.style.setProperty("--chat-accent", c.accent)
      root.style.setProperty("--chat-accent-contrast", c.accentText)
      root.style.setProperty("--chat-user-bubble", c.bubbleUser)
      root.style.setProperty("--chat-assistant-bubble", c.bubbleAssistant)
      root.style.setProperty("--chat-user-text", c.bubbleUserText)
      root.style.setProperty("--chat-assistant-text", c.bubbleAssistantText)

      localStorage.setItem(CHAT_THEME_STORAGE_KEY, config.key)
      // Clear legacy theme key to prevent conflicts
      localStorage.removeItem("theme")
    } catch {}
  }, [theme])

  useEffect(() => {
    try {
      const media = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)")
      if (!media) return
      const listener = (e: MediaQueryListEvent) => {
        const saved = localStorage.getItem(CHAT_THEME_STORAGE_KEY)
        if (!isChatTheme(saved)) setTheme(e.matches ? "midnight" : "classic")
      }
      media.addEventListener("change", listener)
      return () => media.removeEventListener("change", listener)
    } catch {}
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<{ pinned: boolean; recent: boolean; folders: boolean; quizzes: boolean }>(() => {
    try {
      const raw = localStorage.getItem("sidebar-collapsed")
      return raw ? JSON.parse(raw) : { pinned: true, recent: false, folders: true, quizzes: true }
    } catch {
      return { pinned: true, recent: false, folders: true, quizzes: true }
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

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [folders, setFolders] = useState<FolderItem[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadedConversations, setLoadedConversations] = useState<Set<string>>(new Set())

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
  }, [sidebarOpen]) // Removed conversations and createNewChat from deps

  // Load data from database when user is available
  useEffect(() => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    const loadData = async () => {
      try {
        setLoading(true)
        const [conversationsData, foldersData, templatesData] = await Promise.all([
          getConversations(currentUser.id),
          getFolders(currentUser.id),
          getTemplates(currentUser.id),
        ])

        // Convert database format to component format
        const formattedConversations: ConversationItem[] = conversationsData.map((conv) => ({
          id: conv.id,
          title: conv.title,
          updatedAt: conv.updated_at,
          messageCount: conv.message_count,
          preview: conv.preview || "",
          pinned: conv.pinned,
          folder: conv.folder_id || null,
          messages: [],
        }))

        const formattedFolders: FolderItem[] = foldersData.map((folder) => ({
          id: folder.id,
          name: folder.name,
        }))

        const formattedTemplates: TemplateItem[] = templatesData.map((template) => ({
          id: template.id,
          name: template.name,
          content: template.content,
          snippet: template.snippet || "",
          createdAt: template.created_at,
          updatedAt: template.updated_at,
        }))

        setConversations(formattedConversations)
        setFolders(formattedFolders)
        setTemplates(formattedTemplates)

        // Load quizzes from localStorage
        if (typeof window !== "undefined") {
          const savedQuizzes = getQuizzesFromLocalStorage(currentUser.id)
          setQuizzes(savedQuizzes)
        }

        // Select first conversation or create new one
        if (formattedConversations.length > 0) {
          setSelectedId(formattedConversations[0].id)
        }
      } catch (error) {
        console.error("Error loading chatbot data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUser])

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

    let authChangeTimeout: NodeJS.Timeout | null = null
    unsubscribe = subscribeToAuthChanges((_event, session) => {
      if (!mounted) return
      
      // Debounce auth changes to prevent rapid updates
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout)
      }
      
      authChangeTimeout = setTimeout(() => {
        const newUser = session?.user ?? null
        setCurrentUser(prev => {
          // Only update if user actually changed
          if (prev?.id === newUser?.id) return prev
          return newUser
        })
        if (!session?.user) {
          router.replace("/")
        }
      }, 100)
    })

    return () => {
      mounted = false
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout)
      }
      unsubscribe?.()
    }
  }, [router])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedId) return
    if (loadedConversations.has(selectedId)) return // Already loaded

    const loadMessages = async () => {
      const conversationWithMessages = await getConversationWithMessages(selectedId)
      if (conversationWithMessages) {
        const formattedMessages: ConversationMessage[] = conversationWithMessages.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          createdAt: msg.created_at,
          editedAt: msg.edited_at || undefined,
        }))

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId ? { ...c, messages: formattedMessages } : c
          )
        )
        setLoadedConversations((prev) => new Set(prev).add(selectedId))
      }
    }

    loadMessages()
  }, [selectedId])

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
    const map = Object.fromEntries(folders.map((f) => [f.id, 0])) as Record<string, number>
    for (const c of conversations) {
      if (c.folder && map[c.folder] != null) {
        map[c.folder] += 1
      }
    }
    return map
  }, [conversations, folders])

  async function togglePin(id: string) {
    const conversation = conversations.find((c) => c.id === id)
    if (!conversation) return

    const newPinned = !conversation.pinned
    const success = await toggleConversationPin(id, newPinned)

    if (success) {
      setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, pinned: newPinned } : c)))
    } else {
      alert("Failed to update pin status")
    }
  }

  async function createNewChat() {
    if (!currentUser) return

    const newConv = await createConversation(currentUser.id, {
      title: "New Chat",
    })

    if (newConv) {
      const item: ConversationItem = {
        id: newConv.id,
        title: newConv.title,
        updatedAt: newConv.updated_at,
        messageCount: newConv.message_count,
        preview: newConv.preview || "",
        pinned: newConv.pinned,
        folder: newConv.folder_id,
        messages: [],
      }
      setConversations((prev) => [item, ...prev])
      setSelectedId(item.id)
      setSidebarOpen(false)
    } else {
      alert("Failed to create conversation")
    }
  }

  async function createFolder(name: string) {
    if (!currentUser) return

    const trimmed = name.trim()
    if (!trimmed) return
    if (folders.some((folder) => folder.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("Folder already exists.")
      return
    }

    const newFolder = await createFolderDB(currentUser.id, trimmed)
    if (newFolder) {
      setFolders((prev) => [...prev, { id: newFolder.id, name: newFolder.name }])
    } else {
      alert("Failed to create folder")
    }
  }

  async function deleteFolder(name: string) {
    const folder = folders.find((f) => f.name === name)
    if (!folder) return

    const success = await deleteFolderDB(folder.id)
    if (success) {
      setFolders((prev) => prev.filter((f) => f.id !== folder.id))
      setConversations((prev) =>
        prev.map((conversation) => (conversation.folder === folder.id ? { ...conversation, folder: null } : conversation)),
      )
    } else {
      alert("Failed to delete folder")
    }
  }

  async function renameFolder(oldName: string, newName: string) {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return
    if (folders.some((folder) => folder.name.toLowerCase() === trimmed.toLowerCase())) {
      alert("Folder already exists.")
      return
    }

    const folder = folders.find((f) => f.name === oldName)
    if (!folder) return

    const updated = await updateFolder(folder.id, trimmed)
    if (updated) {
      setFolders((prev) => prev.map((f) => (f.id === folder.id ? { ...f, name: trimmed } : f)))
      // No need to update conversations, folder_id stays the same
    } else {
      alert("Failed to rename folder")
    }
  }

  async function renameConversation(id: string, newTitle: string) {
    const trimmed = newTitle.trim()
    if (!trimmed) return

    const updated = await updateConversation(id, { title: trimmed })
    if (updated) {
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c))
      )
    } else {
      alert("Failed to rename conversation")
    }
  }

  async function handleDeleteConversation(id: string) {
    const success = await deleteConversationDB(id)
    if (success) {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id)
        
        // If the deleted conversation was selected, select another one
        if (selectedId === id) {
          if (filtered.length > 0) {
            // Select the first available conversation
            setSelectedId(filtered[0].id)
          } else {
            // No conversations left, create a new one
            setSelectedId(null)
            // Will trigger createNewChat via useEffect or user action
          }
        }
        
        return filtered
      })
    } else {
      alert("Failed to delete conversation")
    }
  }

  async function createQuiz(prompt: string): Promise<Quiz | null> {
    if (!currentUser || !prompt.trim()) return null

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: prompt,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create quiz")
      }

      const data = await response.json()
      const { quizzes } = data

      // Generate quiz title from prompt (first 50 chars)
      const quizTitle = prompt.slice(0, 50) + (prompt.length > 50 ? "..." : "")

      // Save to localStorage
      const newQuiz = saveQuizToLocalStorage(currentUser.id, quizTitle, quizzes)
      
      // Update local state
      setQuizzes((prev) => [...prev, newQuiz])

      return newQuiz
    } catch (error) {
      console.error("Error creating quiz:", error)
      alert("Failed to create quiz")
      return null
    }
  }

  function renameQuiz(quizId: string, newTitle: string) {
    if (renameQuizInLocalStorage(quizId, newTitle)) {
      setQuizzes((prev) =>
        prev.map((q) =>
          q.id === quizId ? { ...q, title: newTitle, updatedAt: new Date().toISOString() } : q
        )
      )
    }
  }

  function deleteQuiz(quizId: string) {
    if (deleteQuizFromLocalStorage(quizId)) {
      setQuizzes((prev) => prev.filter((q) => q.id !== quizId))
    }
  }

  async function sendMessage(convId: string, content: string, mode?: "assistant" | "quiz") {
    if (!content.trim() || !currentUser) return

    // Handle quiz mode
    if (mode === "quiz") {
      // Show thinking state
      setIsThinking(true)
      setThinkingConvId(convId)

      const quiz = await createQuiz(content)
      if (quiz) {
        // Display quiz in chat but don't save to conversation
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== convId) return c
            const userMsg: ConversationMessage = {
              id: `user-${Date.now()}`,
              role: "user",
              content: content,
              createdAt: new Date().toISOString(),
            }
            const quizMsg: ConversationMessage = {
              id: `quiz-${quiz.id}`,
              role: "assistant",
              content: `__QUIZ__${JSON.stringify(quiz.questions)}`,
              createdAt: new Date().toISOString(),
            }
            return {
              ...c,
              messages: [...(c.messages || []), userMsg, quizMsg],
              updatedAt: new Date().toISOString(),
            }
          })
        )
      }
      setIsThinking(false)
      setThinkingConvId(null)
      return
    }

    // Original assistant mode logic
    // Optimistically add user message to UI
    const tempUserMsg: ConversationMessage = {
      id: "temp-" + Date.now(),
      role: "user",
      content: content,
      createdAt: new Date().toISOString(),
    }

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = [...(c.messages || []), tempUserMsg]
        return {
          ...c,
          messages: msgs,
          updatedAt: new Date().toISOString(),
          messageCount: msgs.length,
          preview: content.slice(0, 80),
        }
      }),
    )

    // Show thinking state
    setIsThinking(true)
    setThinkingConvId(convId)

    const startTime = typeof performance !== "undefined" ? performance.now() : Date.now()

    try {
      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: convId,
          message: content,
          userId: currentUser.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      const data = await response.json()

      // Update with real messages from server
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          
          // Remove temp message and add real messages
          const msgs = c.messages.filter(m => !m.id.startsWith("temp-"))
          
          const userMsg: ConversationMessage = {
            id: data.userMessage.id,
            role: data.userMessage.role,
            content: data.userMessage.content,
            createdAt: data.userMessage.createdAt,
          }

          const assistantMsg: ConversationMessage = {
            id: data.assistantMessage.id,
            role: data.assistantMessage.role,
            content: data.assistantMessage.content?.trim?.() ?? data.assistantMessage.content,
            createdAt: data.assistantMessage.createdAt,
          }

          const newMsgs = [...msgs, userMsg, assistantMsg]

          return {
            ...c,
            messages: newMsgs,
            updatedAt: new Date().toISOString(),
            messageCount: newMsgs.length,
            preview: assistantMsg.content.slice(0, 80),
          }
        }),
      )
    } catch (error) {
      console.error("Error sending message:", error)
      alert("Failed to send message. Please try again.")
      
      // Remove temp message on error
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c
          return {
            ...c,
            messages: c.messages.filter(m => !m.id.startsWith("temp-")),
          }
        }),
      )
    } finally {
      setIsThinking(false)
      setThinkingConvId(null)
    }
  }

  async function editMessage(convId: string, messageId: string, newContent: string) {
    // Update in database
    const updated = await updateMessage(messageId, newContent)
    if (!updated) {
      alert("Failed to update message")
      return
    }

    // Update local state
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c
        const msgs = (c.messages || []).map((m) =>
          m.id === messageId ? { ...m, content: newContent, editedAt: updated.edited_at || undefined } : m,
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

  // Show loading state
  if (loading) {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-red-600 border-r-transparent"></div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">Loading chatbot...</p>
        </div>
      </div>
    )
  }

  const activeTheme = CHAT_THEMES[theme] ?? CHAT_THEMES.classic

  return (
    <div
      className="fixed inset-0 h-screen w-screen"
      style={{ backgroundColor: activeTheme.colors.background, color: activeTheme.colors.text }}
    >
      <div
        className="md:hidden sticky top-0 z-40 flex items-center gap-2 border-b px-3 py-2 backdrop-blur"
        style={{
          backgroundColor: activeTheme.colors.surface,
          color: activeTheme.colors.text,
          borderColor: activeTheme.colors.border,
        }}
      >
        <div className="ml-1 flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span className="inline-flex h-4 w-4 items-center justify-center">✱</span> AI Assistant
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Nút quay về trang chủ trên mobile */}
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-white/10"
            style={{ color: activeTheme.colors.text }}
            title="Về trang chủ"
          >
            <Home className="h-4 w-4" />
          </Link>
          <GhostIconButton label="Schedule">
            <Calendar className="h-4 w-4" />
          </GhostIconButton>
          <GhostIconButton label="Apps">
            <LayoutGrid className="h-4 w-4" />
          </GhostIconButton>
          <GhostIconButton label="More">
            <MoreHorizontal className="h-4 w-4" />
          </GhostIconButton>
          <ThemeToggle theme={theme} onThemeChange={setTheme} size="compact" />
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
          onSelect={(id) => {
            setSelectedId(id)
            setSelectedQuiz(null) // Clear quiz when selecting conversation
          }}
          togglePin={togglePin}
          query={query}
          setQuery={setQuery}
          searchRef={searchRef}
          createFolder={createFolder}
          deleteFolder={deleteFolder}
          renameFolder={renameFolder}
          renameConversation={renameConversation}
          deleteConversation={handleDeleteConversation}
          createNewChat={createNewChat}
          quizzes={quizzes}
          onQuizSelect={(quizId) => {
            const quiz = quizzes.find((q) => q.id === quizId)
            if (quiz) {
              setSelectedQuiz(quiz)
              setSelectedId(null) // Deselect conversation
            }
          }}
          onQuizDelete={deleteQuiz}
          onQuizRename={renameQuiz}
        />

        <main
          className="relative flex min-w-0 flex-1 flex-col"
          style={{ backgroundColor: activeTheme.colors.surface, color: activeTheme.colors.text }}
        >
          <Header
            createNewChat={createNewChat}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarOpen={setSidebarOpen}
            theme={theme}
            onThemeChange={setTheme}
          />
          {selectedQuiz ? (
            <QuizView
              quiz={selectedQuiz}
              onRename={(quizId, newTitle) => {
                renameQuiz(quizId, newTitle)
                const updatedQuiz = quizzes.find(q => q.id === quizId)
                if (updatedQuiz) {
                  setSelectedQuiz(updatedQuiz)
                }
              }}
              onDelete={(quizId) => {
                deleteQuiz(quizId)
                setSelectedQuiz(null)
              }}
            />
          ) : (
            <ChatPane
              ref={composerRef}
              conversation={selected}
              onSend={(content, mode) => {
                if (selected) {
                  sendMessage(selected.id, content, mode)
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
              userAvatar={
                typeof currentUser?.user_metadata?.avatar_url === "string"
                  ? currentUser.user_metadata.avatar_url
                  : typeof currentUser?.user_metadata?.picture === "string"
                  ? currentUser.user_metadata.picture
                  : null
              }
              userInitials={
                currentUser?.user_metadata?.full_name
                  ?.split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part: string) => part.charAt(0).toUpperCase())
                  .join("") ||
                currentUser?.email?.charAt(0)?.toUpperCase() ||
                "U"
              }
            />
          )}
        </main>
      </div>
    </div>
  )
}
