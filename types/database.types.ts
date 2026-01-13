/**
 * Database types for Chatbot application
 * Generated from Supabase schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          folder_id: string | null
          title: string
          preview: string | null
          pinned: boolean
          message_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          folder_id?: string | null
          title?: string
          preview?: string | null
          pinned?: boolean
          message_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          folder_id?: string | null
          title?: string
          preview?: string | null
          pinned?: boolean
          message_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at: string
          edited_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          created_at?: string
          edited_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: 'user' | 'assistant' | 'system'
          content?: string
          created_at?: string
          edited_at?: string | null
        }
      }
      templates: {
        Row: {
          id: string
          user_id: string
          name: string
          content: string
          snippet: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          content: string
          snippet?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          content?: string
          snippet?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Type helpers for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Folder = Database['public']['Tables']['folders']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Template = Database['public']['Tables']['templates']['Row']

export type InsertProfile = Database['public']['Tables']['profiles']['Insert']
export type InsertFolder = Database['public']['Tables']['folders']['Insert']
export type InsertConversation = Database['public']['Tables']['conversations']['Insert']
export type InsertMessage = Database['public']['Tables']['messages']['Insert']
export type InsertTemplate = Database['public']['Tables']['templates']['Insert']

export type UpdateProfile = Database['public']['Tables']['profiles']['Update']
export type UpdateFolder = Database['public']['Tables']['folders']['Update']
export type UpdateConversation = Database['public']['Tables']['conversations']['Update']
export type UpdateMessage = Database['public']['Tables']['messages']['Update']
export type UpdateTemplate = Database['public']['Tables']['templates']['Update']

// Extended types with relations
export type ConversationWithMessages = Conversation & {
  messages: Message[]
  folder?: Folder | null
}

export type ConversationSummary = Pick<
  Conversation,
  'id' | 'title' | 'preview' | 'pinned' | 'message_count' | 'updated_at' | 'folder_id'
>
