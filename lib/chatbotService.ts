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
