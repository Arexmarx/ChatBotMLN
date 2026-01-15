/**
 * Chatbot Service
 * Handles all database operations for chatbot functionality
 */

import { getSupabaseClient } from "./supabaseClient"
import type {
  Conversation,
  Message,
  Folder,
  Template,
  InsertConversation,
  UpdateConversation,
  ConversationWithMessages,
} from "@/types/database.types"

// ============================================
// CONVERSATIONS
// ============================================

/**
 * Get all conversations for the current user
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching conversations:", error)
    throw error
  }
  
  return data || []
}

/**
 * Get a single conversation with all messages
 */
export async function getConversationWithMessages(
  conversationId: string
): Promise<ConversationWithMessages | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      messages (*),
      folder:folders (*)
    `)
    .eq("id", conversationId)
    .single()
  
  if (error) {
    console.error("Error fetching conversation:", error)
    return null
  }
  
  return data as ConversationWithMessages
}

/**
 * Create a new conversation
 */
export async function createConversation(
  userId: string,
  data: Partial<InsertConversation> = {}
): Promise<Conversation | null> {
  const supabase = getSupabaseClient()
  
  const { data: conversation, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: data.title || "New Chat",
      folder_id: data.folder_id || null,
      ...data,
    })
    .select()
    .single()
  
  if (error) {
    console.error("Error creating conversation:", error)
    return null
  }
  
  return conversation
}

/**
 * Update a conversation
 */
export async function updateConversation(
  conversationId: string,
  updates: UpdateConversation
): Promise<Conversation | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("conversations")
    .update(updates)
    .eq("id", conversationId)
    .select()
    .single()
  
  if (error) {
    console.error("Error updating conversation:", error)
    return null
  }
  
  return data
}

/**
 * Delete a conversation
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
  
  if (error) {
    console.error("Error deleting conversation:", error)
    return false
  }
  
  return true
}

/**
 * Toggle pin status of a conversation
 */
export async function toggleConversationPin(
  conversationId: string,
  pinned: boolean
): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from("conversations")
    .update({ pinned })
    .eq("id", conversationId)
  
  if (error) {
    console.error("Error toggling pin:", error)
    return false
  }
  
  return true
}

// ============================================
// MESSAGES
// ============================================

/**
 * Get all messages for a conversation
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
  
  if (error) {
    console.error("Error fetching messages:", error)
    throw error
  }
  
  return data || []
}

/**
 * Create a new message
 */
export async function createMessage(
  conversationId: string,
  role: "user" | "assistant" | "system",
  content: string
): Promise<Message | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
    })
    .select()
    .single()
  
  if (error) {
    console.error("Error creating message:", error)
    return null
  }
  
  return data
}

/**
 * Update a message (for edits)
 */
export async function updateMessage(
  messageId: string,
  content: string
): Promise<Message | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("messages")
    .update({
      content,
      edited_at: new Date().toISOString(),
    })
    .eq("id", messageId)
    .select()
    .single()
  
  if (error) {
    console.error("Error updating message:", error)
    return null
  }
  
  return data
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId)
  
  if (error) {
    console.error("Error deleting message:", error)
    return false
  }
  
  return true
}

// ============================================
// FOLDERS
// ============================================

/**
 * Get all folders for the current user
 */
export async function getFolders(userId: string): Promise<Folder[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })
  
  if (error) {
    console.error("Error fetching folders:", error)
    throw error
  }
  
  return data || []
}

/**
 * Create a new folder
 */
export async function createFolder(
  userId: string,
  name: string
): Promise<Folder | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("folders")
    .insert({
      user_id: userId,
      name,
    })
    .select()
    .single()
  
  if (error) {
    console.error("Error creating folder:", error)
    return null
  }
  
  return data
}

/**
 * Update a folder
 */
export async function updateFolder(
  folderId: string,
  name: string
): Promise<Folder | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("folders")
    .update({ name })
    .eq("id", folderId)
    .select()
    .single()
  
  if (error) {
    console.error("Error updating folder:", error)
    return null
  }
  
  return data
}

/**
 * Delete a folder
 */
export async function deleteFolder(folderId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", folderId)
  
  if (error) {
    console.error("Error deleting folder:", error)
    return false
  }
  
  return true
}

// ============================================
// TEMPLATES
// ============================================

/**
 * Get all templates for the current user
 */
export async function getTemplates(userId: string): Promise<Template[]> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("templates")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching templates:", error)
    throw error
  }
  
  return data || []
}

/**
 * Create a new template
 */
export async function createTemplate(
  userId: string,
  name: string,
  content: string,
  snippet?: string
): Promise<Template | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("templates")
    .insert({
      user_id: userId,
      name,
      content,
      snippet: snippet || content.slice(0, 100),
    })
    .select()
    .single()
  
  if (error) {
    console.error("Error creating template:", error)
    return null
  }
  
  return data
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  updates: { name?: string; content?: string; snippet?: string }
): Promise<Template | null> {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from("templates")
    .update(updates)
    .eq("id", templateId)
    .select()
    .single()
  
  if (error) {
    console.error("Error updating template:", error)
    return null
  }
  
  return data
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  
  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId)
  
  if (error) {
    console.error("Error deleting template:", error)
    return false
  }
  
  return true
}

// ============================================
// QUIZ (LocalStorage)
// ============================================

export type Quiz = {
  id: string
  userId: string
  title: string
  questions: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

export type QuizQuestion = {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const QUIZ_STORAGE_KEY = "chatbot_quizzes"

/**
 * Get all quizzes for a user from localStorage
 */
export function getQuizzesFromLocalStorage(userId: string): Quiz[] {
  if (typeof window === "undefined") return []
  
  const allQuizzes = localStorage.getItem(QUIZ_STORAGE_KEY)
  if (!allQuizzes) return []
  
  try {
    const quizzes: Quiz[] = JSON.parse(allQuizzes)
    return quizzes.filter(q => q.userId === userId)
  } catch (error) {
    console.error("Error parsing quizzes from localStorage:", error)
    return []
  }
}

/**
 * Save a new quiz to localStorage
 */
export function saveQuizToLocalStorage(
  userId: string,
  title: string,
  questions: QuizQuestion[]
): Quiz {
  if (typeof window === "undefined") throw new Error("localStorage not available")
  
  const allQuizzes = localStorage.getItem(QUIZ_STORAGE_KEY)
  let quizzes: Quiz[] = []
  
  if (allQuizzes) {
    try {
      quizzes = JSON.parse(allQuizzes)
    } catch (error) {
      console.error("Error parsing existing quizzes:", error)
    }
  }
  
  const newQuiz: Quiz = {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    questions,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  quizzes.push(newQuiz)
  localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes))
  
  return newQuiz
}

/**
 * Rename a quiz
 */
export function renameQuizInLocalStorage(quizId: string, newTitle: string): boolean {
  if (typeof window === "undefined") return false
  
  const allQuizzes = localStorage.getItem(QUIZ_STORAGE_KEY)
  if (!allQuizzes) return false
  
  try {
    const quizzes: Quiz[] = JSON.parse(allQuizzes)
    const quiz = quizzes.find(q => q.id === quizId)
    
    if (quiz) {
      quiz.title = newTitle
      quiz.updatedAt = new Date().toISOString()
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes))
      return true
    }
  } catch (error) {
    console.error("Error renaming quiz:", error)
  }
  
  return false
}

/**
 * Delete a quiz
 */
export function deleteQuizFromLocalStorage(quizId: string): boolean {
  if (typeof window === "undefined") return false
  
  const allQuizzes = localStorage.getItem(QUIZ_STORAGE_KEY)
  if (!allQuizzes) return false
  
  try {
    const quizzes: Quiz[] = JSON.parse(allQuizzes)
    const filtered = quizzes.filter(q => q.id !== quizId)
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(filtered))
    return true
  } catch (error) {
    console.error("Error deleting quiz:", error)
  }
  
  return false
}

