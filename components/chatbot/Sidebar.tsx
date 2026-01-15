"use client"

import { useMemo, useState, type Dispatch, type MutableRefObject, type SetStateAction, type CSSProperties } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  PanelLeftClose,
  PanelLeftOpen,
  SearchIcon,
  Plus,
  Star,
  Clock,
  FolderIcon,
  FileText,
  Settings,
  Asterisk,
  Home,
} from "lucide-react"
import SidebarSection from "./SidebarSection"
import ConversationRow from "./ConversationRow"
import FolderRow from "./FolderRow"
import TemplateRow from "./TemplateRow"
import ThemeToggle from "./ThemeToggle"
import type { ChatThemeKey } from "./themePresets"
import CreateFolderModal from "./CreateFolderModal"
import CreateTemplateModal from "./CreateTemplateModal"
import SearchModal from "./SearchModal"
import SettingsPopover from "./SettingsPopover"
import { cls } from "./utils"
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
  messages?: ConversationMessage[]
}

type TemplateItem = {
  id: string
  name: string
  content: string
  snippet: string
  createdAt: string
  updatedAt: string
}

type TemplateDraft = Omit<TemplateItem, "id"> & { id?: string }

type FolderItem = {
  id: string
  name: string
}

type CollapsedState = {
  pinned: boolean
  recent: boolean
  folders: boolean
  templates: boolean
}

type SidebarProps = {
  open: boolean
  onClose: () => void
  theme: ChatThemeKey
  setTheme: Dispatch<SetStateAction<ChatThemeKey>>
  collapsed: CollapsedState
  setCollapsed: Dispatch<SetStateAction<CollapsedState>>
  conversations: ConversationItem[]
  pinned: ConversationItem[]
  recent: ConversationItem[]
  folders: FolderItem[]
  folderCounts: Record<string, number>
  selectedId: string | null
  onSelect: (id: string) => void
  togglePin: (id: string) => void
  query: string
  setQuery: Dispatch<SetStateAction<string>>
  searchRef: MutableRefObject<HTMLInputElement | null>
  createFolder: (name: string) => void
  deleteFolder?: (name: string) => void
  renameFolder?: (oldName: string, newName: string) => void
  renameConversation?: (id: string, newTitle: string) => void
  createNewChat: () => void
  templates?: TemplateItem[]
  setTemplates?: Dispatch<SetStateAction<TemplateItem[]>>
  onUseTemplate?: (template: TemplateItem) => void
  sidebarCollapsed?: boolean
  setSidebarCollapsed?: Dispatch<SetStateAction<boolean>>
  user?: User | null
}

export default function Sidebar({
  open,
  onClose,
  theme,
  setTheme,
  collapsed,
  setCollapsed,
  conversations,
  pinned,
  recent,
  folders,
  folderCounts,
  selectedId,
  onSelect,
  togglePin,
  query,
  setQuery,
  searchRef,
  createFolder,
  deleteFolder,
  renameFolder,
  renameConversation,
  createNewChat,
  templates = [],
  setTemplates,
  onUseTemplate,
  sidebarCollapsed = false,
  setSidebarCollapsed,
  user = null,
}: SidebarProps) {
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<TemplateItem | null>(null)
  const [showSearchModal, setShowSearchModal] = useState(false)

  const templateList = Array.isArray(templates) ? templates : []

  const updateTemplates = (updater: SetStateAction<TemplateItem[]>) => {
    if (!setTemplates) return
    setTemplates(updater)
  }

  const updateSidebarCollapsed = (next: boolean) => {
    if (!setSidebarCollapsed) return
    setSidebarCollapsed(next)
  }

  const handleSearchClick = () => {
    setShowSearchModal(true)
  }

  const handleNewChatClick = () => {
    createNewChat()
  }

  const handleFoldersClick = () => {
    updateSidebarCollapsed(false)
    setCollapsed((prev) => ({ ...prev, folders: false }))
  }

  const getConversationsByFolder = (folderId: string) =>
    conversations.filter((conversation) => conversation.folder === folderId)

  const handleCreateFolder = (folderName: string) => {
    const trimmed = folderName.trim()
    if (!trimmed) return
    createFolder(trimmed)
    setShowCreateFolderModal(false)
    updateSidebarCollapsed(false)
  }

  const handleDeleteFolder = (folderName: string) => {
    deleteFolder?.(folderName)
  }

  const handleRenameFolder = (oldName: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed || trimmed === oldName) return
    renameFolder?.(oldName, trimmed)
  }

  const handleCreateTemplate = (templateData: TemplateDraft) => {
    const snippet =
      templateData.snippet ??
      (templateData.content.length > 100
        ? `${templateData.content.slice(0, 100)}...`
        : templateData.content)

    const base: TemplateItem = {
      id: templateData.id ?? `${Date.now()}`,
      name: templateData.name,
      content: templateData.content,
      snippet,
      createdAt: templateData.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (templateData.id) {
      updateTemplates((prev) => prev.map((item) => (item.id === templateData.id ? base : item)))
    } else {
      updateTemplates((prev) => [...prev, base])
    }

    setEditingTemplate(null)
    setShowCreateTemplateModal(false)
  }

  const handleEditTemplate = (template: TemplateItem) => {
    setEditingTemplate(template)
    setShowCreateTemplateModal(true)
  }

  const handleRenameTemplate = (templateId: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed) return
    updateTemplates((prev) =>
      prev.map((item) =>
        item.id === templateId
          ? { ...item, name: trimmed, updatedAt: new Date().toISOString() }
          : item,
      ),
    )
  }

  const handleDeleteTemplate = (templateId: string) => {
    updateTemplates((prev) => prev.filter((item) => item.id !== templateId))
  }

  const handleUseTemplate = (template: TemplateItem) => {
    onUseTemplate?.(template)
  }

  const { avatarUrl, initials, displayName, displaySubtitle } = useMemo(() => {
    if (!user) {
      return {
        avatarUrl: null as string | null,
        initials: "?",
        displayName: "Khách",
        displaySubtitle: "Đăng nhập để sử dụng đầy đủ",
      }
    }

    const fullName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : undefined
    const email = user.email ?? undefined
    const derivedAvatar =
      typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : typeof user.user_metadata?.picture === "string"
        ? user.user_metadata.picture
        : null

    const initialsFromName = fullName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("")

    const initial = initialsFromName || email?.charAt(0)?.toUpperCase() || "U"

    return {
      avatarUrl: derivedAvatar,
      initials: initial,
      displayName: fullName || email || "Người dùng",
      displaySubtitle: email || "Đã xác thực",
    }
  }, [user])

  if (sidebarCollapsed) {
    return (
      <>
        <motion.aside
          initial={{ width: 320 }}
          animate={{ width: 64 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          className="z-50 flex h-full shrink-0 flex-col border-r"
          style={{
            borderColor: "var(--chat-border)",
            backgroundColor: "var(--chat-surface)",
            color: "var(--chat-text)",
          }}
        >
          <div className="flex items-center justify-center border-b px-3 py-3" style={{ borderColor: "var(--chat-border)" }}>
            <button
              onClick={() => updateSidebarCollapsed(false)}
              className="rounded-xl p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              style={{ color: "var(--chat-text)" }}
              aria-label="Open sidebar"
              title="Open sidebar"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col items-center gap-2 pt-4">
            {/* Home button - Quay về trang chủ */}
            <Link
              href="/"
              className="group relative rounded-xl p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10"
              style={{ color: "var(--chat-text)" }}
              title="Về trang chủ"
            >
              <Home className="h-5 w-5 transition-transform group-hover:scale-110" />
            </Link>

            <button
              onClick={handleNewChatClick}
              className="rounded-xl p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              style={{ color: "var(--chat-text)" }}
              title="New Chat"
            >
              <Plus className="h-5 w-5" />
            </button>

            <button
              onClick={handleSearchClick}
              className="rounded-xl p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              style={{ color: "var(--chat-text)" }}
              title="Search chats"
            >
              <SearchIcon className="h-5 w-5" />
            </button>

            <button
              onClick={handleFoldersClick}
              className="rounded-xl p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
              style={{ color: "var(--chat-text)" }}
              title="Folders"
            >
              <FolderIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-auto flex flex-col items-center gap-2 pb-4">
            <SettingsPopover>
              <button
                className="rounded-xl p-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                style={{ color: "var(--chat-text)" }}
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
            </SettingsPopover>
          </div>
        </motion.aside>

        <SearchModal
          isOpen={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          conversations={conversations}
          selectedId={selectedId}
          onSelect={onSelect}
          togglePin={togglePin}
          createNewChat={createNewChat}
        />
      </>
    )
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(open || typeof window !== "undefined") && (
          <motion.aside
            key="sidebar"
            initial={{ x: -340 }}
            animate={{ x: open ? 0 : 0 }}
            exit={{ x: -340 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="z-50 flex h-full w-80 shrink-0 flex-col fixed inset-y-0 left-0 md:static md:translate-x-0 border-r"
            style={{
              borderColor: "var(--chat-border)",
              backgroundColor: "var(--chat-surface)",
              color: "var(--chat-sidebar-text, var(--chat-text))",
            }}
          >
            <div className="flex items-center gap-2 border-b px-3 py-3" style={{ borderColor: "var(--chat-border)" }}>
              <div className="flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-white shadow-sm">
                  <Asterisk className="h-4 w-4" />
                </div>
                <div className="text-sm font-semibold tracking-tight" style={{ color: "var(--chat-sidebar-text, var(--chat-text))" }}>
                  AI Assistant
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1">
                {/* Nút quay về trang chủ */}
                <Link
                  href="/"
                  className="group relative inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10"
                  style={{ 
                    color: "var(--chat-sidebar-text, var(--chat-text))",
                    border: "1px solid var(--chat-border)"
                  }}
                  title="Về trang chủ"
                >
                  <Home className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                  <span className="hidden sm:inline">Trang chủ</span>
                </Link>

                <button
                  onClick={() => updateSidebarCollapsed(true)}
                  className="hidden md:block rounded-xl p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  style={{ color: "var(--chat-sidebar-text, var(--chat-text))" }}
                  aria-label="Close sidebar"
                  title="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>

                <button
                  onClick={onClose}
                  className="md:hidden rounded-xl p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                  style={{ color: "var(--chat-sidebar-text, var(--chat-text))" }}
                  aria-label="Close sidebar"
                >
                  <PanelLeftClose className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="px-3 pt-3">
              <label htmlFor="search" className="sr-only">
                Search conversations
              </label>
              <div className="relative">
                <SearchIcon
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
                  style={{ color: "var(--chat-muted)" }}
                />
                <input
                  id="search"
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search…"
                  onClick={() => setShowSearchModal(true)}
                  onFocus={() => setShowSearchModal(true)}
                  className="w-full rounded-full border py-2 pl-9 pr-3 text-sm outline-none ring-0 transition-colors placeholder:text-[color:var(--chat-muted)]"
                  style={{
                    borderColor: "var(--chat-border)",
                    backgroundColor: "var(--chat-surface)",
                    color: "var(--chat-sidebar-text, var(--chat-text))",
                  } as CSSProperties}
                />
              </div>
            </div>

            <div className="px-3 pt-3">
              <button
                onClick={createNewChat}
                className="flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                style={{ backgroundColor: "var(--chat-accent)", color: "var(--chat-accent-contrast)" }}
                title="New Chat (⌘N)"
              >
                <Plus className="h-4 w-4" /> Start New Chat
              </button>
            </div>

            <nav className="mt-4 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-2 pb-4">
              <SidebarSection
                icon={<Star className="h-4 w-4" />}
                title="PINNED CHATS"
                collapsed={collapsed.pinned}
                onToggle={() => setCollapsed((prev) => ({ ...prev, pinned: !prev.pinned }))}
              >
                {pinned.length === 0 ? (
                  <div
                    className="select-none rounded-lg border border-dashed px-3 py-3 text-center text-xs"
                    style={{ borderColor: "var(--chat-border)", color: "var(--chat-muted)" }}
                  >
                    Pin important threads for quick access.
                  </div>
                ) : (
                  pinned.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      data={conversation}
                      active={conversation.id === selectedId}
                      onSelect={() => onSelect(conversation.id)}
                      onTogglePin={() => togglePin(conversation.id)}
                      onRename={(id, newTitle) => renameConversation?.(id, newTitle)}
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<Clock className="h-4 w-4" />}
                title="RECENT"
                collapsed={collapsed.recent}
                onToggle={() => setCollapsed((prev) => ({ ...prev, recent: !prev.recent }))}
              >
                {recent.length === 0 ? (
                  <div
                    className="select-none rounded-lg border border-dashed px-3 py-3 text-center text-xs"
                    style={{ borderColor: "var(--chat-border)", color: "var(--chat-muted)" }}
                  >
                    No conversations yet. Start a new one!
                  </div>
                ) : (
                  recent.map((conversation) => (
                    <ConversationRow
                      key={conversation.id}
                      data={conversation}
                      active={conversation.id === selectedId}
                      onSelect={() => onSelect(conversation.id)}
                      onTogglePin={() => togglePin(conversation.id)}
                      onRename={(id, newTitle) => renameConversation?.(id, newTitle)}
                      showMeta
                    />
                  ))
                )}
              </SidebarSection>

              <SidebarSection
                icon={<FolderIcon className="h-4 w-4" />}
                title="FOLDERS"
                collapsed={collapsed.folders}
                onToggle={() => setCollapsed((prev) => ({ ...prev, folders: !prev.folders }))}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => setShowCreateFolderModal(true)}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors"
                    style={{ color: "var(--chat-sidebar-text, var(--chat-text))" }}
                  >
                    <Plus className="h-4 w-4" /> Create folder
                  </button>

                  {folders.map((folder) => (
                    <FolderRow
                      key={folder.id}
                      name={folder.name}
                      count={folderCounts[folder.id] ?? 0}
                      conversations={getConversationsByFolder(folder.id)}
                      selectedId={selectedId}
                      onSelect={onSelect}
                      togglePin={togglePin}
                      onDeleteFolder={handleDeleteFolder}
                      onRenameFolder={handleRenameFolder}
                    />
                  ))}
                </div>
              </SidebarSection>

              <SidebarSection
                icon={<FileText className="h-4 w-4" />}
                title="TEMPLATES"
                collapsed={collapsed.templates}
                onToggle={() => setCollapsed((prev) => ({ ...prev, templates: !prev.templates }))}
              >
                <div className="-mx-1">
                  <button
                    onClick={() => {
                      setEditingTemplate(null)
                      setShowCreateTemplateModal(true)
                    }}
                    className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors"
                    style={{ color: "var(--chat-sidebar-text, var(--chat-text))" }}
                  >
                    <Plus className="h-4 w-4" /> Create template
                  </button>

                  {templateList.map((template) => (
                    <TemplateRow
                      key={template.id}
                      template={template}
                      onUseTemplate={handleUseTemplate}
                      onEditTemplate={handleEditTemplate}
                      onRenameTemplate={handleRenameTemplate}
                      onDeleteTemplate={handleDeleteTemplate}
                    />
                  ))}

                  {templateList.length === 0 && (
                    <div
                      className="select-none rounded-lg border border-dashed px-3 py-3 text-center text-xs"
                      style={{ borderColor: "var(--chat-border)", color: "var(--chat-muted)" }}
                    >
                      No templates yet. Create your first prompt template.
                    </div>
                  )}
                </div>
              </SidebarSection>
            </nav>

            <div className="mt-auto border-t px-3 py-3" style={{ borderColor: "var(--chat-border)" }}>
              <div className="flex items-center gap-2">
                <SettingsPopover>
                  <button
                    className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-colors"
                    style={{ color: "var(--chat-sidebar-text, var(--chat-text))" }}
                  >
                    <Settings className="h-4 w-4" /> Settings
                  </button>
                </SettingsPopover>
                <div className="ml-auto">
                  <ThemeToggle theme={theme} onThemeChange={setTheme} size="compact" />
                </div>
              </div>
              <div
                className="mt-2 flex items-center gap-2 rounded-xl p-2"
                style={{ backgroundColor: "var(--chat-surface)", border: "1px solid var(--chat-border)" }}
              >
                <div
                  className="grid h-8 w-8 place-items-center overflow-hidden rounded-full text-xs font-bold"
                  style={{ backgroundColor: "var(--chat-accent)", color: "var(--chat-accent-contrast)" }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium" style={{ color: "var(--chat-sidebar-text, var(--chat-text))" }}>
                    {displayName}
                  </div>
                  <div className="truncate text-xs" style={{ color: "var(--chat-muted)" }}>
                    {displaySubtitle}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onCreateFolder={handleCreateFolder}
      />

      <CreateTemplateModal
        isOpen={showCreateTemplateModal}
        onClose={() => {
          setShowCreateTemplateModal(false)
          setEditingTemplate(null)
        }}
        onCreateTemplate={handleCreateTemplate}
        editingTemplate={editingTemplate}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        conversations={conversations}
        selectedId={selectedId}
        onSelect={onSelect}
        togglePin={togglePin}
        createNewChat={createNewChat}
      />
    </>
  )
}
